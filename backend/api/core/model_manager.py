"""Model Management Module"""
import pandas as pd
from app.utils.validators import DataValidator, PredictionValidator
from app.utils.logger import logger
from app.utils.config_loader import config

class ModelManager:
    def __init__(self):
        self.validator = DataValidator()
        self.pred_validator = PredictionValidator()
        self.model = None
        self.encoders = None
        self.model_columns = None
    
    def load_model(self, model_path=None):
        if model_path is None:
            model_path = config.get_path('paths.model')
        
        logger.info(f"Loading model from: {model_path}")
        
        is_valid, model_data, error = self.validator.validate_model(model_path)
        
        if not is_valid:
            logger.error(f"Failed to load model: {error}")
            return False, error
        
        self.model = model_data.get('model')
        self.encoders = model_data.get('encoders', {})
        self.model_columns = model_data.get('columns', [])
        
        logger.info(f"Model loaded successfully with {len(self.model_columns)} features")
        return True, None
    
    def predict(self, input_data):
        if self.model is None:
            return False, None, "Model not loaded"
        
        try:
            # Create a copy to avoid modifying original
            processed_data = input_data.copy()
            
            # Add default values for columns that model expects but shouldn't be user inputs
            if 'CustomerID' in self.model_columns and 'CustomerID' not in processed_data:
                processed_data['CustomerID'] = 'CUST000000'
            if 'ChurnProb' in self.model_columns and 'ChurnProb' not in processed_data:
                processed_data['ChurnProb'] = 0.0
            
            # Validate that we have all required columns
            is_valid, error = self.pred_validator.validate_input_data(
                processed_data, self.model_columns
            )
            
            if not is_valid:
                logger.error(f"Invalid prediction input: {error}")
                logger.error(f"Required columns: {self.model_columns}")
                logger.error(f"Provided columns: {list(processed_data.keys())}")
                return False, None, error
            
            # Convert numeric strings to appropriate types
            for col, value in processed_data.items():
                # Try to convert to numeric if it's a string representation of a number
                if isinstance(value, str) and col not in ['CustomerID', 'customer_id', 'customerId']:
                    try:
                        # Try float conversion
                        processed_data[col] = float(value)
                    except (ValueError, TypeError):
                        # Keep as string if conversion fails (categorical data)
                        pass
            
            # Validate input ranges and values
            is_valid_range, range_error = self.pred_validator.validate_input_ranges(processed_data)
            
            if not is_valid_range:
                logger.error(f"Input validation failed: {range_error}")
                return False, None, f"Validation Error: {range_error}"
            
            # Create DataFrame
            df_input = pd.DataFrame([processed_data])
            
            # Log input data before encoding
            logger.info(f"Input data before encoding: {processed_data}")
            
            # Handle "None" values BEFORE encoding - replace with first valid class
            for col in df_input.columns:
                if col in self.encoders:
                    original_value = df_input[col].iloc[0]
                    
                    # Handle "None" values - use the first class as default
                    if str(original_value).lower() == 'none' or original_value == '' or original_value is None:
                        # Get the first class from encoder as default
                        first_class = self.encoders[col].classes_[0]
                        df_input[col] = first_class
                        logger.info(f"Column '{col}': Replaced 'None' with default '{first_class}'")
            
            # Now apply encoders to ALL categorical columns
            for col in df_input.columns:
                if col in self.encoders:
                    original_value = df_input[col].iloc[0]
                    
                    try:
                        # Use the trained encoder to transform this column
                        encoded_value = self.encoders[col].transform(df_input[col])
                        df_input[col] = encoded_value
                        logger.info(f"Encoded column '{col}': '{original_value}' → {encoded_value[0]}")
                    except Exception as e:
                        logger.warning(f"Failed to encode column '{col}' with value '{original_value}': {e}")
                        # Special handling for CustomerID
                        if col == 'CustomerID':
                            try:
                                cust_id = df_input[col].iloc[0]
                                if isinstance(cust_id, str) and cust_id.startswith('CUST'):
                                    numeric_id = int(cust_id.replace('CUST', ''))
                                    df_input[col] = numeric_id
                                    logger.info(f"CustomerID extracted: {numeric_id}")
                                else:
                                    df_input[col] = 0
                                    logger.warning(f"CustomerID defaulted to 0")
                            except:
                                df_input[col] = 0
                                logger.warning(f"CustomerID defaulted to 0 (error)")
                        # For other categorical columns, use first encoded value
                        else:
                            df_input[col] = 0
                            logger.warning(f"Column '{col}' defaulted to 0 due to encoding failure")
            
            # Ensure columns are in the same order as model expects
            df_input = df_input[self.model_columns]
            
            prediction = self.model.predict(df_input)[0]
            probability = self.model.predict_proba(df_input)[0]
            
            result = {
                'prediction': int(prediction),
                'probability': float(probability[1]),
                'confidence': float(max(probability))
            }
            
            logger.info(f"Prediction made: {result}")
            return True, result, None
            
        except Exception as e:
            error = f"Prediction error: {str(e)}"
            logger.error(error)
            logger.error(f"Input data: {input_data}")
            logger.error(f"Model columns: {self.model_columns}")
            return False, None, error
    
    def get_categorical_options(self, column_name):
        if column_name in self.encoders:
            return list(self.encoders[column_name].classes_)
        return []
