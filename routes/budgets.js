const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Get database reference
const getDb = () => admin.database();

// Get all budgets
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    const db = getDb();
    const budgetsRef = db.ref(`budgets/${userId}`);
    const snapshot = await budgetsRef.once('value');
    
    let budgets = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        budgets.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }

    res.json({
      success: true,
      data: budgets,
      count: budgets.length
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budgets',
      error: error.message
    });
  }
});

// Get single budget
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    const db = getDb();
    const budgetRef = db.ref(`budgets/${userId}/${id}`);
    const snapshot = await budgetRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: snapshot.key,
        ...snapshot.val()
      }
    });
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budget',
      error: error.message
    });
  }
});

// Create new budget
router.post('/', async (req, res) => {
  try {
    const { userId, category, amount, period } = req.body;

    // Validation
    if (!userId || !category || !amount || !period) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, category, amount, period'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const validPeriods = ['week', 'month', 'year'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'Period must be one of: week, month, year'
      });
    }

    const budget = {
      category,
      amount: parseFloat(amount),
      period,
      createdAt: new Date().toISOString()
    };

    const db = getDb();
    const budgetsRef = db.ref(`budgets/${userId}`);
    const newBudgetRef = await budgetsRef.push(budget);

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: {
        id: newBudgetRef.key,
        ...budget
      }
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating budget',
      error: error.message
    });
  }
});

// Update budget
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, category, amount, period } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    const db = getDb();
    const budgetRef = db.ref(`budgets/${userId}/${id}`);
    const snapshot = await budgetRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    const updates = {};
    if (category !== undefined) updates.category = category;
    if (amount !== undefined) updates.amount = parseFloat(amount);
    if (period !== undefined) {
      const validPeriods = ['week', 'month', 'year'];
      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          message: 'Period must be one of: week, month, year'
        });
      }
      updates.period = period;
    }
    updates.updatedAt = new Date().toISOString();

    await budgetRef.update(updates);

    const updatedSnapshot = await budgetRef.once('value');

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: {
        id: updatedSnapshot.key,
        ...updatedSnapshot.val()
      }
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating budget',
      error: error.message
    });
  }
});

// Delete budget
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    const db = getDb();
    const budgetRef = db.ref(`budgets/${userId}/${id}`);
    const snapshot = await budgetRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    await budgetRef.remove();

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting budget',
      error: error.message
    });
  }
});

module.exports = router;
