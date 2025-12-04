/**
 * Prediction Module
 * Handles prediction form and results
 */

const Prediction = {
    formData: {},
    
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
     * Render Customer ID section
     */
    renderCustomerSection(container) {
        const section = document.createElement('div');
        section.className = 'form-section';
        section.innerHTML = `
            <h3 class="form-section-title">👤 Customer Information</h3>
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
    },
    
    /**
     * Render demographic section
     */
    renderDemographicSection(container, features) {
        if (features.length === 0) return;
        
        const section = document.createElement('div');
        section.className = 'form-section';
        section.innerHTML = '<h3 class="form-section-title">📊 Demographics</h3>';
        
        const content = document.createElement('div');
        content.className = 'form-section-content';
        
        features.forEach(feature => {
            content.appendChild(this.createFormField(feature));
        });
        
        section.appendChild(content);
        container.appendChild(section);
    },
    
    /**
     * Render service section
     */
    renderServiceSection(container, features) {
        if (features.length === 0) return;
        
        const section = document.createElement('div');
        section.className = 'form-section';
        section.innerHTML = '<h3 class="form-section-title">📱 Service Details</h3>';
        
        const content = document.createElement('div');
        content.className = 'form-section-content';
        
        features.forEach(feature => {
            content.appendChild(this.createFormField(feature));
        });
        
        section.appendChild(content);
        container.appendChild(section);
    },
    
    /**
     * Render usage section
     */
    renderUsageSection(container, features) {
        if (features.length === 0) return;
        
        const section = document.createElement('div');
        section.className = 'form-section';
        section.innerHTML = '<h3 class="form-section-title">📈 Usage Metrics</h3>';
        
        const content = document.createElement('div');
        content.className = 'form-section-content';
        
        features.forEach(feature => {
            content.appendChild(this.createFormField(feature));
        });
        
        section.appendChild(content);
        container.appendChild(section);
    },
    
    /**
     * Render payment section
     */
    renderPaymentSection(container, features) {
        if (features.length === 0) return;
        
        const section = document.createElement('div');
        section.className = 'form-section';
        section.innerHTML = '<h3 class="form-section-title">💳 Payment & Billing</h3>';
        
        const content = document.createElement('div');
        content.className = 'form-section-content';
        
        features.forEach(feature => {
            content.appendChild(this.createFormField(feature));
        });
        
        section.appendChild(content);
        container.appendChild(section);
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
     * Setup form submission handler
     */
    setupFormSubmission() {
        const form = document.getElementById('prediction-form');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Collect form data
            const formData = new FormData(form);
            const inputData = {};
            
            for (let [key, value] of formData.entries()) {
                // Try to convert to number if possible
                const numValue = parseFloat(value);
                inputData[key] = isNaN(numValue) ? value : numValue;
            }
            
            // Make prediction
            await this.makePrediction(inputData);
        });
    },
    
    /**
     * Make prediction and display results
     */
    async makePrediction(inputData) {
        try {
            // Show loading state
            const submitBtn = document.querySelector('.btn-primary');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Predicting...';
            submitBtn.disabled = true;
            
            // Make API call
            const result = await API.predict(inputData);
            
            // Display results
            this.displayResults(result);
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
        } catch (error) {
            console.error('Prediction error:', error);
            showError('Prediction failed: ' + error.message);
            
            // Reset button
            const submitBtn = document.querySelector('.btn-primary');
            submitBtn.textContent = '🎯 Predict Churn';
            submitBtn.disabled = false;
        }
    },
    
    /**
     * Display prediction results
     */
    displayResults(result) {
        const resultDiv = document.getElementById('prediction-result');
        const probabilityEl = document.getElementById('result-probability');
        const statusEl = document.getElementById('result-status');
        const confidenceEl = document.getElementById('result-confidence');
        const confidenceFill = document.getElementById('confidence-fill');
        
        // Show result section
        resultDiv.classList.remove('hidden');
        
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
