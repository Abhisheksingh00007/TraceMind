import re
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

print("🚀 Initializing TraceMind Neural Core (BERT) from Hugging Face...")

try:
    model_path = "Abhisheksingh007/tracemind-bert-hinglish"
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    bert_ready = True
    print("✅ BERT Model Synced from Cloud Successfully!")
except Exception as e:
    print(f"❌ Error loading BERT model: {e}")
    bert_ready = False
    tokenizer = None
    model = None

def process_hinglish(text):
    text = str(text).lower().strip()
    
    mapping = {
        "khud ko marne": "suicidal intent self harm", 
        "apne aap ko marne": "suicidal intent",
        "marne ka mann": "suicidal thoughts", 
        "marna chahta": "suicidal intent",
        "kuchh kar lunga": "self harm suicidal intent", 
        "sab kuch khatam": "everything is finished hopeless",
        "zehar": "suicide poison", 
        "jaan de dunga": "suicidal intent",
        "kisi ko marne": "homicidal violent intent", 
        "jaan se maar": "violent threat murder",
        "maar dunga": "violent threat", 
        "pareshan": "distressed troubled",
        "load": "stress pressure", 
        "neend nahi": "insomnia sleep deprivation",
        "akela": "lonely isolated", 
        "tension": "anxiety stress",
        "mann nahi lagta": "loss of interest anhedonia", 
        "himmat nahi": "hopelessness"
    }
    
    for slang, formal in mapping.items():
        text = text.replace(slang, formal)
        
    text = re.sub(r'[^a-z\s]', '', text)
    return text.strip()

def analyze_with_bert(text):
    if not bert_ready or not text:
        return "normal", 0.0
        
    inputs = tokenizer(
        text, 
        return_tensors="pt", 
        truncation=True, 
        padding="max_length", 
        max_length=128
    )
    
    with torch.no_grad():
        outputs = model(**inputs)
        
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]
    confidence = float(torch.max(probs))
    predicted_class_id = int(torch.argmax(probs))
    
    prediction = "suicide" if predicted_class_id == 1 else "normal"
    
    return prediction, confidence