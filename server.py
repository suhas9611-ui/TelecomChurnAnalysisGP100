"""
Flask API Server - Pure Web Application
Serves HTML/CSS/JS frontend and provides REST API
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.core.data_loader import DataLoader
from app.core.model_manager import ModelManager
from app.utils.logger import logger
from app.utils.config_loader import config

# Initialize Flask app
app = Flask(__name__, static_folder='frontend', static_url_path='')
CORS(app)

# input components
data_loader = DataLoader()
model_manager = ModelManager()

# Load data and model on startup
data_loaded = False
model_loaded = False

try:
    success, df, error = data_loader.load_customer_data()
    if success:
        data_loaded = True
        logger.info("Data loaded successfully for API")
    else:
        logger.error(f"Failed to load data: {error}")
except Exception as e:
    logger.error(f"Error loading data: {e}")

try:
    success, error = model_manager.load_model()
    if success:
        model_loaded = True
        logger.info("Model loaded successfully for API")
    else:
        logger.warning(f"Model loading failed: {error}")
except Exception as e:
    logger.error(f"Error loading model: {e}")

# Loads complaints data
complaints_data = None
complaints_loaded = False

try:
    import pandas as pd
    complaints_df = pd.read_csv('data/complaints.csv')
    complaints_data = complaints_df
    complaints_loaded = True
    logger.info(f"Complaints data loaded: {len(complaints_df)} records")
except Exception as e:
    logger.error(f"Failed to load complaints data: {e}")


@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/complaints.html')
def complaints():
    """Serve the complaints HTML page"""
    return send_from_directory(app.static_folder, 'complaints.html')


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'data_loaded': data_loaded,
        'model_loaded': model_loaded
    })


@app.route('/api/config', methods=['GET'])
def get_config():
    """Get dashboard configuration"""
    return jsonify({
        'title': config.get('dashboard.title', 'Customer Churn Dashboard'),
        'page_icon': config.get('dashboard.page_icon', '📊')
    })


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get churn statistics"""
    if not data_loaded:
        return jsonify({'error': 'Data not loaded'}), 500
    
    try:
        stats = data_loader.get_churn_stats()
        logger.info("Stats requested via API")
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/charts', methods=['GET'])
def get_chart_data():
    """Get data for charts"""
    if not data_loaded:
        return jsonify({'error': 'Data not loaded'}), 500
    
    try:
        df = data_loader.df
        churn_col = data_loader.churn_column
        cat_columns = data_loader.get_categorical_columns()
        
        # Get priority columns
        priority_cols = config.get('visualizations.priority_columns', [])
        max_charts = config.get('visualizations.max_charts', 6)
        
        # Sort columns by priority
        sorted_cols = [col for col in priority_cols if col in cat_columns]
        sorted_cols.extend([col for col in cat_columns if col not in sorted_cols])
        display_cols = sorted_cols[:max_charts]
        
        # Prepare chart data
        charts = []
        for col in display_cols:
            grouped = df.groupby([col, churn_col]).size().reset_index(name='count')
            chart_data = {
                'column': col,
                'data': grouped.to_dict('records')
            }
            charts.append(chart_data)
        
        logger.info(f"Chart data requested: {len(charts)} charts")
        return jsonify({'charts': charts})
        
    except Exception as e:
        logger.error(f"Error getting chart data: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/model/features', methods=['GET'])
def get_model_features():
    """Get model feature information with grouping"""
    if not model_loaded:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        # Columns to exclude
        exclude_columns = ['CustomerID', 'ChurnProb', 'Churn', 'churn']
        
        features = []
        feature_groups = {
            'demographic': [],
            'service': [],
            'usage': [],
            'financial': []
        }
        
        # Categorize features
        demographic_cols = ['Gender', 'Age', 'Region']
        service_cols = ['PlanType', 'ContractType', 'PhoneService', 'MultipleLines', 
                       'InternetService', 'OnlineSecurity', 'OnlineBackup', 
                       'DeviceProtection', 'TechSupport']
        usage_cols = ['TenureMonths', 'SupportCallsLast90d', 'AvgDownlinkMbps']
        financial_cols = ['MonthlyCharges', 'TotalCharges', 'PaymentMethod']
        
        for col in model_manager.model_columns:
            if col in exclude_columns:
                continue
                
            options = model_manager.get_categorical_options(col)
            
            # Add "None" as first option for all categorical fields
            if options and len(options) > 0:
                # Check if "None" is already in options (case-insensitive)
                has_none = any(opt.lower() == 'none' for opt in options)
                if not has_none:
                    options = ['None'] + list(options)
            
            feature = {
                'name': col,
                'type': 'categorical' if options else 'numeric',
                'options': options
            }
            
            # Categorize
            if col in demographic_cols:
                feature['group'] = 'demographic'
                feature_groups['demographic'].append(feature)
            elif col in service_cols:
                feature['group'] = 'service'
                feature_groups['service'].append(feature)
            elif col in usage_cols:
                feature['group'] = 'usage'
                feature_groups['usage'].append(feature)
            elif col in financial_cols:
                feature['group'] = 'financial'
                feature_groups['financial'].append(feature)
            
            features.append(feature)
        
        return jsonify({
            'features': features,
            'groups': feature_groups
        })
        
    except Exception as e:
        logger.error(f"Error getting model features: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/predict', methods=['POST'])
def predict():
    """Make churn prediction"""
    if not model_loaded:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        input_data = request.json
        logger.info(f"Prediction requested via API")
        
        # Note: CustomerID and ChurnProb are excluded in model_manager.predict()
        # No need to add them here as they will be filtered out
        
        # Make prediction
        success, result, error = model_manager.predict(input_data)
        
        if not success:
            return jsonify({'error': error}), 400
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error making prediction: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/complaints/stats', methods=['GET'])
def get_complaints_stats():
    """Get complaints statistics"""
    if not complaints_loaded:
        return jsonify({'error': 'Complaints data not loaded'}), 500
    
    try:
        stats = {
            'total': len(complaints_data),
            'negative': len(complaints_data[complaints_data['Sentiment'] == 'Negative']),
            'neutral': len(complaints_data[complaints_data['Sentiment'] == 'Neutral']),
            'positive': len(complaints_data[complaints_data['Sentiment'] == 'Positive'])
        }
        logger.info("Complaints stats requested via API")
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting complaints stats: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/complaints/charts', methods=['GET'])
def get_complaints_chart_data():
    """Get data for complaints charts"""
    if not complaints_loaded:
        return jsonify({'error': 'Complaints data not loaded'}), 500
    
    try:
        charts = []
        
        # Sentiment distribution
        sentiment_counts = complaints_data['Sentiment'].value_counts()
        charts.append({
            'title': 'Complaints by Sentiment',
            'column': 'Sentiment',
            'data': [{'label': k, 'value': int(v)} for k, v in sentiment_counts.items()]
        })
        
        # Category distribution
        category_counts = complaints_data['IssueCategory'].value_counts()
        charts.append({
            'title': 'Complaints by Category',
            'column': 'IssueCategory',
            'data': [{'label': k, 'value': int(v)} for k, v in category_counts.items()]
        })
        
        # Channel distribution
        channel_counts = complaints_data['Channel'].value_counts()
        charts.append({
            'title': 'Complaints by Channel',
            'column': 'Channel',
            'data': [{'label': k, 'value': int(v)} for k, v in channel_counts.items()]
        })
        
        logger.info(f"Complaints chart data requested: {len(charts)} charts")
        return jsonify({'charts': charts})
    except Exception as e:
        logger.error(f"Error getting complaints chart data: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    """Get all complaints"""
    if not complaints_loaded:
        return jsonify({'error': 'Complaints data not loaded'}), 500
    
    try:
        complaints_list = complaints_data.to_dict('records')
        logger.info(f"Complaints data requested: {len(complaints_list)} records")
        return jsonify({'complaints': complaints_list})
    except Exception as e:
        logger.error(f"Error getting complaints: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/complaints/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    """Analyze sentiment of complaint text"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Simple sentiment analysis based on keywords
        # In production, use a proper NLP model
        negative_words = ['slow', 'bad', 'poor', 'terrible', 'awful', 'failed', 'issue', 'problem', 
                         'disappointed', 'frustrat', 'angry', 'worst', 'horrible', 'useless']
        positive_words = ['good', 'great', 'excellent', 'happy', 'satisfied', 'resolved', 'thank',
                         'amazing', 'wonderful', 'perfect', 'love', 'best']
        
        text_lower = text.lower()
        negative_count = sum(1 for word in negative_words if word in text_lower)
        positive_count = sum(1 for word in positive_words if word in text_lower)
        
        if negative_count > positive_count:
            sentiment = 'Negative'
            confidence = min(0.6 + (negative_count * 0.1), 0.95)
        elif positive_count > negative_count:
            sentiment = 'Positive'
            confidence = min(0.6 + (positive_count * 0.1), 0.95)
        else:
            sentiment = 'Neutral'
            confidence = 0.7
        
        logger.info(f"Sentiment analyzed: {sentiment} (confidence: {confidence:.2f})")
        return jsonify({
            'sentiment': sentiment,
            'confidence': confidence,
            'text': text
        })
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {e}")
        return jsonify({'error': str(e)}), 500


@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def server_error(e):
    """Handle 500 errors"""
    logger.error(f"Server error: {e}")
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    logger.info("=" * 50)
    logger.info("Starting Flask API Server")
    logger.info("=" * 50)
    logger.info(f"Data loaded: {data_loaded}")
    logger.info(f"Model loaded: {model_loaded}")
    logger.info("Server running on http://localhost:5000")
    logger.info("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
