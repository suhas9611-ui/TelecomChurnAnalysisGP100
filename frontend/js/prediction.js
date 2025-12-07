/**
 * Prediction Module
 * Handles prediction form and results
 */

const Prediction = {
    formData: {},
    allFeatures: [],
    featureDefaults: {},
    
    /**
     * Load and render prediction form with custom grouping
     */
    async loadForm() {
        try {
            const data = await API.getModelFeatures();
            const container = document.getElementById('form-fields');
            
            if (!data.features || data.features.length === 0) {
                container.innerHTML = '<p class="text-center">Model not available</p>';
                return;
            }
            
            // Store all features for default value generation
            this.allFeatures = data.features;
            this.generateDefaultValues();
            
            // Clear loading message
            container.innerHTML = '';
            
            // Create custom grouped sections
            this.renderCustomerSection(container);
            this.renderDemographicSection(container, data.groups?.demographic || []);
            this.renderServiceSection(container, data.groups?.service || []);
            this.renderUsageSection(container, data.groups?.usage || []);
            this.renderPaymentSection(container, data.groups?.financial || []);
            
            // Setup form submission
            this.setupFormSubmission();
            
        } catch (error) {
            console.error('Error loading form:', error);
            showError('Failed to load prediction form: ' + error.message);
        }
    },
    
    /**
     * Generate default values for all features
     */
    generateDefaultValues() {
        // Add CustomerID default
        this.featureDefaults['CustomerID'] = 'CUST000000';
        
        this.allFeatures.forEach(feature => {
            if (feature.type === 'categorical' && feature.options.length > 0) {
                // Use first option as default
                this.featureDefaults[feature.name] = feature.options[0];
            } else {
                // Use median/average values for numeric fields
                const defaults = {
                    'Age': 40,
                    'TenureMonths': 24,
                    'MonthlyCharges': 65,
                    'TotalCharges': 1500,
                    'SupportCallsLast90d': 2,
                    'AvgDownlinkMbps': 50
                };
                this.featureDefaults[feature.name] = defaults[feature.name] || 0;
            }
        });
    },
    
    /**
     * Render Customer ID section
     */
    renderCustomerSection(container) {
        const section = document.createElement('div');
        section.className = 'form-section';
        section.setAttribute('data-section', 'customer');
        section.innerHTML = `
            <div class="form-section-header">
                <h3 class="form-section-title">👤 Customer Information</h3>
                <button type="button" class="btn btn-mini btn-predict" data-section="customer">
                    Predict
                </button>
            </div>
            <div class="form-section-content">
                <div class="form-field">
                    <label for="field-CustomerID">Customer ID</label>
                    <input type="text" 
                           id="field-CustomerID" 
                           name="CustomerID" 
                           placeholder="e.g., CUST100001"
                           value="CUST${Math.floor(Math.random() * 900000) + 100000}">
                    <small class="field-hint">Unique customer identifier</small>
                </div>
            </div>
        `;
        container.appendChild(section);
        
        // Add event listener for section predict button
        section.querySelector('.btn-predict').addEventListener('click', () => {
            this.predictSection('customer');
        });
    },
    
    /**
     * Render demographic section
     */
    renderDemographicSection(container, features) {
        if (features.length === 0) return;
        
        const section = document.createElement('div');
        section.className = 'form-section';
        section.setAttribute('data-section', 'demographic');
        
        const header = document.createElement('div');
        header.className = 'form-section-header';
        header.innerHTML = `
            <h3 class="form-section-title">📊 Demographics</h3>
            <button type="button" class="btn btn-mini btn-predict" data-section="demographic">
                Predict
            </button>
        `;
        section.appendChild(header);
        
        const content = document.createElement('div');
        content.className = 'form-section-content';
        
        features.forEach(feature => {
            content.appendChild(this.createFormField(feature));
        });
        
        section.appendChild(content);
        container.appendChild(section);
        
        // Add event listener for section predict button
        section.querySelector('.btn-predict').addEventListener('click', () => {
            this.predictSection('demographic');
        });
    },
    
    /**
     * Render service section
     */
    renderServiceSection(container, features) {
        if (features.length === 0) return;
        
        const section = document.createElement('div');
        section.className = 'form-section';
        section.setAttribute('data-section', 'service');
        
        const header = document.createElement('div');
        header.className = 'form-section-header';
        header.innerHTML = `
            <h3 class="form-section-title">📱 Service Details</h3>
            <button type="button" class="btn btn-mini btn-predict" data-section="service">
                Predict
            </button>
        `;
        section.appendChild(header);
        
        const content = document.createElement('div');
        content.className = 'form-section-content';
        
        features.forEach(feature => {
            content.appendChild(this.createFormField(feature));
        });
        
        section.appendChild(content);
        container.appendChild(section);
        
        // Add event listener for section predict button
        section.querySelector('.btn-predict').addEventListener('click', () => {
            this.predictSection('service');
        });
    },
    
    /**
     * Render usage section
     */
    renderUsageSection(container, features) {
        if (features.length === 0) return;
        
        const section = document.createElement('div');
        section.className = 'form-section';
        section.setAttribute('data-section', 'usage');
        
        const header = document.createElement('div');
        header.className = 'form-section-header';
        header.innerHTML = `
            <h3 class="form-section-title">📈 Usage Metrics</h3>
            <button type="button" class="btn btn-mini btn-predict" data-section="usage">
                Predict
            </button>
        `;
        section.appendChild(header);
        
        const content = document.createElement('div');
        content.className = 'form-section-content';
        
        features.forEach(feature => {
            content.appendChild(this.createFormField(feature));
        });
        
        section.appendChild(content);
        container.appendChild(section);
        
        // Add event listener for section predict button
        section.querySelector('.btn-predict').addEventListener('click', () => {
            this.predictSection('usage');
        });
    },
    
    /**
     * Render payment section
     */
    renderPaymentSection(container, features) {
        if (features.length === 0) return;
        
        const section = document.createElement('div');
        section.className = 'form-section';
        section.setAttribute('data-section', 'payment');
        
        const header = document.createElement('div');
        header.className = 'form-section-header';
        header.innerHTML = `
            <h3 class="form-section-title">💳 Payment & Billing</h3>
            <button type="button" class="btn btn-mini btn-predict" data-section="payment">
                Predict
            </button>
        `;
        section.appendChild(header);
        
        const content = document.createElement('div');
        content.className = 'form-section-content';
        
        features.forEach(feature => {
            content.appendChild(this.createFormField(feature));
        });
        
        section.appendChild(content);
        container.appendChild(section);
        
        // Add event listener for section predict button
        section.querySelector('.btn-predict').addEventListener('click', () => {
            this.predictSection('payment');
        });
    },
    
    /**
     * Create a form field element
     */
    createFormField(feature) {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'form-field';
        
        const label = document.createElement('label');
        label.textContent = this.formatFieldName(feature.name);
        label.setAttribute('for', `field-${feature.name}`);
        
        let input;
        
        if (feature.type === 'categorical' && feature.options.length > 0) {
            input = document.createElement('select');
            input.id = `field-${feature.name}`;
            input.name = feature.name;
            input.required = true;
            
            feature.options.forEach(option => {
                const optionEl = document.createElement('option');
                optionEl.value = option;
                optionEl.textContent = option;
                input.appendChild(optionEl);
            });
        } else {
            input = document.createElement('input');
            input.type = 'number';
            input.id = `field-${feature.name}`;
            input.name = feature.name;
            
            // Add validation attributes based on field name
            const validationRules = {
                'Age': { min: 18, max: 100, step: 1 },
                'TenureMonths': { min: 0, max: 120, step: 1 },
                'MonthlyCharges': { min: 0, max: 2000, step: 0.01 },
                'TotalCharges': { min: 0, max: 150000, step: 0.01 },
                'SupportCallsLast90d': { min: 0, max: 50, step: 1 },
                'AvgDownlinkMbps': { min: 0, max: 1000, step: 0.1 }
            };
            
            if (validationRules[feature.name]) {
                const rules = validationRules[feature.name];
                input.min = rules.min;
                input.max = rules.max;
                input.step = rules.step;
                input.title = `Value must be between ${rules.min} and ${rules.max}`;
            }
            input.step = 'any';
            input.value = '0';
            input.required = true;
            input.placeholder = `Enter ${this.formatFieldName(feature.name)}`;
        }
        
        fieldDiv.appendChild(label);
        fieldDiv.appendChild(input);
        
        return fieldDiv;
    },
    
    /**
     * Format field name for display
     */
    formatFieldName(name) {
        // Convert camelCase or PascalCase to Title Case with spaces
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    },
    
    /**
     * Render a single form field
     */
    renderFormField(feature, container) {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'form-field';
        
        const label = document.createElement('label');
        label.textContent = feature.name;
        label.setAttribute('for', `field-${feature.name}`);
        
        let input;
        
        if (feature.type === 'categorical' && feature.options.length > 0) {
            // Create select dropdown
            input = document.createElement('select');
            input.id = `field-${feature.name}`;
            input.name = feature.name;
            input.required = true;
            
            feature.options.forEach(option => {
                const optionEl = document.createElement('option');
                optionEl.value = option;
                optionEl.textContent = option;
                input.appendChild(optionEl);
            });
        } else {
            // Create number input
            input = document.createElement('input');
            input.type = 'number';
            input.id = `field-${feature.name}`;
            input.name = feature.name;
            input.step = 'any';
            input.value = '0';
            input.required = true;
        }
        
        fieldDiv.appendChild(label);
        fieldDiv.appendChild(input);
        container.appendChild(fieldDiv);
    },
    
    /**
     * Validate input data before prediction
     */
    validateInputData(inputData) {
        const errors = [];
        
        // Validate CustomerID format and range
        if ('CustomerID' in inputData) {
            const custId = String(inputData.CustomerID);
            if (custId.startsWith('CUST')) {
                const numericPart = parseInt(custId.replace('CUST', ''));
                if (isNaN(numericPart)) {
                    errors.push('CustomerID has invalid format. Expected: CUSTXXXXXX');
                } else if (numericPart < 100000) {
                    errors.push('CustomerID must be at least CUST100000');
                } else if (numericPart > 200000) {
                    errors.push('CustomerID cannot exceed CUST200000');
                }
            } else if (custId.toLowerCase() !== 'none' && custId !== '') {
                errors.push('CustomerID must start with CUST followed by numbers');
            }
        }
        
        // Validation rules
        const validationRules = {
            'Age': { min: 18, max: 100, label: 'Age' },
            'TenureMonths': { min: 0, max: 120, label: 'Tenure Months' },
            'MonthlyCharges': { min: 0, max: 2000, label: 'Monthly Charges' },
            'TotalCharges': { min: 0, max: 150000, label: 'Total Charges' },
            'SupportCallsLast90d': { min: 0, max: 50, label: 'Support Calls' },
            'AvgDownlinkMbps': { min: 0, max: 1000, label: 'Download Speed' }
        };
        
        // Check numeric fields
        for (const [field, rules] of Object.entries(validationRules)) {
            if (field in inputData) {
                const value = parseFloat(inputData[field]);
                
                if (isNaN(value)) {
                    errors.push(`${rules.label} must be a valid number`);
                } else if (value < rules.min) {
                    errors.push(`${rules.label} must be at least ${rules.min}`);
                } else if (value > rules.max) {
                    errors.push(`${rules.label} cannot exceed ${rules.max}`);
                }
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },
    
    /**
     * Setup form submission handler
     */
    setupFormSubmission() {
        const form = document.getElementById('prediction-form');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Collect form data
            const formData = new FormData(form);
            const inputData = {};
            
            // Fields that should always remain as strings
            const stringFields = ['CustomerID', 'customer_id', 'customerId'];
            
            for (let [key, value] of formData.entries()) {
                // Get the input element to check its type
                const inputElement = form.elements[key];
                
                // Keep certain fields as strings
                if (stringFields.includes(key) || 
                    (inputElement && inputElement.type === 'text') ||
                    (inputElement && inputElement.tagName === 'SELECT')) {
                    inputData[key] = value;
                } else {
                    // Try to convert to number for numeric inputs
                    const numValue = parseFloat(value);
                    inputData[key] = isNaN(numValue) ? value : numValue;
                }
            }
            
            // Ensure CustomerID is included
            if (!inputData.CustomerID) {
                const customerIdInput = document.getElementById('field-CustomerID');
                if (customerIdInput && customerIdInput.value) {
                    inputData.CustomerID = customerIdInput.value;
                }
            }
            
            // Make prediction
            await this.makePrediction(inputData);
        });
    },
    
    /**
     * Predict using only a specific section's data
     */
    async predictSection(sectionName) {
        const section = document.querySelector(`[data-section="${sectionName}"]`);
        const button = section.querySelector('.btn-predict');
        const originalText = button.textContent;
        
        try {
            // Show loading state
            button.textContent = 'Predicting...';
            button.disabled = true;
            
            // Collect data from this section only
            const sectionData = this.collectSectionData(section);
            
            // Merge with defaults for missing fields
            const fullData = { ...this.featureDefaults, ...sectionData };
            
            // Always include CustomerID from the form if available
            const customerIdInput = document.getElementById('field-CustomerID');
            if (customerIdInput && customerIdInput.value) {
                fullData.CustomerID = customerIdInput.value;
            }
            
            // Validate input data
            const validation = this.validateInputData(fullData);
            if (!validation.isValid) {
                showError('Validation Error: ' + validation.errors.join('; '));
                button.textContent = originalText;
                button.disabled = false;
                return;
            }
            
            // Make API call
            const result = await API.predict(fullData);
            
            // Display results with section label
            this.displayResults(result, this.getSectionLabel(sectionName));
            
            // Reset button
            button.textContent = originalText;
            button.disabled = false;
            
        } catch (error) {
            console.error('Prediction error:', error);
            showError('Prediction failed: ' + error.message);
            
            // Reset button
            button.textContent = originalText;
            button.disabled = false;
        }
    },
    
    /**
     * Collect data from a specific section
     */
    collectSectionData(section) {
        const data = {};
        const inputs = section.querySelectorAll('input, select');
        
        // Fields that should always remain as strings
        const stringFields = ['CustomerID', 'customer_id', 'customerId'];
        
        inputs.forEach(input => {
            const value = input.value;
            const fieldName = input.name;
            
            // Keep certain fields as strings
            if (stringFields.includes(fieldName) || input.type === 'text') {
                data[fieldName] = value;
            } else if (input.tagName === 'SELECT') {
                // Select dropdowns - keep as string (categorical)
                data[fieldName] = value;
            } else {
                // Try to convert to number for numeric inputs
                const numValue = parseFloat(value);
                data[fieldName] = isNaN(numValue) ? value : numValue;
            }
        });
        
        return data;
    },
    
    /**
     * Get human-readable section label
     */
    getSectionLabel(sectionName) {
        const labels = {
            'customer': 'Customer Information',
            'demographic': 'Demographics',
            'service': 'Service Details',
            'usage': 'Usage Metrics',
            'payment': 'Payment & Billing'
        };
        return labels[sectionName] || sectionName;
    },
    
    /**
     * Make prediction and display results
     */
    async makePrediction(inputData) {
        try {
            // Validate input data first
            const validation = this.validateInputData(inputData);
            if (!validation.isValid) {
                showError('Validation Error: ' + validation.errors.join('; '));
                return;
            }
            
            // Show loading state
            const submitBtn = document.querySelector('.btn-primary');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Predicting...';
            submitBtn.disabled = true;
            
            // Make API call
            const result = await API.predict(inputData);
            
            // Display results
            this.displayResults(result, 'All Sections');
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
        } catch (error) {
            console.error('Prediction error:', error);
            showError('Prediction failed: ' + error.message);
            
            // Reset button
            const submitBtn = document.querySelector('.btn-primary');
            submitBtn.textContent = '🎯 Predict with All Data';
            submitBtn.disabled = false;
        }
    },
    
    /**
     * Display prediction results
     */
    displayResults(result, sectionLabel = 'All Sections') {
        const resultDiv = document.getElementById('prediction-result');
        const sectionLabelEl = document.getElementById('result-section-label');
        const probabilityEl = document.getElementById('result-probability');
        const statusEl = document.getElementById('result-status');
        const confidenceEl = document.getElementById('result-confidence');
        const confidenceFill = document.getElementById('confidence-fill');
        
        // Show result section
        resultDiv.classList.remove('hidden');
        
        // Display section label
        sectionLabelEl.textContent = sectionLabel;
        
        // Display probability
        probabilityEl.textContent = formatPercentage(result.probability);
        
        // Display status
        const isChurn = result.prediction === 1 || result.probability >= 0.5;
        
        if (isChurn) {
            statusEl.className = 'result-status danger';
            statusEl.innerHTML = `
                <strong>⚠️ This customer is likely to churn</strong>
                <p class="mt-1">Recommendation: Consider retention strategies</p>
            `;
        } else {
            statusEl.className = 'result-status success';
            statusEl.innerHTML = `
                <strong>✅ This customer is unlikely to churn</strong>
                <p class="mt-1">Status: Customer appears stable</p>
            `;
        }
        
        // Display confidence
        const confidence = result.confidence || Math.max(result.probability, 1 - result.probability);
        confidenceEl.textContent = formatPercentage(confidence);
        confidenceFill.style.width = formatPercentage(confidence);
        
        // Scroll to results
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};
