/**
 * Main Application
 * Initializes and coordinates all modules
 */

const App = {
    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Customer Churn Dashboard...');
        
        try {
            // Check API health
            await this.checkHealth();
            
            // Load configuration
            await this.loadConfig();
            
            // Load all data
            await Promise.all([
                this.loadStats(),
                Charts.loadCharts(),
                Prediction.loadForm()
            ]);
            
            console.log('Dashboard initialized successfully');
            
        } catch (error) {
            console.error('Initialization error:', error);
            showError('Failed to initialize dashboard: ' + error.message);
        }
    },
    
    /**
     * Check API health
     */
    async checkHealth() {
        try {
            const health = await API.checkHealth();
            console.log('API Health:', health);
            
            if (!health.data_loaded) {
                showError('Warning: Data not loaded properly');
            }
            
            if (!health.model_loaded) {
                showError('Warning: Model not loaded - predictions unavailable');
            }
            
        } catch (error) {
            console.error('Health check failed:', error);
            throw new Error('Cannot connect to API server. Please ensure the server is running.');
        }
    },
    
    /**
     * Load dashboard configuration
     */
    async loadConfig() {
        try {
            const config = await API.getConfig();
            
            // Update page title
            document.title = config.title;
            document.getElementById('dashboard-title').textContent = config.title;
            
        } catch (error) {
            console.error('Failed to load config:', error);
            // Non-critical, continue anyway
        }
    },
    
    /**
     * Load and display statistics
     */
    async loadStats() {
        try {
            const stats = await API.getStats();
            
            // Update metric cards
            document.getElementById('total-customers').textContent = 
                formatNumber(stats.total_customers);
            
            document.getElementById('churned-customers').textContent = 
                formatNumber(stats.churned_customers);
            
            document.getElementById('churn-rate').textContent = 
                stats.churn_rate.toFixed(2) + '%';
            
        } catch (error) {
            console.error('Error loading stats:', error);
            showError('Failed to load statistics: ' + error.message);
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Handle window resize for responsive charts
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Relayout all Plotly charts
        const charts = document.querySelectorAll('.chart-container');
        charts.forEach(chart => {
            if (chart.id) {
                Plotly.Plots.resize(chart.id);
            }
        });
    }, 250);
});
