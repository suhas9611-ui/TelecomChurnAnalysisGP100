/**
 * API Service
 * Handles all API requests
 */

const API = {
    /**
     * Generic fetch wrapper with error handling
     */
    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    /**
     * Check API health
     */
    async checkHealth() {
        return this.request(getApiUrl('health'));
    },
    
    /**
     * Get dashboard configuration
     */
    async getConfig() {
        return this.request(getApiUrl('config'));
    },
    
    /**
     * Get churn statistics
     */
    async getStats() {
        return this.request(getApiUrl('stats'));
    },
    
    /**
     * Get chart data
     */
    async getChartData() {
        return this.request(getApiUrl('charts'));
    },
    
    /**
     * Get model features
     */
    async getModelFeatures() {
        return this.request(getApiUrl('modelFeatures'));
    },
    
    /**
     * Make prediction
     */
    async predict(inputData) {
        return this.request(getApiUrl('predict'), {
            method: 'POST',
            body: JSON.stringify(inputData)
        });
    },
    
    /**
     * Get complaints statistics
     */
    async getComplaintsStats() {
        return this.request(getApiUrl('complaintsStats'));
    },
    
    /**
     * Get complaints chart data
     */
    async getComplaintsChartData() {
        return this.request(getApiUrl('complaintsCharts'));
    },
    
    /**
     * Get all complaints
     */
    async getComplaints() {
        return this.request(getApiUrl('complaints'));
    },
    
    /**
     * Analyze sentiment of text
     */
    async analyzeSentiment(text) {
        return this.request(getApiUrl('analyzeSentiment'), {
            method: 'POST',
            body: JSON.stringify({ text })
        });
    }
};

/**
 * Show error toast
 */
function showError(message) {
    const toast = document.getElementById('error-toast');
    const messageEl = document.getElementById('error-message');
    
    messageEl.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 5000);
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format percentage
 */
function formatPercentage(num) {
    return (num * 100).toFixed(2) + '%';
}
