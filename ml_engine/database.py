import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "TraceMindDB")

def get_database():
    if not MONGO_URI:
        return None
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        client.admin.command('ping')
        print(" Database: Connected to MongoDB Atlas successfully!")
        return db
    except Exception as e:
        print(f" Database Error: {e}")
        return None

db = get_database()
history_collection = db['patient_history'] if db is not None else None
users_collection = db['users'] if db is not None else None
settings_collection = db['user_settings'] if db is not None else None