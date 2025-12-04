"""
Setup Verification Script
Tests that all components are properly configured
"""

import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))


def test_imports():
    """Test that all modules can be imported"""
    print("🧪 Testing imports...")
    
    try:
        from app.utils.config_loader import config
        print("  ✅ Config loader")
        
        from app.utils.logger import logger
        print("  ✅ Logger")
        
        from app.utils.validators import DataValidator
        print("  ✅ Validators")
        
        from app.core.data_loader import DataLoader
        print("  ✅ Data loader")
        
        from app.core.model_manager import ModelManager
        print("  ✅ Model manager")
        
        from app.ui.dashboard import Dashboard
        print("  ✅ Dashboard")
        
        return True
    except Exception as e:
        print(f"  ❌ Import failed: {e}")
        return False


def test_config():
    """Test configuration loading"""
    print("\n🧪 Testing configuration...")
    
    try:
        from app.utils.config_loader import config
        
        # Test basic config access
        title = config.get('dashboard.title')
        print(f"  ✅ Dashboard title: {title}")
        
        model_path = config.get('paths.model')
        print(f"  ✅ Model path: {model_path}")
        
        return True
    except Exception as e:
        print(f"  ❌ Config test failed: {e}")
        return False


def test_file_structure():
    """Test that required directories exist"""
    print("\n🧪 Testing file structure...")
    
    required_dirs = [
        'app',
        'app/core',
        'app/ui',
        'app/utils',
        'config',
        'data',
        'models',
        'logs'
    ]
    
    all_exist = True
    for directory in required_dirs:
        path = Path(directory)
        if path.exists():
            print(f"  ✅ {directory}/")
        else:
            print(f"  ❌ {directory}/ (missing)")
            all_exist = False
    
    return all_exist


def test_required_files():
    """Test that required files exist"""
    print("\n🧪 Testing required files...")
    
    required_files = [
        'config/settings.yaml',
        'app/main.py',
        'requirements.txt',
        'README.md'
    ]
    
    all_exist = True
    for file_path in required_files:
        path = Path(file_path)
        if path.exists():
            print(f"  ✅ {file_path}")
        else:
            print(f"  ❌ {file_path} (missing)")
            all_exist = False
    
    return all_exist


def test_data_files():
    """Test that data files exist"""
    print("\n🧪 Testing data files...")
    
    data_files = [
        'data/customers.csv',
        'models/churn_model.pkl'
    ]
    
    for file_path in data_files:
        path = Path(file_path)
        if path.exists():
            print(f"  ✅ {file_path}")
        else:
            print(f"  ⚠️  {file_path} (not found - run setup_project.py)")
    
    return True


def main():
    """Run all tests"""
    print("=" * 60)
    print("🔍 SETUP VERIFICATION")
    print("=" * 60)
    
    results = []
    
    results.append(("File Structure", test_file_structure()))
    results.append(("Required Files", test_required_files()))
    results.append(("Data Files", test_data_files()))
    results.append(("Imports", test_imports()))
    results.append(("Configuration", test_config()))
    
    print("\n" + "=" * 60)
    print("📊 RESULTS")
    print("=" * 60)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    all_passed = all(result[1] for result in results)
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✨ All tests passed! You're ready to run the dashboard.")
        print("\nRun: streamlit run app/main.py")
    else:
        print("⚠️  Some tests failed. Please fix the issues above.")
        print("\nTry running: python setup_project.py")
    print("=" * 60)


if __name__ == "__main__":
    main()
