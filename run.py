#!/usr/bin/env python3
"""
Single Command Launcher for Customer Churn Analysis Platform
Starts both backend and frontend with one command
"""
import os
import sys
import subprocess
import time
import webbrowser
import signal
import threading
from pathlib import Path

class PlatformLauncher:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.running = True
        
    def check_requirements(self):
        """Check if all requirements are met"""
        print("🔍 Checking requirements...")
        
        # Check if we're in the right directory
        if not Path("backend/main.py").exists():
            print("❌ Please run from project root directory")
            return False
        
        # Check virtual environment
        if not (hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)):
            print("❌ Virtual environment not detected")
            print("Please run:")
            print("  python3 -m venv venv")
            print("  source venv/bin/activate")
            print("  pip install -r requirements.txt")
            print("  python run.py")
            return False
        
        # Check dependencies
        try:
            import flask, pandas, sklearn, requests
            print("✅ All dependencies available")
        except ImportError as e:
            print(f"❌ Missing dependency: {e}")
            print("Run: pip install -r requirements.txt")
            return False
        
        return True
    
    def start_backend(self):
        """Start the backend server"""
        print("🚀 Starting backend API...")
        
        env = os.environ.copy()
        env.update({
            "FLASK_ENV": "production",
            "FLASK_DEBUG": "False",
            "PYTHONPATH": str(Path.cwd())
        })
        
        try:
            self.backend_process = subprocess.Popen(
                [sys.executable, "backend/main.py"],
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            # Wait for backend to start
            for i in range(15):
                if not self.running:
                    return False
                    
                try:
                    import requests
                    response = requests.get("http://localhost:5001/", timeout=2)
                    if response.status_code == 200:
                        print("✅ Backend API running on http://localhost:5001")
                        return True
                except:
                    pass
                
                time.sleep(1)
                print(f"   Waiting for backend... ({i+1}/15)")
            
            print("❌ Backend failed to start")
            return False
            
        except Exception as e:
            print(f"❌ Error starting backend: {e}")
            return False
    
    def start_frontend(self):
        """Start the frontend server"""
        print("🌐 Starting frontend server...")
        
        try:
            self.frontend_process = subprocess.Popen(
                [sys.executable, "-m", "http.server", "8000"],
                cwd="frontend",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            time.sleep(2)
            print("✅ Frontend server running on http://localhost:8000")
            return True
            
        except Exception as e:
            print(f"❌ Error starting frontend: {e}")
            return False
    
    def open_browser(self):
        """Open the dashboard in browser"""
        try:
            print("🌐 Opening dashboard in browser...")
            webbrowser.open("http://localhost:8000")
        except:
            print("💡 Open http://localhost:8000 in your browser")
    
    def monitor_processes(self):
        """Monitor both processes"""
        while self.running:
            time.sleep(2)
            
            # Check if processes are still running
            if self.backend_process and self.backend_process.poll() is not None:
                print("⚠️  Backend process stopped")
                break
                
            if self.frontend_process and self.frontend_process.poll() is not None:
                print("⚠️  Frontend process stopped")
                break
    
    def cleanup(self):
        """Clean up processes"""
        print("\n🛑 Stopping servers...")
        
        if self.backend_process:
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
                print("   ✅ Backend stopped")
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
                print("   ⚡ Backend force stopped")
        
        if self.frontend_process:
            self.frontend_process.terminate()
            try:
                self.frontend_process.wait(timeout=5)
                print("   ✅ Frontend stopped")
            except subprocess.TimeoutExpired:
                self.frontend_process.kill()
                print("   ⚡ Frontend force stopped")
    
    def run(self):
        """Main run method"""
        print("🚀 Customer Churn Analysis Platform")
        print("=" * 50)
        
        # Check requirements
        if not self.check_requirements():
            return 1
        
        # Setup signal handler for graceful shutdown
        def signal_handler(signum, frame):
            self.running = False
            self.cleanup()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        try:
            # Start backend
            if not self.start_backend():
                return 1
            
            # Start frontend
            if not self.start_frontend():
                self.cleanup()
                return 1
            
            # Open browser
            self.open_browser()
            
            # Show success message
            print()
            print("🎉 Platform is ready!")
            print()
            print("📊 Access Points:")
            print("   • Main Dashboard: http://localhost:8000")
            print("   • Advanced Analytics: http://localhost:8000/analytics.html")
            print("   • Churn Predictions: http://localhost:8000/predictions.html")
            print("   • Sentiment Analysis: http://localhost:8000/complaints.html")
            print("   • Backend API: http://localhost:5001")
            print()
            print("Press Ctrl+C to stop all servers...")
            
            # Monitor processes
            self.monitor_processes()
            
        except KeyboardInterrupt:
            pass
        finally:
            self.cleanup()
        
        return 0

def main():
    """Entry point"""
    launcher = PlatformLauncher()
    return launcher.run()

if __name__ == "__main__":
    sys.exit(main())