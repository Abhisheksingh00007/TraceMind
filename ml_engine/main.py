import os
import datetime
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from dotenv import load_dotenv

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

load_dotenv()

from schemas import PatientData, UserSignup, UserLogin
from database import history_collection, users_collection, settings_collection
from auth import get_password_hash, verify_password, create_access_token, verify_token
from ml_engine import analyze_with_bert, process_hinglish

app = FastAPI(title="TraceMind Core API")

origins = [
    "http://localhost:3000",
    "https://tracemind.netlify.app",
    "https://abhisheksingh007-tracemind.hf.space"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserSettingsUpdate(BaseModel):
    dob: Optional[str] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    reminders_enabled: Optional[bool] = None

class QuestionRequest(BaseModel):
    email: str

class VerifyAnswerRequest(BaseModel):
    email: str
    answer: str

class ResetPasswordSQRequest(BaseModel):
    email: str
    answer: str
    new_password: str

class GoogleToken(BaseModel):
    token: str

@app.get("/")
async def root():
    return {"status": "success", "message": "Neural Core is online"}

@app.post("/signup")
async def signup(user: UserSignup):
    if users_collection is None:
        return {"status": "error", "message": "Database connection error."}
        
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        return {"status": "error", "message": "Email is already registered!"}
        
    hashed_pw = get_password_hash(user.password)
    hashed_answer = get_password_hash(user.security_answer.lower().strip())
    
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_pw,
        "security_question": user.security_question,
        "security_answer": hashed_answer,
        "created_at": datetime.datetime.now()
    }
    users_collection.insert_one(new_user)
    return {"status": "success", "message": "Account created successfully!"}

@app.post("/login")
async def login(user: UserLogin):
    if users_collection is None:
        return {"status": "error", "message": "Database connection error."}
        
    db_user = users_collection.find_one({"email": user.email})
    if not db_user:
        return {"status": "error", "message": "User not found!"}
        
    if not verify_password(user.password, db_user["password"]):
        return {"status": "error", "message": "Incorrect password!"}
        
    access_token = create_access_token(data={"sub": str(db_user["_id"]), "email": db_user["email"]})
    
    return {
        "status": "success",
        "access_token": access_token,
        "token_type": "bearer",
        "name": db_user["name"],
        "email": db_user["email"]
    }

@app.post("/google-login")
async def google_login(data: GoogleToken):
    if users_collection is None:
        return {"status": "error", "message": "Database connection error."}
        
    try:
        CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        if not CLIENT_ID:
            return {"status": "error", "message": "Google Client ID not configured on server."}

        idinfo = id_token.verify_oauth2_token(data.token, google_requests.Request(), CLIENT_ID)
        email = idinfo['email']
        name = idinfo.get('name', 'Google User')

        db_user = users_collection.find_one({"email": email})
        
        if not db_user:
            new_user = {
                "name": name,
                "email": email,
                "password": "GOOGLE_SSO_USER", 
                "created_at": datetime.datetime.now()
            }
            result = users_collection.insert_one(new_user)
            user_id = str(result.inserted_id)
        else:
            user_id = str(db_user["_id"])

        access_token = create_access_token(data={"sub": user_id, "email": email})
        
        return {
            "status": "success",
            "access_token": access_token,
            "token_type": "bearer",
            "name": name,
            "email": email
        }
    except ValueError:
        return {"status": "error", "message": "Invalid Google Auth Token"}
    except Exception as e:
        return {"status": "error", "message": f"Server Error: {str(e)}"}

@app.post("/get-security-question")
async def get_question(req: QuestionRequest):
    if users_collection is None:
        return {"status": "error", "message": "Database error."}
        
    user = users_collection.find_one({"email": req.email})
    if not user or "security_question" not in user:
        return {"status": "error", "message": "No security question found for this account."}
    
    return {"status": "success", "question": user["security_question"]}

@app.post("/verify-security-answer")
async def verify_answer(req: VerifyAnswerRequest):
    if users_collection is None:
        return {"status": "error", "message": "Database error."}
        
    user = users_collection.find_one({"email": req.email})
    if not user:
        return {"status": "error", "message": "User not found."}
    
    if verify_password(req.answer.lower().strip(), user["security_answer"]):
        return {"status": "success", "message": "Identity verified."}
    
    return {"status": "error", "message": "Incorrect security answer."}

