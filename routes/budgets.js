const express = require('express');
const router = express.Router();
const { db } = require('../server');

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

    const snapshot = await db.ref(`budgets/${userId}`).once('value');
    let budgets = [];
    
    snapshot.forEach((child) => {
      budgets.push({
        id: child.key,
        ...child.val()
      });
    });

    res.json({ 
      success: true, 
      data: budgets,
      count: budgets.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get budget by category
router.get('/category/:category', async (req, res) => {
  try {
    const { userId } = req.query;
    const { category } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    const snapshot = await db.ref(`budgets/${userId}`).once('value');
    let budget = null;
    
    snapshot.forEach((child) => {
      if (child.val().category === category) {
        budget = {
          id: child.key,
          ...child.val()
        };
      }
    });

    if (!budget) {
      return res.status(404).json({ 
        success: false, 
        message: 'Budget not found for this category' 
      });
    }

    res.json({ 
      success: true, 
      data: budget
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Create or update budget
router.post('/', async (req, res) => {
  try {
    const { userId, category, amount, period } = req.body;

    if (!userId || !category || !amount || !period) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId, category, amount, and period are required' 
      });
    }

    const budget = {
      category,
      amount: parseFloat(amount),
      period, // 'weekly' or 'monthly'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newBudgetRef = await db.ref(`budgets/${userId}`).push(budget);

    res.status(201).json({ 
      success: true, 
      message: 'Budget created successfully',
      data: {
        id: newBudgetRef.key,
        ...budget
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Update budget
router.put('/:id', async (req, res) => {
  try {
    const { userId, amount, period } = req.body;
    const { id } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    const budgetRef = db.ref(`budgets/${userId}/${id}`);
    const snapshot = await budgetRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ 
        success: false, 
        message: 'Budget not found' 
      });
    }

    const updates = {};
    if (amount !== undefined) updates.amount = parseFloat(amount);
    if (period) updates.period = period;
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
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Delete budget
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    const { id } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

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
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
