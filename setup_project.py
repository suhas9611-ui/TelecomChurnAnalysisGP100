"""
Project Setup Script
Organizes files into the new folder structure
"""

import shutil
import os
from pathlib import Path


def setup_project_structure():
    """Create folder structure and move files"""
    
    print("🚀 Setting up project structure...")
    
    # Create directories
    directories = [
        'data',
        'models',
        'logs',
        'notebooks',
        'config',
        'app/core',
        'app/ui',
        'app/utils'
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {directory}")
    
    # File movements
    moves = [
        ('customers.csv', 'data/customers.csv'),
        ('complaints.csv', 'data/complaints.csv'),
        ('WA_Fn-UseC_-Telco-Customer-Churn.csv', 'data/WA_Fn-UseC_-Telco-Customer-Churn.csv'),
        ('churn_model.pkl', 'models/churn_model.pkl'),
        ('Churn_analysis.ipynb', 'notebooks/Churn_analysis.ipynb'),
        ('sample.ipynb', 'notebooks/sample.ipynb'),
    ]
    
    for source, destination in moves:
        if os.path.exists(source) and not os.path.exists(destination):
            try:
                shutil.copy2(source, destination)
                print(f"✅ Copied: {source} → {destination}")
            except Exception as e:
                print(f"⚠️  Could not copy {source}: {e}")
    
    print("\n✨ Project structure setup complete!")
    print("\n📝 Next steps:")
    print("1. Review config/settings.yaml")
    print("2. Install dependencies: pip install -r requirements.txt")
    print("3. Run the dashboard: streamlit run app/main.py")


if __name__ == "__main__":
    setup_project_structure()
