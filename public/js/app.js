class ExpenseTracker {
    constructor() {
        this.transactions = [];
        this.budgets = [];
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        console.log('Initializing Expense Tracker...');
        await this.checkAuthStatus();
        
        if (this.isAuthenticated) {
            console.log('User is authenticated:', this.currentUser.username);
            this.showMainApp();
            this.setupEventListeners();
            await this.loadInitialData();
        } else {
            console.log('User not authenticated, showing login form');
            this.showAuthForms();
        }
    }

    async checkAuthStatus() {
        try {
            console.log('Checking authentication status...');
            const response = await fetch('/api/auth/current');
            
            if (response.ok) {
                const data = await response.json();
                console.log('Auth response:', data);
                if (data.success && data.user) {
                    this.currentUser = data.user;
                    this.isAuthenticated = true;
                    console.log('User authenticated:', this.currentUser.username);
                    return true;
                }
            }
            console.log('User not authenticated');
        } catch (error) {
            console.log('Auth check failed:', error);
        }
        
        this.isAuthenticated = false;
        this.currentUser = null;
        return false;
    }

    showAuthForms() {
        console.log('Showing auth forms');
        
        // Clear any existing content
        document.body.innerHTML = '';
        
                
               const authHTML = `
    <div class="auth-container" style="max-width: 400px; margin: 50px auto; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <h2 style="text-align: center; color: #667eea; margin-bottom: 30px;">💰 Expense Tracker</h2>
        
        <!-- LOGIN FORM -->
        <div id="loginForm" style="display: block;">
            <h3 style="margin-bottom: 20px; color: #333;">Login</h3>
            <form id="loginFormElement" style="display: flex; gap: 15px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                    <input type="text" id="loginUsername" placeholder="Username or Email" required 
                           style="width: 100%; padding: 12px; margin-bottom: 15px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
                </div>
                
                <div style="flex: 1; min-width: 200px;">
                    <input type="password" id="loginPassword" placeholder="Password" required 
                           style="width: 100%; padding: 12px; margin-bottom: 15px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
                </div>
                
                <div style="flex-basis: 100%;">
                    <button type="submit" style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold;">
                        Login
                    </button>
                </div>
            </form>
            <p style="text-align: center; margin-top: 20px; color: #666;">
                Don't have an account? 
                <a href="#" id="showRegister" style="color: #667eea; cursor: pointer; font-weight: bold;">Register here</a>
            </p>
        </div>
        
        <!-- REGISTER FORM -->
        <div id="registerForm" style="display: none;">
            <h3 style="margin-bottom: 20px; color: #333;">Register</h3>
            <form id="registerFormElement" style="display: flex; gap: 15px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                    <input type="text" id="registerUsername" placeholder="Username" required 
                           style="width: 100%; padding: 12px; margin-bottom: 15px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
                </div>
                
                <div style="flex: 1; min-width: 200px;">
                    <input type="email" id="registerEmail" placeholder="Email" required 
                           style="width: 100%; padding: 12px; margin-bottom: 15px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
                </div>
                
                <div style="flex-basis: 100%;">
                    <input type="password" id="registerPassword" placeholder="Password (min 6 characters)" required 
                           style="width: 100%; padding: 12px; margin-bottom: 15px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
                </div>
                
                <div style="flex-basis: 100%;">
                    <button type="submit" style="width: 100%; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold;">
                        Register
                    </button>
                </div>
            </form>
            <p style="text-align: center; margin-top: 20px; color: #666;">
                Already have an account? 
                <a href="#" id="showLogin" style="color: #667eea; cursor: pointer; font-weight: bold;">Login here</a>
            </p>
        </div>
        
        <div id="authMessage" style="margin-top: 20px; padding: 15px; border-radius: 5px; text-align: center;"></div>
    </div>
`;
        
        document.body.innerHTML = authHTML;
        
        // Add event listeners
        document.getElementById('loginFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        document.getElementById('registerFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });
    }

    showLoginForm() {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('authMessage').innerHTML = '';
        document.getElementById('authMessage').style.background = 'transparent';
    }

    showRegisterForm() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
        document.getElementById('authMessage').innerHTML = '';
        document.getElementById('authMessage').style.background = 'transparent';
    }

    async login() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const authMessage = document.getElementById('authMessage');

        authMessage.innerHTML = '<div style="color: #2196F3;">Logging in...</div>';
        authMessage.style.background = '#e3f2fd';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            console.log('Login response:', data);
            
            if (data.success) {
                authMessage.innerHTML = '<div style="color: #4CAF50;">✅ Login successful! Loading dashboard...</div>';
                authMessage.style.background = '#d4edda';
                
                // Wait a bit then reload to show main app
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                authMessage.innerHTML = `<div style="color: #F44336;">❌ ${data.message}</div>`;
                authMessage.style.background = '#f8d7da';
            }
        } catch (error) {
            console.error('Login error:', error);
            authMessage.innerHTML = '<div style="color: #F44336;">❌ Network error. Please try again.</div>';
            authMessage.style.background = '#f8d7da';
        }
    }

    async register() {
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const authMessage = document.getElementById('authMessage');

        if (password.length < 6) {
            authMessage.innerHTML = '<div style="color: #F44336;">❌ Password must be at least 6 characters</div>';
            authMessage.style.background = '#f8d7da';
            return;
        }

        authMessage.innerHTML = '<div style="color: #2196F3;">Creating account...</div>';
        authMessage.style.background = '#e3f2fd';

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            console.log('Register response:', data);
            
            if (data.success) {
                authMessage.innerHTML = '<div style="color: #4CAF50;">✅ Registration successful! Loading dashboard...</div>';
                authMessage.style.background = '#d4edda';
                
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                authMessage.innerHTML = `<div style="color: #F44336;">❌ ${data.message}</div>`;
                authMessage.style.background = '#f8d7da';
            }
        } catch (error) {
            console.error('Registration error:', error);
            authMessage.innerHTML = '<div style="color: #F44336;">❌ Registration failed. Please try again.</div>';
            authMessage.style.background = '#f8d7da';
        }
    }

    async logout() {
        try {
            const response = await fetch('/api/auth/logout', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                this.showNotification('✅ Logged out successfully!', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('❌ Logout failed', 'error');
        }
    }

    showMainApp() {
        console.log('Showing main application');
        // Main app HTML is already loaded from index.html
        // Just setup logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Transaction form
        const transactionForm = document.getElementById('transactionForm');
        if (transactionForm) {
            transactionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTransaction();
            });
        } else {
            console.error('Transaction form not found');
        }

        // Budget form
        const budgetForm = document.getElementById('budgetForm');
        if (budgetForm) {
            budgetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.setBudget();
            });
        } else {
            console.error('Budget form not found');
        }
    }

    async loadInitialData() {
        console.log('Loading initial data...');
        try {
            await this.loadTransactions();
            await this.loadBudgets();
            setTimeout(() => {
                this.refreshAllAnalytics();
                this.checkBudgetAlerts();
            }, 500);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    // 🟢 ADD TRANSACTION
    async addTransaction() {
        console.log('Adding transaction...');
        const type = document.getElementById('type').value;
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value.trim();
        const description = document.getElementById('description').value.trim();

        if (!type || !amount || !category) {
            this.showNotification('❌ Please fill all required fields!', 'error');
            return;
        }

        if (parseFloat(amount) <= 0) {
            this.showNotification('❌ Amount must be greater than 0!', 'error');
            return;
        }

        const formData = {
            type: type,
            amount: parseFloat(amount),
            category: category,
            description: description
        };

        try {
            console.log('Sending transaction:', formData);
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                this.showNotification('✅ Transaction added successfully!', 'success');
                this.resetForm('transactionForm');
                
                await this.loadTransactions();
                this.checkBudgetAlerts();
                this.refreshAllAnalytics();
                
            } else {
                this.showNotification(`❌ Error: ${data.message || 'Failed to add transaction'}`, 'error');
            }
        } catch (error) {
            console.error('Network error:', error);
            this.showNotification('❌ Network error - check console for details', 'error');
        }
    }

    // 🟢 SET BUDGET
    async setBudget() {
        console.log('Setting budget...');
        const category = document.getElementById('budgetCategory').value.trim();
        const limit = document.getElementById('budgetLimit').value;

        if (!category || !limit) {
            this.showNotification('❌ Please fill all budget fields!', 'error');
            return;
        }

        if (parseFloat(limit) <= 0) {
            this.showNotification('❌ Budget limit must be greater than 0!', 'error');
            return;
        }

        const formData = {
            category: category,
            limit: parseFloat(limit)
        };

        try {
            console.log('Sending budget:', formData);
            const response = await fetch('/api/budget', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                this.showNotification('✅ Budget set successfully!', 'success');
                this.resetForm('budgetForm');
                await this.loadBudgets();
                this.checkBudgetAlerts();
                this.refreshAllAnalytics();
            } else {
                this.showNotification(`❌ Error: ${data.message}`, 'error');
            }
        } catch (error) {
            console.error('Error setting budget:', error);
            this.showNotification('❌ Error setting budget', 'error');
        }
    }

    // 📥 LOAD TRANSACTIONS
    async loadTransactions() {
        try {
            console.log('Loading transactions...');
            const response = await fetch('/api/transactions');
            if (response.ok) {
                this.transactions = await response.json();
                console.log('📥 Loaded transactions:', this.transactions.length);
                this.displayTransactions();
            } else {
                console.error('Failed to load transactions');
                const error = await response.json();
                console.error('Error details:', error);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            const container = document.getElementById('transactionsList');
            if (container) {
                container.innerHTML = 
                    '<p style="color: red; text-align: center; padding: 20px;">Error loading transactions. Please refresh the page.</p>';
            }
        }
    }

    // 📥 LOAD BUDGETS
    async loadBudgets() {
        try {
            console.log('Loading budgets...');
            const response = await fetch('/api/budget');
            if (response.ok) {
                this.budgets = await response.json();
                console.log('📥 Loaded budgets:', this.budgets.length);
                this.displayBudgets();
            } else {
                console.error('Failed to load budgets');
            }
        } catch (error) {
            console.error('Error loading budgets:', error);
        }
    }

    // 📋 DISPLAY TRANSACTIONS (Your existing method)
    displayTransactions() {
        const container = document.getElementById('transactionsList');
        if (!container) {
            console.error('transactionsList container not found');
            return;
        }
        
        if (!this.transactions || this.transactions.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <h3>No transactions yet</h3>
                    <p>Add your first transaction to start financial tracking!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.transactions.map(transaction => `
            <div class="transaction-item ${transaction.type}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <strong style="font-size: 1.1em;">${transaction.category}</strong>
                        <div style="color: #666; margin-top: 5px;">
                            ${transaction.description || 'No description'}
                        </div>
                        <small style="color: #888;">
                            ${new Date(transaction.date).toLocaleDateString()} • 
                            ${transaction.type.toUpperCase()}
                        </small>
                    </div>
                    <div style="text-align: right; display: flex; align-items: center; gap: 15px;">
                        <strong style="font-size: 1.2em; color: ${transaction.type === 'income' ? '#4CAF50' : '#F44336'}">
                            ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toLocaleString('en-IN')}
                        </strong>
                        <button onclick="expenseTracker.deleteTransaction('${transaction._id}')" class="delete-btn">
                            🗑
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 📋 DISPLAY BUDGETS FOR EDITING (Your existing method)
    displayBudgets() {
        const container = document.getElementById('budgetsList');
        if (!container) {
            console.error('budgetsList container not found');
            return;
        }

        if (!this.budgets || this.budgets.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #666;">
                    <p>No budgets set yet. Add your first budget above!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.budgets.map(budget => `
            <div class="budget-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin: 5px 0; background: #f8f9fa; border-radius: 8px;">
                <div>
                    <strong>${budget.category}</strong>: ₹${budget.limit.toLocaleString('en-IN')}/month
                </div>
                <div>
                    <button onclick="expenseTracker.editBudget('${budget.category}', ${budget.limit})" 
                            style="background: #667eea; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                        ✏ Edit
                    </button>
                    <button onclick="expenseTracker.deleteBudget('${budget._id}')" 
                            style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                        🗑 Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ✏ EDIT BUDGET
    editBudget(category, limit) {
        document.getElementById('budgetCategory').value = category;
        document.getElementById('budgetLimit').value = limit;
        
        document.getElementById('budgetForm').scrollIntoView({ behavior: 'smooth' });
        
        this.showNotification(`✏ Editing ${category} budget. Update the amount and click "Set/Update Budget"`, 'info');
    }

    // 🗑 DELETE SINGLE BUDGET
    async deleteBudget(budgetId) {
        if (!confirm('Are you sure you want to delete this budget?')) {
            return;
        }

        try {
            const response = await fetch(`/api/budget/${budgetId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showNotification('✅ Budget deleted successfully!', 'success');
                await this.loadBudgets();
                this.refreshAllAnalytics();
            } else {
                this.showNotification('❌ Error deleting budget', 'error');
            }
        } catch (error) {
            console.error('Error deleting budget:', error);
            this.showNotification('❌ Network error', 'error');
        }
    }

    // 🗑 DELETE TRANSACTION
    async deleteTransaction(transactionId) {
        if (!confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        try {
            const response = await fetch(`/api/transactions/${transactionId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showNotification('✅ Transaction deleted successfully!', 'success');
                await this.loadTransactions();
                this.refreshAllAnalytics();
            } else {
                this.showNotification('❌ Error deleting transaction', 'error');
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            this.showNotification('❌ Network error', 'error');
        }
    }

    // 🔔 CHECK BUDGET ALERTS
    async checkBudgetAlerts() {
        try {
            const response = await fetch('/api/budget/alerts');
            if (response.ok) {
                const alerts = await response.json();
                this.displayAlerts(alerts);
            }
        } catch (error) {
            console.error('Error checking alerts:', error);
        }
    }
    

    // 📢 DISPLAY ALERTS
    displayAlerts(alerts) {
        const container = document.getElementById('notifications');
        if (!container) return;
        
        if (!alerts || alerts.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="notification">
                <strong>💰 Budget Alert for "${alert.category}":</strong><br>
                You've spent ₹${alert.spent.toLocaleString('en-IN')} out of ₹${alert.limit.toLocaleString('en-IN')} limit.<br>
                <strong style="color: #c62828;">${alert.alert}</strong>
            </div>
        `).join('');
    }

    // 📊 REFRESH ALL ANALYTICS
    refreshAllAnalytics() {
        console.log('🔄 Refreshing all analytics...');
        try {
            this.initializeCharts();
            
            if (typeof this.generateBudgetRecommendations === 'function') {
                this.generateBudgetRecommendations();
            }
            
            if (typeof this.generateMonthlySummary === 'function') {
                this.generateMonthlySummary();
            }
            
        } catch(error) {
            console.error('Error in refreshAllAnalytics:', error);
        }
    }

    // 📈 INITIALIZE CHARTS (Your existing method)
    initializeCharts() {
        console.log('🎯 Initializing charts...');
        
        this.destroyExistingCharts();
        
        setTimeout(() => {
            this.createRealExpenseChart();
            this.createRealMonthlyChart();
            this.createBudgetVsActualChart();
        }, 500);
    }

    // 🗑 DESTROY EXISTING CHARTS
    destroyExistingCharts() {
        const chartIds = ['expenseChart', 'monthlyChart', 'budgetChart'];
        chartIds.forEach(chartId => {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                const chart = Chart.getChart(canvas);
                if (chart) {
                    console.log('🗑 Destroying existing chart:', chartId);
                    chart.destroy();
                }
            }
        });
    }


    // 📊 REFRESH ALL ANALYTICS
refreshAllAnalytics() {
    console.log('🔄 Refreshing all analytics...');
    try {
        this.initializeCharts();
        
        if (typeof this.generateBudgetRecommendations === 'function') {
            this.generateBudgetRecommendations();
        }
        
        if (typeof this.generateMonthlySummary === 'function') {
            this.generateMonthlySummary();
        }
        
    } catch(error) {
        console.error('Error in refreshAllAnalytics:', error);
    }
}

// 📈 INITIALIZE CHARTS
initializeCharts() {
    console.log('🎯 Initializing charts...');
    
    // Clear existing charts first
    this.destroyExistingCharts();
    
    // Wait a bit to ensure DOM is ready
    setTimeout(() => {
        this.createRealExpenseChart();
        this.createRealMonthlyChart();
        this.createBudgetVsActualChart();
    }, 500);
}

// 🗑 DESTROY EXISTING CHARTS
destroyExistingCharts() {
    const chartIds = ['expenseChart', 'monthlyChart', 'budgetChart'];
    chartIds.forEach(chartId => {
        const canvas = document.getElementById(chartId);
        if (canvas) {
            const chart = Chart.getChart(canvas);
            if (chart) {
                console.log('🗑 Destroying existing chart:', chartId);
                chart.destroy();
            }
        }
    });
}

// 🍰 CREATE REAL EXPENSE CHART - ADD THIS MISSING METHOD
createRealExpenseChart() {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) {
        console.log('ℹ expenseChart not found');
        return;
    }
    
    console.log('🎯 Creating expense chart...');
    
    // Destroy existing chart
    const existingChart = Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();

    const expenseData = this.calculateExpenseDistribution();
    
    if (!expenseData || expenseData.labels.length === 0) {
        console.log('ℹ No expense data available');
        this.showEmptyChart(ctx, 'Add expenses to see distribution');
        return;
    }

    try {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: expenseData.labels,
                datasets: [{
                    data: expenseData.values,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', 
                        '#4BC0C0', '#9966FF', '#FF9F40'
                    ]
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Your Actual Spending Distribution',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        console.log('✅ Expense chart created successfully');
    } catch (error) {
        console.error('❌ Error creating expense chart:', error);
    }
}

// 📊 CALCULATE EXPENSE DISTRIBUTION - ADD THIS MISSING METHOD
calculateExpenseDistribution() {
    const categoryMap = {};
    
    // Get all expense transactions
    this.transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            const category = transaction.category.trim();
            categoryMap[category] = (categoryMap[category] || 0) + transaction.amount;
        }
    });
    
    // Convert to arrays for chart
    const labels = Object.keys(categoryMap);
    const values = Object.values(categoryMap);
    
    return { labels, values };
}

// 📅 ENHANCED MONTHLY CHART WITH COMPARISON
createRealMonthlyChart() {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;

    const monthlyData = this.calculateRealMonthlyData();
    
    // Destroy existing chart
    const existingChart = Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();

    // Determine chart title and subtitle based on data availability
    let chartTitle = 'Monthly Income vs Expenses';
    let subtitleText = '';
    let subtitleColor = '#666';
    
    if (monthlyData.totalMonths === 0) {
        chartTitle = 'Monthly Summary';
        subtitleText = '📝 Add transactions to see monthly data';
        subtitleColor = '#FF9800';
    } else if (monthlyData.totalMonths === 1) {
        chartTitle = 'Current Month Summary';
        subtitleText = '📊 No previous month data available for comparison';
        subtitleColor = '#FF9800';
    } else {
        chartTitle = `Monthly Trend (${monthlyData.totalMonths} months)`;
        subtitleText = '✅ Historical data available for comparison';
        subtitleColor = '#4CAF50';
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlyData.months.length > 0 ? monthlyData.months : ['No Data'],
            datasets: [
                {
                    label: 'Income ₹',
                    data: monthlyData.income.length > 0 ? monthlyData.income : [0],
                    backgroundColor: '#4CAF50',
                    borderColor: '#388E3C',
                    borderWidth: 1
                },
                {
                    label: 'Expenses ₹', 
                    data: monthlyData.expenses.length > 0 ? monthlyData.expenses : [0],
                    backgroundColor: '#F44336',
                    borderColor: '#D32F2F',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: chartTitle,
                    font: { 
                        size: 16, 
                        weight: 'bold' 
                    }
                },
                subtitle: {
                    display: true,
                    text: subtitleText,
                    color: subtitleColor,
                    font: { 
                        size: 12, 
                        weight: 'bold',
                        style: 'italic'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ₹${context.raw.toLocaleString('en-IN')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount (₹)'
                    },
                    ticks: {
                        callback: (value) => '₹' + value.toLocaleString('en-IN')
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: monthlyData.totalMonths > 1 ? 'Months' : 'Current Month'
                    }
                }
            }
        }
    });
}

// 🎯 BUDGET VS ACTUAL CHART
createBudgetVsActualChart() {
    const ctx = document.getElementById('budgetChart');
    if (!ctx) {
        console.log('ℹ budgetChart not found (might be intentional)');
        return;
    }
    
    console.log('🎯 Creating budget vs actual chart...');

    const budgetData = this.calculateBudgetVsActual();
    
    if (budgetData.categories.length === 0) {
        console.log('ℹ No budgets set, showing empty chart');
        this.showEmptyChart(ctx, 'Set budgets to see comparison');
        return;
    }

    try {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: budgetData.categories,
                datasets: [
                    {
                        label: 'Budget Limit ₹',
                        data: budgetData.budget,
                        backgroundColor: '#36A2EB'
                    },
                    {
                        label: 'Actual Spent ₹',
                        data: budgetData.actual,
                        backgroundColor: '#FF6384'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Budget vs Actual Spending',
                        font: {
                            size: 16
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                }
            }
        });
        console.log('✅ Budget vs Actual chart created successfully');
    } catch (error) {
        console.error('❌ Error creating budget chart:', error);
    }
}

// 📊 CALCULATE MONTHLY DATA
calculateRealMonthlyData() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Group transactions by month-year
    const monthlyMap = {};
    
    this.transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const month = date.getMonth();
        const year = date.getFullYear();
        const monthYearKey = `${year}-${month}`;
        const monthLabel = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        if (!monthlyMap[monthYearKey]) {
            monthlyMap[monthYearKey] = {
                label: monthLabel,
                income: 0,
                expenses: 0,
                month: month,
                year: year
            };
        }
        
        if (transaction.type === 'income') {
            monthlyMap[monthYearKey].income += transaction.amount;
        } else {
            monthlyMap[monthYearKey].expenses += transaction.amount;
        }
    });
    
    // Sort months chronologically
    const sortedMonths = Object.values(monthlyMap).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });
    
    // Extract data for chart
    const months = sortedMonths.map(m => m.label);
    const income = sortedMonths.map(m => m.income);
    const expenses = sortedMonths.map(m => m.expenses);
    
    console.log('📊 Monthly data:', { 
        months, 
        totalMonths: sortedMonths.length 
    });
    
    return {
        months: months,
        income: income,
        expenses: expenses,
        totalMonths: sortedMonths.length
    };
}

// 📊 CALCULATE BUDGET VS ACTUAL DATA
calculateBudgetVsActual() {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const categories = [];
    const budget = [];
    const actual = [];

    this.budgets.forEach(budgetItem => {
        const categoryExpenses = this.transactions
            .filter(t => t.type === 'expense' && 
                        t.category === budgetItem.category && 
                        new Date(t.date) >= currentMonth)
            .reduce((sum, t) => sum + t.amount, 0);

        categories.push(budgetItem.category);
        budget.push(budgetItem.limit);
        actual.push(categoryExpenses);
    });

    return { categories, budget, actual };
}

// 💡 BUDGET RECOMMENDATIONS - 100% WORKING VERSION
generateBudgetRecommendations() {
    console.log('💡 Generating budget recommendations...');
    
    const grid = document.getElementById('recommendationsGrid');
    if (!grid) {
        console.error('❌ recommendationsGrid not found!');
        return;
    }

    // Calculate financial metrics
    const totalIncome = this.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = this.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Analyze spending patterns by category
    const categorySpending = {};
    this.transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            const category = t.category.toLowerCase().trim();
            categorySpending[category] = (categorySpending[category] || 0) + t.amount;
        });

    console.log('🔍 DEBUG - All categories detected:', categorySpending);

    const recommendations = [];

    // 🚨 1. CRITICAL - Expenses > Income
    if (totalExpenses > totalIncome) {
        const overspendAmount = totalExpenses - totalIncome;
        recommendations.push({
            title: '🚨 Critical: You Are Overspending',
            description: `You're spending ₹${overspendAmount.toLocaleString('en-IN')} more than you earn. Immediate action needed.`,
            action: 'Reduce discretionary spending by 30% immediately',
            priority: 'critical',
            icon: '🚨'
        });
    }

    // 💰 2. LOW SAVINGS - Savings < 15%
    if (savingsRate < 15 && totalIncome > 0) {
        recommendations.push({
            title: 'Low Savings Rate',
            description: `Your savings rate is ${savingsRate.toFixed(1)}%. Healthy range is 15-20%.`,
            action: `Aim to save ₹${Math.round(totalIncome * 0.15).toLocaleString('en-IN')} monthly`,
            priority: 'high',
            icon: '💰'
        });
    }

    // 🍔 3. FOOD ALERT - Food > 25% income
    const foodAmount = categorySpending['food'] || 0;
    console.log('🍔 FOOD CHECK:', { amount: foodAmount, threshold: totalIncome * 0.25, shouldShow: foodAmount > totalIncome * 0.25 });
    if (foodAmount > totalIncome * 0.25 && totalIncome > 0) {
        const foodPercentage = Math.round((foodAmount / totalIncome) * 100);
        recommendations.push({
            title: 'High Food Spending',
            description: `You're spending ${foodPercentage}% of income (₹${foodAmount.toLocaleString('en-IN')}) on food.`,
            action: 'Meal prep at home & limit restaurant visits',
            priority: 'high',
            icon: '🍔'
        });
    }

    // 🚗 4. TRANSPORT - Transport > 15% income
    const transportAmount = categorySpending['transport'] || 0;
    console.log('🚗 TRANSPORT CHECK:', { amount: transportAmount, threshold: totalIncome * 0.15, shouldShow: transportAmount > totalIncome * 0.15 });
    if (transportAmount > totalIncome * 0.15 && totalIncome > 0) {
        const transportPercentage = Math.round((transportAmount / totalIncome) * 100);
        recommendations.push({
            title: 'Transportation Costs',
            description: `Transportation is taking ${transportPercentage}% (₹${transportAmount.toLocaleString('en-IN')}) of your income.`,
            action: 'Use public transport, carpool, or optimize travel routes',
            priority: 'medium',
            icon: '🚗'
        });
    }

    // 🛒 5. SHOPPING - Shopping > 20% income
    const shoppingAmount = categorySpending['shopping'] || 0;
    console.log('🛒 SHOPPING CHECK:', { amount: shoppingAmount, threshold: totalIncome * 0.20, shouldShow: shoppingAmount > totalIncome * 0.20 });
    if (shoppingAmount > totalIncome * 0.20 && totalIncome > 0) {
        const shoppingPercentage = Math.round((shoppingAmount / totalIncome) * 100);
        recommendations.push({
            title: 'Shopping Alert',
            description: `High discretionary spending detected (${shoppingPercentage}% of income).`,
            action: 'Implement 24-hour waiting period before non-essential purchases',
            priority: 'high',
            icon: '🛒'
        });
    }

    // 📱 6. RECHARGE - Recharge > ₹1,000
    const rechargeAmount = categorySpending['recharge'] || 0;
    console.log('📱 RECHARGE CHECK:', { amount: rechargeAmount, threshold: 1000, shouldShow: rechargeAmount > 1000 });
    if (rechargeAmount > 1000) {
        recommendations.push({
            title: 'Mobile/Internet Costs',
            description: `Your mobile/internet spending is ₹${rechargeAmount.toLocaleString('en-IN')} monthly.`,
            action: 'Switch to budget plans or family shared plans',
            priority: 'medium',
            icon: '📱'
        });
    }

    // 💳 7. SUBSCRIPTION - Subscription > ₹500
    const subscriptionAmount = categorySpending['subscription'] || 0;
    console.log('💳 SUBSCRIPTION CHECK:', { amount: subscriptionAmount, threshold: 500, shouldShow: subscriptionAmount > 500 });
    if (subscriptionAmount > 500) {
        recommendations.push({
            title: 'Subscription Overload',
            description: `You're spending ₹${subscriptionAmount.toLocaleString('en-IN')} on subscriptions monthly.`,
            action: 'Cancel unused subscriptions, share family plans',
            priority: 'medium',
            icon: '💳'
        });
    }

    // ✅ 8. GOOD FINANCIAL HEALTH
    if (recommendations.length === 0 && totalIncome > 0) {
        recommendations.push({
            title: '✅ Good Financial Health',
            description: 'Your spending patterns are balanced. Maintain this discipline.',
            action: 'Consider investing your savings for growth',
            priority: 'low',
            icon: '✅'
        });
    }

    // Display recommendations sorted by priority
    const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Update HTML
    grid.innerHTML = recommendations.map(rec => `
        <div class="recommendation-card ${rec.priority}">
            <div class="rec-icon">${rec.icon}</div>
            <div class="rec-content">
                <h5>${rec.title}</h5>
                <p>${rec.description}</p>
                <div class="rec-action">
                    <strong>Recommended Action:</strong> ${rec.action}
                </div>
            </div>
        </div>
    `).join('');

    console.log('✅ FINAL: Generated', recommendations.length, 'recommendations');
}

// 📊 SIMPLE MONTHLY SUMMARY - MATCHES ABSTRACT EXACTLY
generateMonthlySummary() {
    console.log('📊 Generating monthly summary (current month only)...');
    
    const summaryCards = document.getElementById('summaryCards');
    const summaryMonth = document.getElementById('summaryMonth');
    
    if (!summaryCards) return;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculate CURRENT MONTH data only
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);

    const currentMonthTransactions = this.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd;
    });

    const currentIncome = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const currentExpenses = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const currentNetSavings = currentIncome - currentExpenses;
    const currentSavingsRate = currentIncome > 0 ? (currentNetSavings / currentIncome) * 100 : 0;

    // Update month display
    if (summaryMonth) {
        summaryMonth.textContent = currentDate.toLocaleString('default', { 
            month: 'long', 
            year: 'numeric' 
        });
    }

    // SIMPLE DISPLAY - CURRENT MONTH DATA ONLY
    summaryCards.innerHTML = `
        <div class="summary-card income">
            <div class="card-icon">💰</div>
            <div class="card-content">
                <div class="card-value">₹${currentIncome.toLocaleString('en-IN')}</div>
                <div class="card-label">Total Income</div>
            </div>
        </div>
        
        <div class="summary-card expense">
            <div class="card-icon">💸</div>
            <div class="card-content">
                <div class="card-value">₹${currentExpenses.toLocaleString('en-IN')}</div>
                <div class="card-label">Total Expenses</div>
            </div>
        </div>
        
        <div class="summary-card savings">
            <div class="card-icon">🎯</div>
            <div class="card-content">
                <div class="card-value" style="color: ${currentNetSavings >= 0 ? '#4CAF50' : '#F44336'}">
                    ₹${Math.abs(currentNetSavings).toLocaleString('en-IN')}
                </div>
                <div class="card-label">${currentNetSavings >= 0 ? 'Net Savings' : 'Net Loss'}</div>
            </div>
        </div>
        
        <div class="summary-card rate">
            <div class="card-icon">📈</div>
            <div class="card-content">
                <div class="card-value" style="color: ${currentSavingsRate >= 0 ? '#4CAF50' : '#F44336'}">
                    ${currentSavingsRate.toFixed(1)}%
                </div>
                <div class="card-label">Savings Rate</div>
            </div>
        </div>
    `;

    console.log('✅ Monthly summary generated successfully');
}

// 🐛 DEBUG METHOD
debugCategoryDetection() {
    console.log('=== 🔍 DEBUGGING CATEGORY DETECTION ===');
    
    // Calculate totals
    const totalIncome = this.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    // Get all categories
    const categorySpending = {};
    this.transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            const category = t.category.toLowerCase().trim();
            categorySpending[category] = (categorySpending[category] || 0) + t.amount;
        });

    console.log('📊 ALL TRANSACTIONS:');
    this.transactions.forEach(t => {
        console.log(`- ${t.type} | ${t.category} | ₹${t.amount}`);
    });

    console.log('🎯 CATEGORY ANALYSIS:');
    Object.entries(categorySpending).forEach(([category, amount]) => {
        console.log(`- "${category}": ₹${amount}`);
    });

    console.log('🚨 CHECKING EACH RECOMMENDATION:');
    
    // Check Shopping
    const shoppingAmount = categorySpending['shopping'] || 0;
    console.log('🛒 SHOPPING:', {
        amount: shoppingAmount,
        threshold: totalIncome * 0.20,
        needed: totalIncome * 0.20,
        shouldShow: shoppingAmount > totalIncome * 0.20,
        condition: shoppingAmount > totalIncome * 0.20 && totalIncome > 0
    });

    // Check Transport
    const transportAmount = categorySpending['transport'] || 0;
    console.log('🚗 TRANSPORT:', {
        amount: transportAmount,
        threshold: totalIncome * 0.15,
        needed: totalIncome * 0.15,
        shouldShow: transportAmount > totalIncome * 0.15,
        condition: transportAmount > totalIncome * 0.15 && totalIncome > 0
    });

    // Check Subscription
    const subscriptionAmount = categorySpending['subscription'] || 0;
    console.log('💳 SUBSCRIPTION:', {
        amount: subscriptionAmount,
        threshold: 500,
        needed: 500,
        shouldShow: subscriptionAmount > 500,
        condition: subscriptionAmount > 500
    });

    console.log('=== END DEBUG ===');
}

// 📭 SHOW EMPTY CHART
showEmptyChart(ctx, message) {
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }

    try {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [message],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#e0e0e0']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating empty chart:', error);
    }
}
   
    // 💬 SHOW NOTIFICATION
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            ${type === 'success' ? 'background: #4CAF50;' : ''}
            ${type === 'error' ? 'background: #F44336;' : ''}
            ${type === 'info' ? 'background: #2196F3;' : ''}
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // 🔄 RESET FORM
    resetForm(formId) {
        document.getElementById(formId).reset();
    }
}

// Initialize the application
const expenseTracker = new ExpenseTracker();
