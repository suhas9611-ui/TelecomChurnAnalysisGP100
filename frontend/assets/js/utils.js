// Utility functions for common operations
class Utils {
    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
    }

    /**
     * Generate unique ID
     * @returns {string} Unique identifier
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Format date to readable string
     * @param {Date|string} date - Date to format
     * @param {Object} options - Formatting options
     * @returns {string} Formatted date
     */
    static formatDate(date, options = {}) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...options
        };
        
        return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
    }

    /**
     * Format relative time (e.g., "2 hours ago")
     * @param {Date|string} date - Date to format
     * @returns {string} Relative time string
     */
    static formatRelativeTime(date) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffInSeconds = Math.floor((now - dateObj) / 1000);
        
        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 }
        ];
        
        for (const interval of intervals) {
            const count = Math.floor(diffInSeconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }
        
        return 'just now';
    }

    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Sanitize HTML string
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    static sanitizeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @param {string} suffix - Suffix to add (default: '...')
     * @returns {string} Truncated text
     */
    static truncateText(text, maxLength, suffix = '...') {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    /**
     * Convert string to title case
     * @param {string} str - String to convert
     * @returns {string} Title case string
     */
    static toTitleCase(str) {
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    /**
     * Parse CSV text to array of objects
     * @param {string} csvText - CSV text
     * @returns {Array} Array of objects
     */
    static parseCsv(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });
            return obj;
        });
    }

    /**
     * Convert array of objects to CSV
     * @param {Array} data - Array of objects
     * @returns {string} CSV string
     */
    static arrayToCsv(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' && value.includes(',') 
                        ? `"${value}"` 
                        : value;
                }).join(',')
            )
        ].join('\n');
        
        return csvContent;
    }

    /**
     * Download data as file
     * @param {string} data - File content
     * @param {string} filename - File name
     * @param {string} type - MIME type
     */
    static downloadFile(data, filename, type = 'text/plain') {
        const blob = new Blob([data], { type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise} Copy operation promise
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                return true;
            } catch (fallbackErr) {
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }

    /**
     * Get query parameters from URL
     * @returns {Object} Query parameters object
     */
    static getQueryParams() {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);
        
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        
        return params;
    }

    /**
     * Update URL with query parameters
     * @param {Object} params - Parameters to add/update
     * @param {boolean} replace - Replace current history entry
     */
    static updateQueryParams(params, replace = false) {
        const url = new URL(window.location);
        
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.set(key, params[key]);
            } else {
                url.searchParams.delete(key);
            }
        });
        
        if (replace) {
            window.history.replaceState({}, '', url);
        } else {
            window.history.pushState({}, '', url);
        }
    }

    /**
     * Check if element is in viewport
     * @param {Element} element - Element to check
     * @returns {boolean} Is in viewport
     */
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Smooth scroll to element
     * @param {Element|string} target - Element or selector
     * @param {Object} options - Scroll options
     */
    static scrollTo(target, options = {}) {
        const element = typeof target === 'string' 
            ? document.querySelector(target) 
            : target;
            
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                ...options
            });
        }
    }

    /**
     * Create loading spinner element
     * @param {string} size - Size class (small, medium, large)
     * @returns {Element} Spinner element
     */
    static createSpinner(size = 'medium') {
        const spinner = document.createElement('div');
        spinner.className = `loading-spinner ${size}`;
        return spinner;
    }

    /**
     * Show/hide loading overlay
     * @param {boolean} show - Show or hide
     * @param {string} message - Loading message
     */
    static toggleLoadingOverlay(show, message = 'Loading...') {
        let overlay = document.getElementById('loading-overlay');
        
        if (show) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'loading-overlay';
                overlay.className = 'loading-overlay';
                overlay.innerHTML = `
                    <div class="loading-spinner"></div>
                    <p>${message}</p>
                `;
                document.body.appendChild(overlay);
            }
            overlay.classList.remove('hidden');
        } else if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Message to show
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds
     */
    static showToast(message, type = 'info', duration = CONFIG.UI.TOAST.DURATION) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Position toast
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '10000';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '8px';
        toast.style.color = 'white';
        toast.style.fontWeight = '500';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'transform 0.3s ease';
        
        // Set background color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        toast.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
        
        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
    }
}

// Make showToast available globally
window.showToast = Utils.showToast;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}