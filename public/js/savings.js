// Savings Management
let savings = [];
let editingSavingId = null;

// Load savings on page load
async function loadSavings() {
    try {
        const userId = getCurrentUserId();
        const response = await fetch(`/api/savings?userId=${userId}`);
        const data = await response.json();

        if (data.success) {
            savings = data.data;
            displaySavings();
            updateSavingsStats();
        }
    } catch (error) {
        console.error('Error loading savings:', error);
        showNotification('Error loading savings', 'error');
    }
}

// Display savings list
function displaySavings() {
    const savingsList = document.getElementById('savingsList');
    
    if (!savingsList) return;

    if (savings.length === 0) {
        savingsList.innerHTML = `
            <div class="empty-state">
                <p>💰 No savings yet</p>
                <p>Start saving money today!</p>
            </div>
        `;
        return;
    }

    savingsList.innerHTML = savings.map(saving => `
        <div class="saving-item">
            <div class="saving-info">
                <div class="saving-goal">${saving.goal || 'General Savings'}</div>
                <div class="saving-description">${saving.description || 'No description'}</div>
                <div class="saving-date">${formatDate(saving.date)}</div>
            </div>
            <div class="saving-amount">₹${saving.amount.toFixed(2)}</div>
            <div class="saving-actions">
                <button class="btn-edit" onclick="editSaving('${saving.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteSaving('${saving.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Update savings statistics
async function updateSavingsStats() {
    try {
        const userId = getCurrentUserId();
        const period = document.getElementById('savingsPeriod')?.value || 'month';
        
        const response = await fetch(`/api/savings/summary/stats?userId=${userId}&period=${period}`);
        const data = await response.json();

        if (data.success) {
            const stats = data.data;
            
            // Update stat cards
            document.getElementById('totalSaved').textContent = `₹${stats.totalSaved.toFixed(2)}`;
            document.getElementById('periodSaved').textContent = `₹${stats.periodTotal.toFixed(2)}`;
            document.getElementById('savingsCount').textContent = stats.savingsCount;
            document.getElementById('topGoal').textContent = stats.topGoals[0]?.goal || 'None';

            // Display top goals
            displayTopGoals(stats.topGoals);
        }
    } catch (error) {
        console.error('Error updating savings stats:', error);
    }
}

// Display top savings goals
function displayTopGoals(topGoals) {
    const topGoalsList = document.getElementById('topGoalsList');
    
    if (!topGoalsList) return;

    if (topGoals.length === 0) {
        topGoalsList.innerHTML = '<div class="empty-state"><p>No savings categories yet</p></div>';
        return;
    }

    topGoalsList.innerHTML = topGoals.map(goal => `
        <div class="goal-item">
            <div class="goal-name">${goal.goal || 'General Savings'}</div>
            <div class="goal-amount">₹${goal.amount.toFixed(2)}</div>
        </div>
    `).join('');
}

// Show add saving modal
function showAddSavingModal() {
    editingSavingId = null;
    document.getElementById('savingModalTitle').textContent = 'Add Saving';
    document.getElementById('savingForm').reset();
    document.getElementById('savingDate').valueAsDate = new Date();
    document.getElementById('savingModal').classList.add('active');
}

// Show edit saving modal
function editSaving(id) {
    const saving = savings.find(s => s.id === id);
    if (!saving) return;

    editingSavingId = id;
    document.getElementById('savingModalTitle').textContent = 'Edit Saving';
    document.getElementById('savingAmount').value = saving.amount;
    document.getElementById('savingGoal').value = saving.goal || '';
    document.getElementById('savingDescription').value = saving.description || '';
    document.getElementById('savingDate').value = saving.date;
    document.getElementById('savingModal').classList.add('active');
}

// Close saving modal
function closeSavingModal() {
    document.getElementById('savingModal').classList.remove('active');
    editingSavingId = null;
}

// Handle saving form submission
async function handleSavingSubmit(event) {
    event.preventDefault();

    const userId = getCurrentUserId();
    const amount = parseFloat(document.getElementById('savingAmount').value);
    const goal = document.getElementById('savingGoal').value.trim() || 'General Savings';
    const description = document.getElementById('savingDescription').value.trim();
    const date = document.getElementById('savingDate').value;

    if (!amount || !date) {
        showNotification('Please fill in amount and date', 'error');
        return;
    }

    if (amount <= 0) {
        showNotification('Amount must be greater than 0', 'error');
        return;
    }

    const savingData = {
        userId,
        amount,
        goal,
        description,
        date
    };

    try {
        let response;
        if (editingSavingId) {
            // Update existing saving
            response = await fetch(`/api/savings/${editingSavingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(savingData)
            });
        } else {
            // Create new saving
            response = await fetch('/api/savings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(savingData)
            });
        }

        const data = await response.json();

        if (data.success) {
            showNotification(data.message, 'success');
            closeSavingModal();
            loadSavings();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error saving:', error);
        showNotification('Error saving data', 'error');
    }
}

// Delete saving
async function deleteSaving(id) {
    if (!confirm('Are you sure you want to delete this saving?')) {
        return;
    }

    try {
        const userId = getCurrentUserId();
        const response = await fetch(`/api/savings/${id}?userId=${userId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showNotification(data.message, 'success');
            loadSavings();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting saving:', error);
        showNotification('Error deleting saving', 'error');
    }
}

// Search savings
function searchSavings() {
    const searchTerm = document.getElementById('savingsSearch')?.value.toLowerCase() || '';
    
    if (!searchTerm) {
        displaySavings();
        return;
    }

    const filtered = savings.filter(saving => 
        (saving.goal && saving.goal.toLowerCase().includes(searchTerm)) ||
        (saving.description && saving.description.toLowerCase().includes(searchTerm))
    );

    const savingsList = document.getElementById('savingsList');
    
    if (filtered.length === 0) {
        savingsList.innerHTML = '<div class="empty-state"><p>No savings found</p></div>';
        return;
    }

    savingsList.innerHTML = filtered.map(saving => `
        <div class="saving-item">
            <div class="saving-info">
                <div class="saving-goal">${saving.goal || 'General Savings'}</div>
                <div class="saving-description">${saving.description || 'No description'}</div>
                <div class="saving-date">${formatDate(saving.date)}</div>
            </div>
            <div class="saving-amount">₹${saving.amount.toFixed(2)}</div>
            <div class="saving-actions">
                <button class="btn-edit" onclick="editSaving('${saving.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteSaving('${saving.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Utility functions
function getCurrentUserId() {
    return localStorage.getItem('userId') || 'demo-user';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Saving form submission
    const savingForm = document.getElementById('savingForm');
    if (savingForm) {
        savingForm.addEventListener('submit', handleSavingSubmit);
    }

    // Search input
    const savingsSearch = document.getElementById('savingsSearch');
    if (savingsSearch) {
        savingsSearch.addEventListener('input', searchSavings);
    }

    // Period selector
    const savingsPeriod = document.getElementById('savingsPeriod');
    if (savingsPeriod) {
        savingsPeriod.addEventListener('change', updateSavingsStats);
    }
});
