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
                <p>Start saving money for your goals!</p>
            </div>
        `;
        return;
    }

    savingsList.innerHTML = savings.map(saving => `
        <div class="saving-item">
            <div class="saving-info">
                <div class="saving-goal">${saving.goal}</div>
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
        topGoalsList.innerHTML = '<div class="empty-state"><p>No savings goals yet</p></div>';
        return;
    }

    topGoalsList.innerHTML = topGoals.map(goal => `
        <div class="goal-item">
            <div class="goal-name">${goal.goal}</div>
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
    document.getElementById('savingGoal').value = saving.goal;
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
    const goal = document.getElementById('savingGoal').value.trim();
    const description = document.getElementById('savingDescription').value.trim();
    const date = document.getElementById('savingDate').value;

    if (!amount || !goal || !date) {
        showNotification('Please fill in all required fields', 'error');
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

// Filter savings
function filterSavings() {
    const searchTerm = document.getElementById('savingsSearch')?.value.toLowerCase() || '';
    
    const filteredSavings = savings.filter(saving => {
        return saving.goal.toLowerCase().includes(searchTerm) ||
               (saving.description && saving.description.toLowerCase().includes(searchTerm));
    });

    // Temporarily update savings array for display
    const originalSavings = [...savings];
    savings = filteredSavings;
    displaySavings();
    savings = originalSavings;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize savings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the savings view
    const savingsView = document.getElementById('savingsView');
    if (savingsView) {
        loadSavings();
        
        // Add event listeners
        const savingForm = document.getElementById('savingForm');
        if (savingForm) {
            savingForm.addEventListener('submit', handleSavingSubmit);
        }

        const savingsPeriod = document.getElementById('savingsPeriod');
        if (savingsPeriod) {
            savingsPeriod.addEventListener('change', updateSavingsStats);
        }

        const savingsSearch = document.getElementById('savingsSearch');
        if (savingsSearch) {
            savingsSearch.addEventListener('input', filterSavings);
        }
    }
});
