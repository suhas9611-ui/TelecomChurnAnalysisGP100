// API utility functions for making HTTP requests
class ApiClient {
    constructor() {
        this.baseUrl = CONFIG.API.BASE_URL;
        this.timeout = CONFIG.API.TIMEOUT;
        this.retryAttempts = CONFIG.API.RETRY_ATTEMPTS;
        this.cache = new Map();
    }

    /**
     * Make HTTP request with retry logic
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise} Response data
     */
    async request(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const requestOptions = {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await fetch(url, requestOptions);
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                return data;
            } catch (error) {
                lastError = error;
                
                if (attempt === this.retryAttempts || error.name === 'AbortError') {
                    break;
                }
                
                // Wait before retry (exponential backoff)
                await this.delay(Math.pow(2, attempt) * 1000);
            }
        }

        clearTimeout(timeoutId);
        throw lastError;
    }

    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {Promise} Response data
     */
    async get(endpoint, params = {}) {
        const url = new URL(ConfigUtils.getApiUrl(endpoint));
        console.log('API GET request to:', url.toString());
        
        // Add query parameters
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        // Check cache first
        const cacheKey = url.toString();
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < CONFIG.DATA.CACHE_DURATION) {
                console.log('Returning cached data for:', url.toString());
                return cached.data;
            }
        }

        console.log('Making fresh API request to:', url.toString());
        const data = await this.request(url.toString());
        
        // Cache the response
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        return data;
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @returns {Promise} Response data
     */
    async post(endpoint, data = {}) {
        const url = ConfigUtils.getApiUrl(endpoint);
        
        return await this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @returns {Promise} Response data
     */
    async put(endpoint, data = {}) {
        const url = ConfigUtils.getApiUrl(endpoint);
        
        return await this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise} Response data
     */
    async delete(endpoint) {
        const url = ConfigUtils.getApiUrl(endpoint);
        
        return await this.request(url, {
            method: 'DELETE'
        });
    }

    /**
     * Upload file
     * @param {string} endpoint - API endpoint
     * @param {File} file - File to upload
     * @param {Object} additionalData - Additional form data
     * @returns {Promise} Response data
     */
    async uploadFile(endpoint, file, additionalData = {}) {
        const url = ConfigUtils.getApiUrl(endpoint);
        const formData = new FormData();
        
        formData.append('file', file);
        
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        return await this.request(url, {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
        });
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Delay utility for retry logic
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// API service methods
class ApiService {
    constructor() {
        this.client = new ApiClient();
    }

    /**
     * Get dashboard data
     * @returns {Promise} Dashboard metrics and charts data
     */
    async getDashboardData() {
        try {
            return await this.client.get('DASHBOARD_DATA');
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            throw new Error('Unable to load dashboard data. Please try again.');
        }
    }



    /**
     * Get complaints data
     * @param {Object} filters - Complaints filters
     * @returns {Promise} Complaints data
     */
    async getComplaintsData(filters = {}) {
        try {
            return await this.client.get('COMPLAINTS_DATA', filters);
        } catch (error) {
            console.error('Failed to fetch complaints data:', error);
            throw new Error('Unable to load complaints data. Please try again.');
        }
    }

    /**
     * Get customer data
     * @param {Object} filters - Customer filters
     * @returns {Promise} Customer data
     */
    async getCustomerData(filters = {}) {
        try {
            return await this.client.get('CUSTOMER_DATA', filters);
        } catch (error) {
            console.error('Failed to fetch customer data:', error);
            throw new Error('Unable to load customer data. Please try again.');
        }
    }

    /**
     * Predict churn for single customer
     * @param {Object} customerData - Customer information
     * @returns {Promise} Prediction result
     */
    async predictChurn(customerData) {
        try {
            return await this.client.post('CHURN_PREDICTION', customerData);
        } catch (error) {
            console.error('Failed to predict churn:', error);
            throw new Error('Unable to process prediction. Please check your input and try again.');
        }
    }



    /**
     * Analyze sentiment of text
     * @param {string} text - Text to analyze
     * @returns {Promise} Sentiment analysis result
     */
    async analyzeSentiment(text) {
        try {
            const validation = ConfigUtils.validateField('complaint_text', text);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }
            
            return await this.client.post('SENTIMENT_ANALYSIS', { text });
        } catch (error) {
            console.error('Failed to analyze sentiment:', error);
            throw new Error('Unable to analyze sentiment. Please try again.');
        }
    }


}

// Create global API service instance
const apiService = new ApiService();

// Error handling utilities
class ErrorHandler {
    /**
     * Handle API errors and show user-friendly messages
     * @param {Error} error - Error object
     * @param {string} context - Context where error occurred
     */
    static handle(error, context = 'Operation') {
        console.error(`${context} failed:`, error);
        
        let message = error.message || 'An unexpected error occurred';
        
        // Handle specific error types
        if (error.name === 'AbortError') {
            message = 'Request timed out. Please try again.';
        } else if (error.message.includes('Failed to fetch')) {
            message = 'Unable to connect to server. Please check your connection.';
        } else if (error.message.includes('HTTP 404')) {
            message = 'Requested resource not found.';
        } else if (error.message.includes('HTTP 500')) {
            message = 'Server error. Please try again later.';
        }
        
        this.showError(message);
    }

    /**
     * Show error message to user
     * @param {string} message - Error message
     */
    static showError(message) {
        // Try to use toast notification if available
        if (typeof showToast === 'function') {
            showToast(message, 'error');
        } else {
            // Fallback to alert
            alert(message);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApiClient, ApiService, ErrorHandler, apiService };
}