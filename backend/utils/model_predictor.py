"""
Machine Learning model predictor for churn analysis
"""
import pandas as pd
import numpy as np
import joblib
import os
from pathlib import Path
import logging
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler

logger = logging.getLogger(__name__)

class ModelPredictor:
    """Handles churn prediction using machine learning models"""
    
    def __init__(self):
        self.model_path = Path(os.getenv('MODEL_PATH', 'backend/models/churn_model.pkl'))
        self.model = None
        self.label_encoders = {}
        self.scaler = None
        self.feature_columns = None
        self._load_or_create_model()
    
    def _load_or_create_model(self):
        """Load existing model or create a new one"""
        try:
            if self.model_path.exists():
                model_data = joblib.load(self.model_path)
                self.model = model_data['model']
                self.label_encoders = model_data.get('label_encoders', {})
                self.scaler = model_data.get('scaler', None)
                self.feature_columns = model_data.get('feature_columns', None)
                logger.info("Model loaded successfully")
            else:
                self._create_sample_model()
                logger.info("Created sample model")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            self._create_sample_model()
    
    def _create_sample_model(self):
        """Create a sample model for demonstration"""
        # Create a simple model with basic features
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        
        # Define expected feature columns
        self.feature_columns = [
            'tenure', 'MonthlyCharges', 'TotalCharges', 'SeniorCitizen',
            'gender_encoded', 'Partner_encoded', 'Dependents_encoded',
            'PhoneService_encoded', 'InternetService_encoded', 'Contract_encoded',
            'PaperlessBilling_encoded', 'PaymentMethod_encoded'
        ]
        
        # Create sample training data
        np.random.seed(42)
        n_samples = 1000
        
        X_sample = np.random.randn(n_samples, len(self.feature_columns))
        y_sample = np.random.choice([0, 1], n_samples, p=[0.73, 0.27])
        
        # Train the model
        self.model.fit(X_sample, y_sample)
        
        # Create label encoders for categorical variables
        categorical_features = [
            'gender', 'Partner', 'Dependents', 'PhoneService', 
            'InternetService', 'Contract', 'PaperlessBilling', 'PaymentMethod'
        ]
        
        for feature in categorical_features:
            self.label_encoders[feature] = LabelEncoder()
            # Fit with sample data
            if feature == 'gender':
                self.label_encoders[feature].fit(['Male', 'Female'])
            elif feature in ['Partner', 'Dependents', 'PhoneService', 'PaperlessBilling']:
                self.label_encoders[feature].fit(['Yes', 'No'])
            elif feature == 'InternetService':
                self.label_encoders[feature].fit(['DSL', 'Fiber optic', 'No'])
            elif feature == 'Contract':
                self.label_encoders[feature].fit(['Month-to-month', 'One year', 'Two year'])
            elif feature == 'PaymentMethod':
                self.label_encoders[feature].fit([
                    'Electronic check', 'Mailed check', 
                    'Bank transfer (automatic)', 'Credit card (automatic)'
                ])
        
        # Save the model
        self._save_model()
    
    def _save_model(self):
        """Save the model and encoders"""
        try:
            # Ensure directory exists
            self.model_path.parent.mkdir(parents=True, exist_ok=True)
            
            model_data = {
                'model': self.model,
                'label_encoders': self.label_encoders,
                'scaler': self.scaler,
                'feature_columns': self.feature_columns
            }
            
            joblib.dump(model_data, self.model_path)
            logger.info(f"Model saved to {self.model_path}")
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")
    
    def _preprocess_features(self, data):
        """Preprocess features for prediction"""
        try:
            # Convert to DataFrame if it's a dict
            if isinstance(data, dict):
                df = pd.DataFrame([data])
            else:
                df = data.copy()
            
            # Handle missing values
            numeric_columns = ['tenure', 'MonthlyCharges', 'TotalCharges', 'SeniorCitizen']
            for col in numeric_columns:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
            
            # Encode categorical variables
            categorical_features = [
                'gender', 'Partner', 'Dependents', 'PhoneService', 
                'InternetService', 'Contract', 'PaperlessBilling', 'PaymentMethod'
            ]
            
            for feature in categorical_features:
                if feature in df.columns and feature in self.label_encoders:
                    try:
                        # Handle unknown categories
                        df[f'{feature}_encoded'] = df[feature].apply(
                            lambda x: self._safe_encode(feature, x)
                        )
                    except Exception as e:
                        logger.warning(f"Error encoding {feature}: {str(e)}")
                        df[f'{feature}_encoded'] = 0
                else:
                    df[f'{feature}_encoded'] = 0
            
            # Select only the features used by the model
            feature_df = pd.DataFrame()
            for col in self.feature_columns:
                if col in df.columns:
                    feature_df[col] = df[col]
                else:
                    feature_df[col] = 0  # Default value for missing features
            
            return feature_df.values
            
        except Exception as e:
            logger.error(f"Error preprocessing features: {str(e)}")
            # Return default feature vector
            return np.zeros((1 if isinstance(data, dict) else len(data), len(self.feature_columns)))
    
    def _safe_encode(self, feature, value):
        """Safely encode categorical value"""
        try:
            encoder = self.label_encoders[feature]
            if value in encoder.classes_:
                return encoder.transform([value])[0]
            else:
                # Return the most common class (usually 0)
                return 0
        except:
            return 0
    
    def predict_single(self, customer_data):
        """Predict churn for a single customer"""
        try:
            # Preprocess the data
            features = self._preprocess_features(customer_data)
            
            # Make prediction
            churn_probability = self.model.predict_proba(features)[0][1]
            
            # Get feature importance
            feature_importance = dict(zip(
                self.feature_columns, 
                self.model.feature_importances_
            ))
            
            # Sort by importance
            feature_importance = dict(sorted(
                feature_importance.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:5])  # Top 5 features
            
            return {
                'churn_probability': float(churn_probability),
                'confidence': float(np.random.uniform(0.75, 0.95)),  # Mock confidence
                'feature_importance': feature_importance,
                'prediction_date': pd.Timestamp.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error predicting single customer: {str(e)}")
            return {
                'churn_probability': 0.5,
                'confidence': 0.5,
                'feature_importance': {},
                'error': str(e)
            }
    

    
    def get_model_info(self):
        """Get information about the loaded model"""
        return {
            'model_type': type(self.model).__name__,
            'feature_count': len(self.feature_columns) if self.feature_columns else 0,
            'features': self.feature_columns,
            'encoders': list(self.label_encoders.keys()) if self.label_encoders else []
        }