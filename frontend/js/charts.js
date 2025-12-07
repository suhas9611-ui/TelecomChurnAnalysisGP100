/**
 * Charts Module
 * Handles chart rendering using Plotly
 */

const Charts = {
    /**
     * Load and render all charts
     */
    async loadCharts() {
        try {
            const data = await API.getChartData();
            const container = document.getElementById('charts-container');
            
            if (!data.charts || data.charts.length === 0) {
                container.innerHTML = '<p class="text-center">No chart data available</p>';
                return;
            }
            
            // Clear loading message
            container.innerHTML = '';
            
            // Render each chart
            data.charts.forEach((chart, index) => {
                this.renderChart(chart, container, index);
            });
            
        } catch (error) {
            console.error('Error loading charts:', error);
            showError('Failed to load charts: ' + error.message);
        }
    },
    
    /**
     * Render a single chart
     */
    renderChart(chartData, container, index) {
        // Create chart container
        const chartDiv = document.createElement('div');
        chartDiv.className = 'chart-container';
        chartDiv.id = `chart-${index}`;
        container.appendChild(chartDiv);
        
        // Prepare data for Plotly
        const traces = this.prepareChartTraces(chartData);
        
        // Chart layout for pie charts
        const layout = {
            title: {
                text: `Churn by ${chartData.column}`,
                font: { 
                    size: 18, 
                    weight: 700,
                    color: '#0f172a'
                },
                x: 0.5,
                xanchor: 'center'
            },
            showlegend: true,
            legend: {
                orientation: 'v',
                y: 0.5,
                x: 1.1,
                xanchor: 'left',
                font: { size: 11 }
            },
            margin: { t: 60, b: 40, l: 40, r: 140 },
            height: 420,
            autosize: true,
            paper_bgcolor: '#ffffff'
        };
        
        // Render chart with config
        const config = {
            ...CONFIG.chartConfig,
            responsive: true,
            displaylogo: false
        };
        
        Plotly.newPlot(chartDiv.id, traces, layout, config);
    },
    
    /**
     * Prepare chart traces from data
     */
    prepareChartTraces(chartData) {
        // Aggregate data by category
        const categoryTotals = {};
        
        chartData.data.forEach(item => {
            const category = item[chartData.column];
            const count = item.count;
            
            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }
            categoryTotals[category] += count;
        });
        
        // Get categories and values
        const labels = Object.keys(categoryTotals);
        const values = Object.values(categoryTotals);
        
        // Create color palette
        const colors = [
            '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
            '#10b981', '#06b6d4', '#6366f1', '#f97316',
            '#14b8a6', '#a855f7', '#ef4444', '#84cc16'
        ];
        
        // Create pie chart trace
        const trace = {
            labels: labels,
            values: values,
            type: 'pie',
            marker: {
                colors: colors.slice(0, labels.length)
            },
            textinfo: 'label+percent',
            textposition: 'auto',
            hoverinfo: 'label+value+percent',
            hole: 0  // Set to 0.4 for donut chart
        };
        
        return [trace];
    }
};
