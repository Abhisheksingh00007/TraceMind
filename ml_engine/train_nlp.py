import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import time

print(" TraceMind Training Module: Initializing...")

try:
    df = pd.read_csv('Cleaned_Project_Data.csv')
    print(f" Cleaned Dataset Loaded: {len(df)} rows found.")
except FileNotFoundError:
    print(" Error: Cleaned dataset not found. Please execute data_cleaner.py first.")
    exit()

X = df['clean_text']
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)


print(" Vectorizing text data (TF-IDF with N-Grams)...")
tfidf = TfidfVectorizer(ngram_range=(1, 3), max_features=10000) 
X_train_tfidf = tfidf.fit_transform(X_train)
X_test_tfidf = tfidf.transform(X_test)


print(" Training Random Forest Classifier... (This may take a few minutes)")
start_time = time.time()
model = RandomForestClassifier(n_estimators=100, n_jobs=-1, random_state=42)
model.fit(X_train_tfidf, y_train)
end_time = time.time()


print(f" Training Complete in {round(end_time - start_time, 2)} seconds.")
predictions = model.predict(X_test_tfidf)
print("\n --- MODEL PERFORMANCE REPORT ---")
print(f"Accuracy: {round(accuracy_score(y_test, predictions) * 100, 2)}%")
print(classification_report(y_test, predictions))


print(" Saving Smart Context-Aware Model & Vectorizer to disk...")
joblib.dump(model, 'nlp_model.pkl')
joblib.dump(tfidf, 'nlp_vectorizer.pkl')
print(" Success! 'nlp_model.pkl' and 'nlp_vectorizer.pkl' are ready for deployment.")