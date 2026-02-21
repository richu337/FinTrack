// Configuration
const API_BASE = '/api';

// Get user ID from localStorage (set by auth.js)
function getUserId() {
    return localStorage.getItem('userId') || 'demo-user';
}

const USER_ID = getUserId();

// State
let currentView = 'overview';
let currentPeriod = 'month';
let expenses = [];
let budgets = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    if (!userId) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
        return;
    }

    // Display user email in header (update existing element)
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        updateUserDisplay(userEmail);
    }

    initializeEventListeners();
    loadData();
    setTodayDate();
});

// Update user display - FIX: Update existing element instead of creating duplicate
function updateUserDisplay(email) {
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement) {
        userEmailElement.textContent = email;
    }
}

// Event Listeners
function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.dataset.view;
            switchView(view);
        });
    });

    // Period selector
    document.getElementById('period-selector').addEventListener('change', (e) => {
        currentPeriod = e.target.value;
        loadData();
    });

    // Add expense button
    document.getElementById('add-expense-btn').addEventListener('click', () => {
        openModal('expense-modal');
    });

    // Add budget button
    document.getElementById('add-budget-btn')?.addEventListener('click', () => {
        openModal('budget-modal');
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Forms
    document.getElementById('expense-form').addEventListener('submit', handleExpenseSubmit);
    document.getElementById('budget-form').addEventListener('submit', handleBudgetSubmit);

    // Category filter
    document.getElementById('category-filter')?.addEventListener('change', (e) => {
        filterExpenses(e.target.value);
    });
}

// View Management
function switchView(view) {
    currentView = view;
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === view) {
            item.classList.add('active');
        }
    });

    // Update views
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });
    document.getElementById(`${view}-view`).classList.add('active');

    // Update title
    const titles = {
        overview: 'Overview',
        expenses: 'All Expenses',
        savings: 'Savings Tracker',
        budgets: 'Budget Management',
        reports: 'Reports & Analytics'
    };
    document.getElementById('view-title').textContent = titles[view];

    // Load view-specific data
    if (view === 'budgets') {
        renderBudgets();
    } else if (view === 'reports') {
        loadReports();
    } else if (view === 'savings') {
        // Savings data is loaded by savings.js
        if (typeof loadSavings === 'function') {
            loadSavings();
        }
    }
}

// Data Loading
async function loadData() {
    try {
        await Promise.all([
            loadExpenses(),
            loadBudgets(),
            loadSummary()
        ]);
        renderOverview();
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data', 'error');
    }
}

async function loadExpenses() {
    try {
        const response = await fetch(`${API_BASE}/expenses?userId=${USER_ID}`);
        const data = await response.json();
        if (data.success) {
            expenses = data.data;
            renderExpenses();
        }
    } catch (error) {
        console.error('Error loading expenses:', error);
    }
}

async function loadBudgets() {
    try {
        const response = await fetch(`${API_BASE}/budgets?userId=${USER_ID}`);
        const data = await response.json();
        if (data.success) {
            budgets = data.data;
        }
    } catch (error) {
        console.error('Error loading budgets:', error);
    }
}

async function loadSummary() {
    try {
        const response = await fetch(`${API_BASE}/reports/summary?userId=${USER_ID}&period=${currentPeriod}`);
        const data = await response.json();
        if (data.success) {
            updateStats(data.data);
        }
    } catch (error) {
        console.error('Error loading summary:', error);
    }
}

