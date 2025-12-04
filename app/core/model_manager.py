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
        
        is_valid, error = self.pred_validator.validate_input_data(
            input_data, self.model_columns
        )
        
        if not is_valid:
            logger.error(f"Invalid prediction input: {error}")
            return False, None, error
        
        try:
            df_input = pd.DataFrame([input_data])
            
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
            return False, None, error
    
    def get_categorical_options(self, column_name):
        if column_name in self.encoders:
            return list(self.encoders[column_name].classes_)
        return []
