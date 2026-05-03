from pydantic import BaseModel

class PatientData(BaseModel):
    narrative: str
    age: int
    gender: str
    heart_rate: int
    height: int
    weight: int
    sleep_hours: float
    phq9_score: int
    gad7_score: int
    symptoms: list
    
class UserSignup(BaseModel):
    name: str
    email: str
    password: str
    security_question: str  
    security_answer: str    

class UserLogin(BaseModel):
    email: str
    password: str