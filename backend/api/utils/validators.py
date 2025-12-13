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
    # Define validation rules based on training data
    VALIDATION_RULES = {
        'Age': {'min': 18, 'max': 100, 'type': 'numeric'},
        'TenureMonths': {'min': 0, 'max': 120, 'type': 'numeric'},
        'MonthlyCharges': {'min': 0, 'max': 2000, 'type': 'numeric'},
        'TotalCharges': {'min': 0, 'max': 150000, 'type': 'numeric'},
        'SupportCallsLast90d': {'min': 0, 'max': 50, 'type': 'numeric'},
        'AvgDownlinkMbps': {'min': 0, 'max': 1000, 'type': 'numeric'},
    }
    
    CATEGORICAL_VALUES = {
        'Gender': ['Male', 'Female', 'None'],
        'PlanType': ['Prepaid', 'Postpaid', 'None'],
        'ContractType': ['Month-to-month', 'One year', 'Two year', 'None'],
        'PhoneService': ['Yes', 'No', 'None'],
        'MultipleLines': ['Yes', 'No', 'None'],
        'InternetService': ['DSL', 'Fiber', 'None'],
        'OnlineSecurity': ['Yes', 'No', 'None'],
        'OnlineBackup': ['Yes', 'No', 'None'],
        'DeviceProtection': ['Yes', 'No', 'None'],
        'TechSupport': ['Yes', 'No', 'None'],
        'PaymentMethod': ['UPI', 'Card', 'Wallet', 'BankTransfer', 'None'],
        'Region': ['North', 'South', 'East', 'West', 'None']
    }
    
    @staticmethod
    def validate_input_data(input_data, required_columns):
        if not input_data:
            return False, "No input data provided"
        
        missing = [col for col in required_columns if col not in input_data]
        if missing:
            return False, f"Missing fields: {', '.join(missing)}"
        
        return True, None
    
    @staticmethod
    def validate_input_ranges(input_data):
        """Validate that input values are within acceptable ranges"""
        errors = []
        
        # Validate CustomerID format and range
        if 'CustomerID' in input_data:
            cust_id = str(input_data['CustomerID'])
            if cust_id.startswith('CUST'):
                try:
                    # Extract numeric part
                    numeric_part = int(cust_id.replace('CUST', ''))
                    # CustomerIDs in training data range from CUST100000 to approximately CUST110000
                    if numeric_part < 100000:
                        errors.append(
                            f"CustomerID {cust_id} is below minimum allowed value CUST100000"
                        )
                    elif numeric_part > 200000:
                        errors.append(
                            f"CustomerID {cust_id} exceeds maximum allowed value CUST200000"
                        )
                except (ValueError, TypeError):
                    errors.append(
                        f"CustomerID {cust_id} has invalid format. Expected format: CUSTXXXXXX"
                    )
            elif cust_id.lower() != 'none' and cust_id != '':
                errors.append(
                    f"CustomerID {cust_id} has invalid format. Expected format: CUSTXXXXXX"
                )
        
        # Validate numeric fields
        for field, rules in PredictionValidator.VALIDATION_RULES.items():
            if field in input_data:
                value = input_data[field]
                
                # Skip if not numeric (might be string that needs conversion)
                if not isinstance(value, (int, float)):
                    try:
                        value = float(value)
                    except (ValueError, TypeError):
                        continue
                
                # Check min/max bounds
                if value < rules['min']:
                    errors.append(
                        f"{field} value {value} is below minimum allowed value {rules['min']}"
                    )
                elif value > rules['max']:
                    errors.append(
                        f"{field} value {value} exceeds maximum allowed value {rules['max']}"
                    )
        
        # Validate categorical fields
        for field, valid_values in PredictionValidator.CATEGORICAL_VALUES.items():
            if field in input_data:
                value = input_data[field]
                
                # Skip if value is None, empty, or the string "None" (user selected None option)
                if value is None or value == '' or str(value).lower() == 'none':
                    continue
                
                # Check if value is in allowed list
                if str(value) not in valid_values:
                    errors.append(
                        f"{field} value '{value}' is not valid. Allowed values: {', '.join(valid_values)}"
                    )
        
        if errors:
            return False, "; ".join(errors)
        
        return True, None
