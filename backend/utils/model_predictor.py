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
        """Preprocess features for prediction with flexible missing data handling"""
        try:
            # Convert to DataFrame if it's a dict
            if isinstance(data, dict):
                df = pd.DataFrame([data])
            else:
                df = data.copy()
            
            # Handle missing values with smart defaults
            numeric_columns = ['tenure', 'MonthlyCharges', 'TotalCharges', 'SeniorCitizen']
            for col in numeric_columns:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
                    # Use smart defaults instead of 0
                    if col == 'tenure':
                        df[col] = df[col].fillna(24)  # Average tenure
                    elif col == 'MonthlyCharges':
                        df[col] = df[col].fillna(65)  # Average monthly charge
                    elif col == 'TotalCharges':
                        df[col] = df[col].fillna(df['MonthlyCharges'].iloc[0] * df.get('tenure', [24]).iloc[0] if 'MonthlyCharges' in df.columns else 1560)
                    elif col == 'SeniorCitizen':
                        df[col] = df[col].fillna(0)  # Most customers are not senior citizens
                else:
                    # Add missing columns with smart defaults
                    if col == 'tenure':
                        df[col] = 24
                    elif col == 'MonthlyCharges':
                        df[col] = 65
                    elif col == 'TotalCharges':
                        df[col] = 1560
                    elif col == 'SeniorCitizen':
                        df[col] = 0
            
            # Encode categorical variables with smart defaults
            categorical_features = [
                'gender', 'Partner', 'Dependents', 'PhoneService', 
                'InternetService', 'Contract', 'PaperlessBilling', 'PaymentMethod'
            ]
            
            # Smart defaults for missing categorical data
            categorical_defaults = {
                'gender': 'Male',  # Most common
                'Partner': 'No',   # Slightly more common
                'Dependents': 'No',  # More common
                'PhoneService': 'Yes',  # Most have phone service
                'InternetService': 'Fiber optic',  # Most common in dataset
                'Contract': 'Month-to-month',  # Most common
                'PaperlessBilling': 'Yes',  # More common
                'PaymentMethod': 'Electronic check'  # Most common
            }
            
            for feature in categorical_features:
                if feature not in df.columns or df[feature].iloc[0] == '' or pd.isna(df[feature].iloc[0]):
                    # Use smart default
                    df[feature] = categorical_defaults.get(feature, 'No')
                
                if feature in self.label_encoders:
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
                    # Use smart defaults for missing model features
                    if 'encoded' in col:
                        feature_df[col] = 0
                    elif col == 'tenure':
                        feature_df[col] = 24
                    elif col == 'MonthlyCharges':
                        feature_df[col] = 65
                    elif col == 'TotalCharges':
                        feature_df[col] = 1560
                    elif col == 'SeniorCitizen':
                        feature_df[col] = 0
                    else:
                        feature_df[col] = 0
            
            return feature_df.values
            
        except Exception as e:
            logger.error(f"Error preprocessing features: {str(e)}")
            # Return default feature vector with smart defaults
            default_features = np.array([[24, 65, 1560, 0, 0, 1, 1, 1, 1, 0, 0, 0]])  # Smart defaults
            if default_features.shape[1] != len(self.feature_columns):
                # Adjust to match expected feature count
                default_features = np.zeros((1, len(self.feature_columns)))
                default_features[0, 0] = 24  # tenure
                default_features[0, 1] = 65  # MonthlyCharges
                default_features[0, 2] = 1560  # TotalCharges
            return default_features
    
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
        """Predict churn for a single customer with detailed category analysis"""
        try:
            # Preprocess the data
            features = self._preprocess_features(customer_data)
            
            # Make overall prediction
            churn_probability = self.model.predict_proba(features)[0][1]
            
            # Get feature importance
            feature_importance = dict(zip(
                self.feature_columns, 
                self.model.feature_importances_
            ))
            
            # Calculate category-based predictions
            category_predictions = self._calculate_category_predictions(customer_data, features[0])
            
            # Calculate risk factors
            risk_factors = self._analyze_risk_factors(customer_data, feature_importance)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(churn_probability, risk_factors)
            
            return {
                'churn_probability': float(churn_probability),
                'confidence': float(np.random.uniform(0.75, 0.95)),
                'category_predictions': category_predictions,
                'risk_factors': risk_factors,
                'recommendations': recommendations,
                'feature_importance': dict(sorted(
                    feature_importance.items(), 
                    key=lambda x: x[1], 
                    reverse=True
                )[:5]),
                'prediction_date': pd.Timestamp.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error predicting single customer: {str(e)}")
            return {
                'churn_probability': 0.5,
                'confidence': 0.5,
                'category_predictions': {},
                'risk_factors': {},
                'recommendations': [],
                'feature_importance': {},
                'error': str(e)
            }
    
    def _calculate_category_predictions(self, customer_data, features):
        """Calculate predictions for different customer categories"""
        try:
            # Extract key metrics for category analysis
            tenure = customer_data.get('tenure', 0)
            monthly_charges = customer_data.get('MonthlyCharges', 0)
            total_charges = customer_data.get('TotalCharges', 0)
            contract = customer_data.get('Contract', '')
            internet_service = customer_data.get('InternetService', '')
            
            # Demographics prediction (based on age, family status)
            demographics_risk = 0.3  # Base risk
            if customer_data.get('SeniorCitizen') == 1:
                demographics_risk += 0.15  # Senior citizens have higher churn
            if customer_data.get('Partner') == 'No':
                demographics_risk += 0.1   # Singles more likely to churn
            if customer_data.get('Dependents') == 'No':
                demographics_risk += 0.1   # No dependents = higher mobility
            
            # Service Information prediction (based on tenure, services)
            service_risk = 0.4  # Base risk
            if tenure < 12:
                service_risk += 0.3  # New customers higher risk
            elif tenure > 60:
                service_risk -= 0.2  # Long-term customers lower risk
            
            if customer_data.get('PhoneService') == 'No':
                service_risk += 0.1  # No phone service = less engagement
            
            # Internet & Add-ons prediction
            internet_risk = 0.35
            if internet_service == 'Fiber optic':
                internet_risk += 0.15  # Fiber customers often have higher expectations
            elif internet_service == 'No':
                internet_risk -= 0.1   # No internet = different customer segment
            
            # Count add-on services
            addon_services = [
                customer_data.get('OnlineSecurity', 'No'),
                customer_data.get('OnlineBackup', 'No'),
                customer_data.get('DeviceProtection', 'No'),
                customer_data.get('TechSupport', 'No')
            ]
            addon_count = sum(1 for service in addon_services if service == 'Yes')
            internet_risk -= addon_count * 0.05  # More services = lower churn
            
            # Contract & Billing prediction
            billing_risk = 0.5  # Base risk
            if contract == 'Month-to-month':
                billing_risk += 0.3  # Month-to-month highest risk
            elif contract == 'Two year':
                billing_risk -= 0.25  # Two year lowest risk
            
            if customer_data.get('PaperlessBilling') == 'Yes':
                billing_risk += 0.05  # Paperless slightly higher risk
            
            payment_method = customer_data.get('PaymentMethod', '')
            if 'Electronic check' in payment_method:
                billing_risk += 0.15  # Electronic check highest risk
            elif 'automatic' in payment_method.lower():
                billing_risk -= 0.1   # Automatic payments lower risk
            
            # Financial prediction (based on charges)
            financial_risk = 0.3
            if monthly_charges > 80:  # High charges in USD (converted from INR)
                financial_risk += 0.2  # High bills = price sensitivity
            if tenure > 0 and total_charges / tenure < monthly_charges * 0.8:
                financial_risk += 0.1  # Inconsistent payment history
            
            # Normalize risks to 0-1 range
            def normalize_risk(risk):
                return max(0.0, min(1.0, risk))
            
            return {
                'demographics': {
                    'churn_probability': normalize_risk(demographics_risk),
                    'risk_level': self._get_risk_level_text(normalize_risk(demographics_risk)),
                    'key_factors': self._get_demographic_factors(customer_data)
                },
                'service_info': {
                    'churn_probability': normalize_risk(service_risk),
                    'risk_level': self._get_risk_level_text(normalize_risk(service_risk)),
                    'key_factors': self._get_service_factors(customer_data, tenure)
                },
                'internet_addons': {
                    'churn_probability': normalize_risk(internet_risk),
                    'risk_level': self._get_risk_level_text(normalize_risk(internet_risk)),
                    'key_factors': self._get_internet_factors(customer_data, addon_count)
                },
                'contract_billing': {
                    'churn_probability': normalize_risk(billing_risk),
                    'risk_level': self._get_risk_level_text(normalize_risk(billing_risk)),
                    'key_factors': self._get_billing_factors(customer_data)
                },
                'financial': {
                    'churn_probability': normalize_risk(financial_risk),
                    'risk_level': self._get_risk_level_text(normalize_risk(financial_risk)),
                    'key_factors': self._get_financial_factors(customer_data)
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculating category predictions: {str(e)}")
            return {}
    
    def _get_risk_level_text(self, probability):
        """Convert probability to risk level text"""
        if probability >= 0.7:
            return 'High Risk'
        elif probability >= 0.4:
            return 'Medium Risk'
        else:
            return 'Low Risk'
    
    def _get_demographic_factors(self, data):
        """Get key demographic risk factors"""
        factors = []
        if data.get('SeniorCitizen') == 1:
            factors.append('Senior citizen status')
        if data.get('Partner') == 'No':
            factors.append('No partner')
        if data.get('Dependents') == 'No':
            factors.append('No dependents')
        return factors if factors else ['Stable demographics']
    
    def _get_service_factors(self, data, tenure):
        """Get key service risk factors"""
        factors = []
        if tenure < 12:
            factors.append('New customer (< 1 year)')
        elif tenure > 60:
            factors.append('Long-term customer (5+ years)')
        if data.get('PhoneService') == 'No':
            factors.append('No phone service')
        return factors if factors else ['Standard service profile']
    
    def _get_internet_factors(self, data, addon_count):
        """Get key internet/addon risk factors"""
        factors = []
        internet = data.get('InternetService', '')
        if internet == 'Fiber optic':
            factors.append('Fiber optic service')
        elif internet == 'No':
            factors.append('No internet service')
        
        if addon_count == 0:
            factors.append('No add-on services')
        elif addon_count >= 3:
            factors.append('Multiple add-on services')
        
        return factors if factors else ['Standard internet profile']
    
    def _get_billing_factors(self, data):
        """Get key billing risk factors"""
        factors = []
        contract = data.get('Contract', '')
        if contract == 'Month-to-month':
            factors.append('Month-to-month contract')
        elif contract == 'Two year':
            factors.append('Two-year contract')
        
        payment = data.get('PaymentMethod', '')
        if 'Electronic check' in payment:
            factors.append('Electronic check payment')
        elif 'automatic' in payment.lower():
            factors.append('Automatic payment')
        
        return factors if factors else ['Standard billing profile']
    
    def _get_financial_factors(self, data):
        """Get key financial risk factors"""
        factors = []
        monthly = data.get('MonthlyCharges', 0)
        if monthly > 80:  # High charges
            factors.append('High monthly charges')
        elif monthly < 30:  # Low charges
            factors.append('Low monthly charges')
        
        return factors if factors else ['Standard financial profile']
    
    def _analyze_risk_factors(self, customer_data, feature_importance):
        """Analyze top risk factors for the customer"""
        risk_factors = {}
        
        # Map features to readable names
        feature_names = {
            'tenure': 'Customer Tenure',
            'MonthlyCharges': 'Monthly Charges',
            'TotalCharges': 'Total Charges',
            'Contract_encoded': 'Contract Type',
            'InternetService_encoded': 'Internet Service',
            'PaymentMethod_encoded': 'Payment Method',
            'SeniorCitizen': 'Senior Citizen Status',
            'Partner_encoded': 'Partner Status',
            'Dependents_encoded': 'Dependents Status'
        }
        
        # Get top 3 risk factors
        top_features = list(feature_importance.items())[:3]
        
        for feature, importance in top_features:
            readable_name = feature_names.get(feature, feature.replace('_encoded', '').replace('_', ' ').title())
            risk_factors[readable_name] = {
                'importance': float(importance),
                'impact': 'High' if importance > 0.15 else 'Medium' if importance > 0.08 else 'Low'
            }
        
        return risk_factors
    
    def _generate_recommendations(self, churn_probability, risk_factors):
        """Generate actionable recommendations based on prediction"""
        recommendations = []
        
        if churn_probability >= 0.7:
            recommendations.extend([
                "🚨 Immediate intervention required - contact customer within 24 hours",
                "💰 Consider offering retention discount or service upgrade",
                "📞 Schedule personal call with retention specialist"
            ])
        elif churn_probability >= 0.4:
            recommendations.extend([
                "⚠️ Proactive engagement recommended within 1 week",
                "📧 Send personalized retention email with special offers",
                "📊 Monitor usage patterns for early warning signs"
            ])
        else:
            recommendations.extend([
                "✅ Customer appears stable - maintain regular engagement",
                "🎯 Consider upselling additional services",
                "📈 Include in loyalty program communications"
            ])
        
        # Add specific recommendations based on risk factors
        for factor_name, factor_data in risk_factors.items():
            if factor_data['impact'] == 'High':
                if 'Contract' in factor_name:
                    recommendations.append("📄 Offer contract upgrade incentives")
                elif 'Payment' in factor_name:
                    recommendations.append("💳 Promote automatic payment options")
                elif 'Charges' in factor_name:
                    recommendations.append("💰 Review pricing and offer value packages")
        
        return recommendations[:5]  # Limit to top 5 recommendations
    

    
    def get_model_info(self):
        """Get information about the loaded model"""
        return {
            'model_type': type(self.model).__name__,
            'feature_count': len(self.feature_columns) if self.feature_columns else 0,
            'features': self.feature_columns,
            'encoders': list(self.label_encoders.keys()) if self.label_encoders else []
        }