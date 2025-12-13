"""
Main application entry point for the Customer Churn Analysis API
"""
import os
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Configure CORS
    cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:8000,http://localhost:3000').split(',')
    CORS(app, origins=cors_origins)
    
    # Configure logging
    log_level = os.getenv('LOG_LEVEL', 'INFO')
    logging.basicConfig(
        level=getattr(logging, log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(os.getenv('LOG_FILE', 'logs/app.log')),
            logging.StreamHandler()
        ]
    )
    
    # Register blueprints
    from backend.api.routes import api_bp
    app.register_blueprint(api_bp)
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    host = os.getenv('FLASK_HOST', 'localhost')
    port = int(os.getenv('FLASK_PORT', 5001))  # Changed from 5000 to 5001
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"🚀 Starting Customer Churn Analysis API on http://{host}:{port}")
    app.run(host=host, port=port, debug=debug)