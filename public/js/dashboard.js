// Configuration
const API_BASE = '/api';
const USER_ID = 'demo-user'; // In production, this would come from authentication

// State
let currentView = 'overview';
let currentPeriod = 'month';
let expenses = [];
let budgets = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadData();
    setTodayDate();
});

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
        budgets: 'Budget Management',
        reports: 'Reports & Analytics'
    };
    document.getElementById('view-title').textContent = titles[view];

    // Load view-specific data
    if (view === 'budgets') {
        renderBudgets();
    } else if (view === 'reports') {
        loadReports();
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
        const spent = calculateCategorySpent(budget.category);
        const percentage = (spent / budget.amount) * 100;
        const status = percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : 'success';

        return `
            <div class="budget-card">
                <div class="budget-header">
                    <div class="budget-category">${getCategoryIcon(budget.category)} ${budget.category}</div>
                    <div class="budget-amount">₹${budget.amount.toFixed(2)} / ${budget.period}</div>
                </div>
                <div class="budget-progress">
                    <div class="budget-progress-bar ${status}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="budget-stats">
                    <span>Spent: ₹${spent.toFixed(2)}</span>
                    <span>Remaining: ₹${Math.max(0, budget.amount - spent).toFixed(2)}</span>
                    <span>${percentage.toFixed(0)}%</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderCategoryChart(categories) {
    const container = document.getElementById('category-chart');
    
    if (categories.length === 0) {
        container.innerHTML = '<div class="empty-state">No expenses yet</div>';
        return;
    }

    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
    
    container.innerHTML = categories.map((cat, index) => `
        <div class="category-item">
            <div>
                <span class="category-name">${getCategoryIcon(cat.category)} ${cat.category}</span>
                <span style="color: var(--gray); font-size: 12px; margin-left: 8px;">${cat.percentage}%</span>
            </div>
            <div class="category-amount">₹${cat.amount.toFixed(2)}</div>
        </div>
    `).join('');
}

function renderTopCategories(categories) {
    const container = document.getElementById('top-categories');
    
    if (categories.length === 0) {
        container.innerHTML = '<div class="empty-state">No data available</div>';
        return;
    }

    container.innerHTML = categories.map((cat, index) => `
        <div class="category-item">
            <div class="category-name">
                <span style="font-size: 24px; margin-right: 8px;">${index + 1}</span>
                ${getCategoryIcon(cat.category)} ${cat.category}
            </div>
            <div class="category-amount">₹${cat.amount.toFixed(2)}</div>
        </div>
    `).join('');
}

// Form Handlers
async function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const expense = {
        userId: USER_ID,
        amount: parseFloat(document.getElementById('expense-amount').value),
        category: document.getElementById('expense-category').value,
        description: document.getElementById('expense-description').value,
        date: document.getElementById('expense-date').value
    };

    try {
        const response = await fetch(`${API_BASE}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Expense added successfully!', 'success');
            closeModal('expense-modal');
            e.target.reset();
            setTodayDate();
            loadData();
        } else {
            showNotification(data.message || 'Error adding expense', 'error');
        }
    } catch (error) {
        console.error('Error adding expense:', error);
        showNotification('Error adding expense', 'error');
    }
}

async function handleBudgetSubmit(e) {
    e.preventDefault();
    
    const budget = {
        userId: USER_ID,
        category: document.getElementById('budget-category').value,
        amount: parseFloat(document.getElementById('budget-amount').value),
        period: document.getElementById('budget-period').value
    };

    try {
        const response = await fetch(`${API_BASE}/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(budget)
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Budget set successfully!', 'success');
            closeModal('budget-modal');
            e.target.reset();
            loadData();
        } else {
            showNotification(data.message || 'Error setting budget', 'error');
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
            showNotification(data.message || 'Error deleting expense', 'error');
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        showNotification('Error deleting expense', 'error');
    }
}

// Helper Functions
function filterExpenses(category) {
    if (!category) {
        renderExpenses();
        return;
    }

    const filtered = expenses.filter(e => e.category === category);
    const container = document.getElementById('all-expenses');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No expenses found in this category</div>';
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

function calculateCategorySpent(category) {
    return expenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0);
}

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

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showNotification(message, type = 'info') {
    // Simple alert for now - can be enhanced with a toast notification system
    alert(message);
}

// Edit function placeholder
function editExpense(id) {
    alert('Edit functionality coming soon!');
}