@app.post("/reset-password-sq")
async def reset_password_sq(req: ResetPasswordSQRequest):
    if users_collection is None:
        return {"status": "error", "message": "Database error."}
        
    user = users_collection.find_one({"email": req.email})
    if not user:
        return {"status": "error", "message": "User not found."}
    
    if verify_password(req.answer.lower().strip(), user["security_answer"]):
        hashed_pw = get_password_hash(req.new_password)
        users_collection.update_one({"email": req.email}, {"$set": {"password": hashed_pw}})
        return {"status": "success", "message": "Password updated successfully!"}
    
    return {"status": "error", "message": "Security verification failed."}

@app.post("/analyze")
async def analyze(data: PatientData, request: Request):
    user_email = verify_token(request)
    raw_input = data.narrative.lower()
    
    word_count = len(raw_input.split())
    
    red_flags = [
        "suicide", "suicidal", "zehar", "poison", "marne", "marna", "marjau",
        "mar jau", "jaan de", "khud ko mar", "kisi ko mar", "jaan se maar"
    ]
    
    words = raw_input.replace(".", " ").replace(",", " ").split()
    has_kuch = any(w in words for w in ["kuch", "kuchh", "kch", "kuchha"])
    has_kar = any(w in words for w in ["kar", "kr", "krlu"])
    has_intent = any(w in words for w in ["lunga", "luga", "lene", "leni", "lu"])
    has_end = "khatam" in raw_input or "end" in raw_input
    
    trigger_found = any(flag in raw_input for flag in red_flags) or (has_kuch and has_kar and has_intent) or has_end
    
    processed_text = process_hinglish(raw_input)
    
    prediction, confidence = analyze_with_bert(processed_text)
            
    is_valid_input = trigger_found or (word_count >= 3 and confidence >= 0.75)
    effective_prediction = prediction if is_valid_input else None
    
    try:
        bmi = round(data.weight / ((data.height / 100) ** 2), 1)
    except: 
        bmi = 0

    risk_level = "LOW"
    
    if not is_valid_input:
        nlp_status = "Insufficient Data for Sentiment Analysis"
    else:
        nlp_status = "Feeling Okay / Normal"

    if trigger_found or effective_prediction == "suicide" or data.phq9_score >= 15:
        risk_level = "HIGH"
        if "kisi ko" in raw_input or "jaan se maar" in raw_input:
            nlp_status = "Anger or Threat Detected"
        else:
            nlp_status = "Feeling Very Low / High Stress"
            
    elif data.phq9_score >= 10 or data.gad7_score >= 10 or effective_prediction in ["depression", "anxiety"]:
        risk_level = "MODERATE"
        nlp_status = "Feeling Anxious or Stressed"
        
    elif data.phq9_score >= 5 or data.gad7_score >= 5 or data.sleep_hours <= 5:
        risk_level = "MODERATE"
        nlp_status = "A Bit Tired or Overwhelmed"

    if risk_level == "HIGH":
        if "Anger" in nlp_status:
            suggestions = [
                "Please stop and take a deep breath. It's important to stay calm.",
                "Talk to a trusted family member or friend right away.",
                "Call a doctor or an emergency helpline immediately for support."
            ]
        else:
            suggestions = [
                "You seem to be going through a really tough time right now.",
                "Please don't stay alone. Talk to someone you trust.",
                "We strongly advise you to speak with a doctor or a helpline today."
            ]
    elif risk_level == "MODERATE":
        suggestions = [
            "You are carrying a lot of stress. Talking to a counselor can really help.",
            "Try doing things that relax your mind, like listening to music or taking a walk.",
            "Make sure you get 7-8 hours of sleep to help your brain rest."
        ]
    else:
        suggestions = [
            "You seem to be doing fine! Keep up your good daily habits.",
            "Eat healthy food and try to stay active.",
            "Make sure you get enough sleep every night."
        ]
    
    past_session_count = 0
    if history_collection is not None:
        past_records = list(history_collection.find({"user_email": user_email}).sort("timestamp", 1))
        past_session_count = len(past_records)
        
        if past_session_count > 0:
            past_phq9_scores = [rec.get("phq9_score", 0) for rec in past_records]
            past_gad7_scores = [rec.get("gad7_score", 0) for rec in past_records]
            
            avg_past_phq9 = sum(past_phq9_scores) / past_session_count
            avg_past_gad7 = sum(past_gad7_scores) / past_session_count
            
            if avg_past_phq9 >= 12 and data.phq9_score >= 15:
                risk_level = "HIGH"
                nlp_status = "Long-Term Stress Detected"
                suggestions = [
                    "You have been feeling low for a while. You deserve extra care.",
                    "Please book an appointment with a doctor or therapist soon.",
                    "Don't give up. Professional help can make you feel much better."
                ]
                
            elif data.phq9_score > (avg_past_phq9 + 6) or data.gad7_score > (avg_past_gad7 + 6):
                if risk_level == "LOW": 
                    risk_level = "MODERATE"
                elif risk_level == "MODERATE" and data.phq9_score >= 10:
                    risk_level = "HIGH"
                    
                nlp_status = "Sudden Increase in Stress"
                suggestions = [
                    "Your stress levels have gone up suddenly today.",
                    "Try to find out what triggered this feeling.",
                    "Take a break from work or screens and try to relax your mind."
                ]
                
            elif avg_past_phq9 >= 10 and data.phq9_score <= 5 and data.gad7_score <= 5:
                nlp_status = "Feeling Much Better"
                suggestions = [
                    "Great job! You are feeling much better than your past assessments.",
                    "Whatever good habits you are following right now, keep doing them!",
                    "Enjoy your day and keep your mind relaxed."
                ]

    if history_collection is not None:
        try:
            record = {
                "user_email": user_email, 
                "timestamp": datetime.datetime.now(),
                "patient_age": data.age,
                "patient_gender": data.gender,
                "height": data.height,
                "weight": data.weight,
                "heart_rate": data.heart_rate,
                "sleep_hours": data.sleep_hours,
                "clinical_narrative": raw_input,
                "phq9_score": data.phq9_score,
                "gad7_score": data.gad7_score,
                "detected_risk_level": risk_level,
                "nlp_analysis": nlp_status
            }
            history_collection.insert_one(record)
        except Exception as e:
            pass

    return {
        "risk_level": risk_level,
        "bmi": str(bmi),
        "symptoms_analyzed": len(data.symptoms) + 4,
        "nlp_detection": nlp_status,
        "suggestions": suggestions
    }

