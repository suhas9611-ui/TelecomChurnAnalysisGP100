"""
API Routes for Customer Churn Analysis
"""
from flask import Blueprint, request, jsonify
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import os
from pathlib import Path

# Create blueprint
api_bp = Blueprint('api', __name__)
logger = logging.getLogger(__name__)

# Import utilities
from backend.utils.data_processor import DataProcessor
from backend.utils.model_predictor import ModelPredictor
from backend.utils.sentiment_analyzer import SentimentAnalyzer

# Global variables for lazy initialization
_data_processor = None
_model_predictor = None
_sentiment_analyzer = None

def get_data_processor():
    global _data_processor
    if _data_processor is None:
        _data_processor = DataProcessor()
    return _data_processor

def get_model_predictor():
    global _model_predictor
    if _model_predictor is None:
        _model_predictor = ModelPredictor()
    return _model_predictor

def get_sentiment_analyzer():
    global _sentiment_analyzer
    if _sentiment_analyzer is None:
        _sentiment_analyzer = SentimentAnalyzer()
    return _sentiment_analyzer

@api_bp.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Customer Churn Analysis API is running',
        'timestamp': datetime.now().isoformat()
    })

@api_bp.route('/dashboard_data', methods=['GET'])
def get_dashboard_data():
    """Get dashboard metrics and chart data using real data"""
    try:
        logger.info("Loading dashboard data from real files...")
        
        # Load real customer data from CSV files only
        data_processor = get_data_processor()
        customers_df = data_processor.load_customer_data()
        logger.info(f"Loaded {len(customers_df)} customer records from CSV")
        
        # Calculate real metrics from CSV data only
        total_customers = len(customers_df)
        churned_customers = len(customers_df[customers_df['Churn'] == 'Yes']) if 'Churn' in customers_df.columns else 0
        churn_rate = churned_customers / total_customers if total_customers > 0 else 0
        
        # Calculate real revenue impact from CSV data
        if 'MonthlyCharges' in customers_df.columns:
            churned_df = customers_df[customers_df['Churn'] == 'Yes']
            avg_monthly_charge = churned_df['MonthlyCharges'].mean() if len(churned_df) > 0 else 0
            
            # Check if data is already in INR (customers.csv) or USD (telco data)
            # If average monthly charge > 500, assume it's already in INR
            if avg_monthly_charge > 500:
                # Data is already in INR
                revenue_impact = churned_customers * avg_monthly_charge * 12  # Annual impact
            else:
                # Data is in USD, convert to INR
                revenue_impact = churned_customers * avg_monthly_charge * 83 * 12  # Convert to INR and annual
        else:
            revenue_impact = 0
        
        # Generate charts from real data
        charts_data = data_processor.generate_dashboard_charts(customers_df)
        
        response_data = {
            'metrics': {
                'totalCustomers': int(total_customers),
                'churnRate': float(churn_rate),
                'revenueImpact': float(revenue_impact)
            },
            'charts': charts_data
        }
        
        logger.info("Dashboard data loaded successfully from real data")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error getting dashboard data: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Failed to load dashboard data',
            'details': str(e)
        }), 500



@api_bp.route('/complaints_data', methods=['GET'])
def get_complaints_data():
    """Get complaints and sentiment data"""
    try:
        # Get query parameters
        period = request.args.get('period', '30')
        
        # Load complaints data
        data_processor = get_data_processor()
        complaints_df = data_processor.load_complaints_data()
        complaints_data = data_processor.generate_complaints_data(complaints_df, period)
        
        return jsonify(complaints_data)
        
    except Exception as e:
        logger.error(f"Error getting complaints data: {str(e)}")
        return jsonify({'error': 'Failed to load complaints data'}), 500

@api_bp.route('/predict', methods=['POST'])
def predict_churn():
    """Predict churn for a single customer"""
    try:
        customer_data = request.get_json()
        
        if not customer_data:
            return jsonify({'error': 'No customer data provided'}), 400
        
        # Validate required fields
        required_fields = ['tenure', 'MonthlyCharges', 'TotalCharges']
        missing_fields = [field for field in required_fields if field not in customer_data]
        
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {missing_fields}'}), 400
        
        # Make prediction
        model_predictor = get_model_predictor()
        prediction_result = model_predictor.predict_single(customer_data)
        
        return jsonify(prediction_result)
        
    except Exception as e:
        logger.error(f"Error predicting churn: {str(e)}")
        return jsonify({'error': 'Failed to predict churn'}), 500



@api_bp.route('/analyze_sentiment', methods=['POST'])
def analyze_sentiment():
    """Analyze sentiment of complaint text"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided for analysis'}), 400
        
        text = data['text'].strip()
        
        if not text:
            return jsonify({'error': 'Empty text provided'}), 400
        
        # Analyze sentiment
        sentiment_analyzer = get_sentiment_analyzer()
        sentiment_result = sentiment_analyzer.analyze(text)
        
        return jsonify(sentiment_result)
        
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {str(e)}")
        return jsonify({'error': 'Failed to analyze sentiment'}), 500

@api_bp.route('/customer_data', methods=['GET'])
def get_customer_data():
    """Get paginated customer data"""
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 20))
        search = request.args.get('search', '')
        segment = request.args.get('segment', 'all')
        
        # Load and filter data
        data_processor = get_data_processor()
        customers_df = data_processor.load_customer_data()
        filtered_data = data_processor.filter_customers(
            customers_df, search, segment, page, page_size
        )
        
        return jsonify(filtered_data)
        
    except Exception as e:
        logger.error(f"Error getting customer data: {str(e)}")
        return jsonify({'error': 'Failed to load customer data'}), 500

@api_bp.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@api_bp.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500