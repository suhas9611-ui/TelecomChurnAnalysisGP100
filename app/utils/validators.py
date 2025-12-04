"""Data Validation Utilities"""
import pandas as pd
import pickle
from pathlib import Path
from .logger import logger

class DataValidator:
    @staticmethod
    def validate_csv(file_path, required_columns=None):
        try:
            if not Path(file_path).exists():
                return False, None, f"File not found: {file_path}"
            
            df = pd.read_csv(file_path)
            logger.info(f"Successfully loaded CSV: {file_path} ({len(df)} rows)")
            
            if df.empty:
                return False, None, "CSV file is empty"
            
            if required_columns:
                missing_cols = [col for col in required_columns if col not in df.columns]
                if missing_cols:
                    return False, None, f"Missing columns: {', '.join(missing_cols)}"
            
            return True, df, None
        except Exception as e:
            return False, None, f"Error reading CSV: {str(e)}"
    
    @staticmethod
    def validate_model(model_path):
        try:
            if not Path(model_path).exists():
                return False, None, f"Model file not found: {model_path}"
            
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            logger.info(f"Successfully loaded model: {model_path}")
            
            required_keys = ['model', 'encoders', 'columns']
            missing_keys = [key for key in required_keys if key not in model_data]
            
            if missing_keys:
                return False, None, f"Model missing keys: {', '.join(missing_keys)}"
            
            return True, model_data, None
        except Exception as e:
            return False, None, f"Error loading model: {str(e)}"
    
    @staticmethod
    def validate_churn_column(df, churn_column):
        if churn_column not in df.columns:
            return False, f"Churn column '{churn_column}' not found"
        
        if df[churn_column].isna().all():
            return False, f"Churn column contains only null values"
        
        return True, None
    
    @staticmethod
    def sanitize_dataframe(df):
        df = df.dropna(how='all')
        logger.info(f"Dataframe sanitized: {len(df)} rows remaining")
        return df

class PredictionValidator:
    @staticmethod
    def validate_input_data(input_data, required_columns):
        if not input_data:
            return False, "No input data provided"
        
        missing = [col for col in required_columns if col not in input_data]
        if missing:
            return False, f"Missing fields: {', '.join(missing)}"
        
        return True, None