@app.get("/history")
async def get_history(request: Request):
    user_email = verify_token(request)
    if history_collection is not None:
        records = list(history_collection.find({"user_email": user_email}, {"_id": 0}).sort("timestamp", -1))
        return {"status": "success", "data": records}
    return {"status": "error", "message": "Database connection error"}

@app.post("/update-settings")
async def update_settings(settings: UserSettingsUpdate, request: Request):
    user_email = verify_token(request)
    if settings_collection is not None:
        update_data = {k: v for k, v in settings.dict().items() if v is not None}
        update_data["updated_at"] = datetime.datetime.now()
        settings_collection.update_one(
            {"user_email": user_email},
            {"$set": update_data},
            upsert=True
        )
        return {"status": "success", "message": "Preferences saved to cloud."}
    return {"status": "error", "message": "Database connection error"}

@app.get("/sync-profile")
async def sync_profile(request: Request):
    user_email = verify_token(request)
    if history_collection is None or settings_collection is None:
        return {"status": "error", "message": "Database connection error"}
    user_settings = settings_collection.find_one({"user_email": user_email}, {"_id": 0}) or {}
    last_assessment = history_collection.find_one({"user_email": user_email}, {"_id": 0}, sort=[("timestamp", -1)]) or {}
    profile = {
        "age": "", "dob": "", "gender": "", "height": "", "weight": "",
        "heart_rate": "", "sleep_hours": "", "phq9_score": "", "gad7_score": ""
    }
    if last_assessment:
        profile.update({
            "heart_rate": last_assessment.get("heart_rate", ""),
            "sleep_hours": last_assessment.get("sleep_hours", ""),
            "phq9_score": last_assessment.get("phq9_score", ""),
            "gad7_score": last_assessment.get("gad7_score", ""),
            "gender": last_assessment.get("patient_gender", ""),
            "height": last_assessment.get("height", ""),
            "weight": last_assessment.get("weight", ""),
            "age": str(last_assessment.get("patient_age", ""))
        })
    if user_settings:
        for field in ["gender", "height", "weight", "dob"]:
            if user_settings.get(field): profile[field] = user_settings[field]
        if user_settings.get("dob"):
            try:
                profile["age"] = str(datetime.datetime.now().year - int(user_settings["dob"].split("-")[0]))
            except: pass
    return {"status": "success", "data": profile}

@app.delete("/delete-account")
async def delete_account(request: Request):
    user_email = verify_token(request)
    if users_collection is None:
        return {"status": "error", "message": "Database connection error"}
    try:
        users_collection.delete_one({"email": user_email})
        settings_collection.delete_one({"user_email": user_email})
        history_collection.delete_many({"user_email": user_email})
        return {"status": "success", "message": "Account and all data deleted permanently."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=7860, reload=True)