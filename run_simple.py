#!/usr/bin/env python3
"""
Simple Launcher for Customer Churn Analysis Platform
Reliable startup without complex health checks
"""
import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

def main():
    print("🚀 Customer Churn Analysis Platform - Simple Launcher")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not Path("backend/main.py").exists():
        print("❌ Please run from project root directory")
        return 1
    
    print("🔍 Starting servers...")
    
    try:
        # Start backend
        print("🚀 Starting backend API...")
        backend_process = subprocess.Popen(
            [sys.executable, "backend/main.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Give backend time to start
        time.sleep(3)
        
        # Start frontend
        print("🌐 Starting frontend server...")
        frontend_process = subprocess.Popen(
            [sys.executable, "-m", "http.server", "8000"],
            cwd="frontend",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Give frontend time to start
        time.sleep(2)
        
        print()
        print("✅ Servers started successfully!")
        print()
        print("📊 Access Points:")
        print("   • Main Dashboard: http://localhost:8000")
        print("   • Predictions: http://localhost:8000/predictions.html")
        print("   • Sentiment Analysis: http://localhost:8000/complaints.html")
        print("   • Backend API: http://localhost:5001")
        print()
        print("🌐 Opening dashboard in browser...")
        
        # Open browser
        try:
            webbrowser.open("http://localhost:8000")
        except:
            print("💡 Please open http://localhost:8000 in your browser")
        
        print()
        print("🎉 Platform is ready!")
        print("Press Ctrl+C to stop all servers...")
        
        # Keep running until interrupted
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Stopping servers...")
            backend_process.terminate()
            frontend_process.terminate()
            print("✅ Servers stopped")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())