async function loadReports() {
    try {
        const response = await fetch(`${API_BASE}/reports/top-categories?userId=${USER_ID}&period=${currentPeriod}`);
        const data = await response.json();
        if (data.success) {
            renderTopCategories(data.data);
        }
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

// Rendering Functions
function updateStats(summary) {
    document.getElementById('total-spent').textContent = `₹${summary.totalSpent.toFixed(2)}`;
    document.getElementById('total-transactions').textContent = summary.expenseCount;
    
    // Calculate average daily
    const days = currentPeriod === 'week' ? 7 : currentPeriod === 'month' ? 30 : 365;
    const avgDaily = summary.totalSpent / days;
    document.getElementById('avg-daily').textContent = `₹${avgDaily.toFixed(2)}`;

    // Budget status
    const overBudget = summary.budgetStatus?.some(b => b.status === 'over');
    const warning = summary.budgetStatus?.some(b => b.status === 'warning');
    let status = 'Good';
    if (overBudget) status = 'Over Budget';
    else if (warning) status = 'Warning';
    document.getElementById('budget-status').textContent = status;

    // Render category breakdown
    if (summary.categoryBreakdown && summary.categoryBreakdown.length > 0) {
        renderCategoryChart(summary.categoryBreakdown);
    }
}

function renderOverview() {
    // Render recent expenses
    const recentExpenses = expenses.slice(0, 5);
    const recentContainer = document.getElementById('recent-expenses');
    
    if (recentExpenses.length === 0) {
        recentContainer.innerHTML = '<div class="empty-state">No recent expenses</div>';
        return;
    }

    recentContainer.innerHTML = recentExpenses.map(expense => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-category">${getCategoryIcon(expense.category)} ${expense.category}</div>
                <div class="expense-description">${expense.description || 'No description'}</div>
                <div class="expense-date">${formatDate(expense.date)}</div>
            </div>
            <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
        </div>
    `).join('');
}

function renderExpenses() {
    const container = document.getElementById('all-expenses');
    
    if (expenses.length === 0) {
        container.innerHTML = '<div class="empty-state">No expenses found</div>';
        return;
    }

    container.innerHTML = expenses.map(expense => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-category">${getCategoryIcon(expense.category)} ${expense.category}</div>
                <div class="expense-description">${expense.description || 'No description'}</div>
                <div class="expense-date">${formatDate(expense.date)}</div>
            </div>
            <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
            <div class="expense-actions">
                <button class="btn-edit" onclick="editExpense('${expense.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteExpense('${expense.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function renderBudgets() {
    const container = document.getElementById('budgets-list');
    
    if (budgets.length === 0) {
        container.innerHTML = '<div class="empty-state">No budgets set. Create your first budget!</div>';
        return;
    }

    container.innerHTML = budgets.map(budget => {
        const spent = expenses
            .filter(e => e.category === budget.category)
            .reduce((sum, e) => sum + e.amount, 0);
        
        const percentage = (spent / budget.amount) * 100;
        let statusClass = '';
        if (percentage >= 100) statusClass = 'danger';
        else if (percentage >= 80) statusClass = 'warning';

        return `
            <div class="budget-card">
                <div class="budget-header">
                    <div class="budget-category">${getCategoryIcon(budget.category)} ${budget.category}</div>
                    <div class="budget-amount">₹${spent.toFixed(2)} / ₹${budget.amount.toFixed(2)}</div>
                </div>
                <div class="budget-progress">
                    <div class="budget-progress-bar ${statusClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="budget-stats">
                    <span>${percentage.toFixed(1)}% used</span>
                    <span>₹${(budget.amount - spent).toFixed(2)} remaining</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderTopCategories(categories) {
    const container = document.getElementById('top-categories');
    
    if (categories.length === 0) {
        container.innerHTML = '<div class="empty-state">No data available</div>';
        return;
    }

    container.innerHTML = categories.map(cat => `
        <div class="category-item">
            <div class="category-name">${getCategoryIcon(cat.category)} ${cat.category}</div>
            <div class="category-amount">₹${cat.total.toFixed(2)}</div>
        </div>
    `).join('');
}

function renderCategoryChart(categories) {
    const container = document.getElementById('category-chart');
    
    if (categories.length === 0) {
        container.innerHTML = '<div class="empty-state">No expenses yet</div>';
        return;
    }

    // Simple bar chart representation
    const maxAmount = Math.max(...categories.map(c => c.total));
    
    container.innerHTML = categories.map(cat => {
        const percentage = (cat.total / maxAmount) * 100;
        return `
            <div class="category-item">
                <div class="category-name">${getCategoryIcon(cat.category)} ${cat.category}</div>
                <div class="budget-progress">
                    <div class="budget-progress-bar" style="width: ${percentage}%"></div>
                </div>
                <div class="category-amount">₹${cat.total.toFixed(2)}</div>
            </div>
        `;
    }).join('');
}

// Form Handlers
async function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const description = document.getElementById('expense-description').value;
    const date = document.getElementById('expense-date').value;

    try {
        const response = await fetch(`${API_BASE}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: USER_ID,
                amount,
                category,
                description,
                date
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Expense added successfully!', 'success');
            closeModal('expense-modal');
            document.getElementById('expense-form').reset();
            loadData();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error adding expense:', error);
        showNotification('Error adding expense', 'error');
    }
}

async function handleBudgetSubmit(e) {
    e.preventDefault();
    
    const category = document.getElementById('budget-category').value;
    const amount = parseFloat(document.getElementById('budget-amount').value);
    const period = document.getElementById('budget-period').value;

    try {
        const response = await fetch(`${API_BASE}/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: USER_ID,
                category,
                amount,
                period
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Budget set successfully!', 'success');
            closeModal('budget-modal');
            document.getElementById('budget-form').reset();
            loadBudgets();
            renderBudgets();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error setting budget:', error);
        showNotification('Error setting budget', 'error');
    }
}

// Delete Functions
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
        const response = await fetch(`${API_BASE}/expenses/${id}?userId=${USER_ID}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Expense deleted successfully!', 'success');
            loadData();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        showNotification('Error deleting expense', 'error');
    }
}

// Filter Functions
function filterExpenses(category) {
    const filtered = category ? expenses.filter(e => e.category === category) : expenses;
    const container = document.getElementById('all-expenses');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No expenses found</div>';
        return;
    }

    container.innerHTML = filtered.map(expense => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-category">${getCategoryIcon(expense.category)} ${expense.category}</div>
                <div class="expense-description">${expense.description || 'No description'}</div>
                <div class="expense-date">${formatDate(expense.date)}</div>
            </div>
            <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
            <div class="expense-actions">
                <button class="btn-edit" onclick="editExpense('${expense.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteExpense('${expense.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function closeExpenseModal() {
    closeModal('expense-modal');
}

function closeBudgetModal() {
    closeModal('budget-modal');
}

// Utility Functions
function getCategoryIcon(category) {
    const icons = {
        'Food': '🍔',
        'Travel': '🚗',
        'Shopping': '🛍',
        'Bills': '📄',
        'Entertainment': '🎬',
        'Education': '📚',
        'Other': '📦'
    };
    return icons[category] || '📦';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expense-date').value = today;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
