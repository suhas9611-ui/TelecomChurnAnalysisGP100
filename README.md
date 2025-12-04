# Customer Churn Dashboard 📊

A production-ready, dynamic customer churn prediction and analytics dashboard built with Streamlit.

## ✨ Features

- **Dynamic Data Loading**: Automatically adapts to different datasets
- **Smart Validation**: Built-in error handling and data validation
- **Live Predictions**: Real-time churn probability predictions
- **Interactive Visualizations**: Auto-generated charts based on your data
- **Configuration-Driven**: Easy customization without code changes
- **Comprehensive Logging**: Track all operations and errors
- **Clean Architecture**: Modular, maintainable, and scalable code

## 📁 Project Structure

```
project/
├── app/                      # Application code
│   ├── core/                 # Core business logic
│   │   ├── data_loader.py    # Data loading and processing
│   │   └── model_manager.py  # Model management and predictions
│   ├── ui/                   # User interface
│   │   └── dashboard.py      # Streamlit dashboard
│   ├── utils/                # Utility modules
│   │   ├── config_loader.py  # Configuration management
│   │   ├── logger.py         # Logging utilities
│   │   └── validators.py     # Data validation
│   └── main.py               # Application entry point
├── config/                   # Configuration files
│   └── settings.yaml         # Main configuration
├── data/                     # Data files
│   └── customers.csv         # Customer data
├── models/                   # ML models
│   └── churn_model.pkl       # Trained model
├── logs/                     # Application logs
│   └── app.log               # Log file
├── notebooks/                # Jupyter notebooks
│   └── Churn_analysis.ipynb  # Analysis notebooks
└── requirements.txt          # Python dependencies
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure the Application

Edit `config/settings.yaml` to customize:
- File paths
- Dashboard settings
- Visualization preferences
- Logging configuration

### 3. Run the Dashboard

```bash
streamlit run app/main.py
```

The dashboard will open in your browser at `http://localhost:8501`

## ⚙️ Configuration

All settings are in `config/settings.yaml`. You can customize:

### File Paths
```yaml
paths:
  model: "models/churn_model.pkl"
  customer_data: "data/customers.csv"
  log_file: "logs/app.log"
```

### Dashboard Settings
```yaml
dashboard:
  title: "Customer Churn Dashboard"
  page_icon: "📊"
  layout: "wide"
```

### Visualization Settings
```yaml
visualizations:
  max_charts: 6
  priority_columns:
    - "Gender"
    - "ContractType"
    - "InternetService"
```

## 📊 Using the Dashboard

### Analytics View
- View total customers, churned customers, and churn rate
- Explore interactive charts showing churn patterns
- Charts automatically adapt to your data

### Prediction Tool
- Enter customer information in the form
- Get instant churn probability prediction
- Receive actionable recommendations

## 🛡️ Error Handling

The application includes comprehensive error handling:
- **Data Validation**: Checks for missing columns, invalid data
- **Graceful Degradation**: Dashboard works even if model fails to load
- **User-Friendly Messages**: Clear error messages guide troubleshooting
- **Detailed Logging**: All errors logged to `logs/app.log`

## 📝 Logging

All operations are logged to `logs/app.log`:
- Application startup and shutdown
- Data loading operations
- Predictions made
- Errors and warnings

Check logs for troubleshooting and monitoring.

## 🔧 Customization

### Adding New Data Sources
1. Update `customer_data` path in `config/settings.yaml`
2. Ensure CSV has a churn column (Yes/No or 1/0)
3. Dashboard will automatically adapt

### Changing Visualizations
1. Edit `priority_columns` in `config/settings.yaml`
2. Adjust `max_charts` to show more/fewer charts
3. Restart the dashboard

### Updating the Model
1. Place new model pickle file in `models/`
2. Update `model` path in `config/settings.yaml`
3. Ensure model has same structure (model, encoders, columns)

## 🐛 Troubleshooting

### Dashboard won't start
- Check `logs/app.log` for errors
- Verify all paths in `config/settings.yaml`
- Ensure all dependencies are installed

### Predictions not working
- Verify model file exists and is not corrupted
- Check that model columns match input data
- Review logs for specific errors

### Charts not displaying
- Ensure data has categorical columns
- Check that churn column exists
- Verify data is not empty

## 📦 Dependencies

- **Streamlit**: Web dashboard framework
- **Pandas**: Data manipulation
- **Plotly**: Interactive visualizations
- **PyYAML**: Configuration management
- **Scikit-learn**: Machine learning

## 🤝 Contributing

This codebase is designed to be:
- **Beginner-friendly**: Clear comments and documentation
- **Modular**: Easy to extend and modify
- **Production-ready**: Robust error handling and logging

## 📄 License

This project is open source and available for educational and commercial use.

## 💡 Tips

- Always check `logs/app.log` when troubleshooting
- Use `config/settings.yaml` for all customizations
- Keep your data in the `data/` folder
- Store models in the `models/` folder
- The dashboard auto-detects churn columns named: Churn, churn, CHURN, etc.

---

**Built with ❤️ for data-driven decision making**
