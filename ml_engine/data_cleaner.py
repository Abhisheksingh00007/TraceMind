import pandas as pd
import re
import os

def clean_pipeline():
    print("🚀 Initializing Data Cleaning Pipeline...")
    input_file = 'raw_data/raw_mental_health_data.csv' 
    if not os.path.exists(input_file):
        print(f"❌ Error: {input_file} nahi mili!")
        return

    df = pd.read_csv(input_file, low_memory=False)
    initial_count = len(df)
    print(f"📊 Total Rows Loaded: {initial_count}")

    def heavy_cleaner(text):
        if pd.isna(text): return None
        
        text = str(text).lower()
        
        if len(text.split()) < 10:
            return None

        forbidden_words = ['fuck', 'fucken', 'fucked', 'porn', 'sex', 'nude', 'shit', 'asshole', 'bitch']
        for word in forbidden_words:
            if word in text:
                return None 

        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        return text.strip()

    print("🧹 Scrubbing data and applying clinical filters...")
    
    df['clean_text'] = df['text'].apply(heavy_cleaner)

    df.dropna(subset=['clean_text'], inplace=True)
    
    if 'class' in df.columns:
        df.rename(columns={'class': 'label'}, inplace=True)

    output_file = 'Cleaned_Project_Data.csv'
    df[['clean_text', 'label']].to_csv(output_file, index=False)

    final_count = len(df)
    print(f"✨ Cleaning Complete!")
    print(f"📉 Rows removed: {initial_count - final_count}")
    print(f"✅ Final Dataset: {final_count} rows saved as '{output_file}'")

if __name__ == "__main__":
    clean_pipeline()