const express = require('express');
const router = express.Router();
const { db } = require('../server');

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const { userId, startDate, endDate, category } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    let expensesRef = db.ref(`expenses/${userId}`);
    
    const snapshot = await expensesRef.once('value');
    let expenses = [];
    
    snapshot.forEach((child) => {
      expenses.push({
        id: child.key,
        ...child.val()
      });
    });

    // Filter by date range if provided
    if (startDate && endDate) {
      expenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= new Date(startDate) && expDate <= new Date(endDate);
      });
    }

    // Filter by category if provided
    if (category) {
      expenses = expenses.filter(exp => exp.category === category);
    }

    // Sort by date (newest first)
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ 
      success: true, 
      data: expenses,
      count: expenses.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get single expense
router.get('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    const { id } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    const snapshot = await db.ref(`expenses/${userId}/${id}`).once('value');
    
    if (!snapshot.exists()) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
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
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Create new expense
router.post('/', async (req, res) => {
  try {
    const { userId, amount, category, description, date } = req.body;

    if (!userId || !amount || !category || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId, amount, category, and date are required' 
      });
    }

    const expense = {
      amount: parseFloat(amount),
      category,
      description: description || '',
      date,
      createdAt: new Date().toISOString()
    };

    const newExpenseRef = await db.ref(`expenses/${userId}`).push(expense);

    res.status(201).json({ 
      success: true, 
      message: 'Expense created successfully',
      data: {
        id: newExpenseRef.key,
        ...expense
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { userId, amount, category, description, date } = req.body;
    const { id } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    const expenseRef = db.ref(`expenses/${userId}/${id}`);
    const snapshot = await expenseRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    const updates = {};
    if (amount !== undefined) updates.amount = parseFloat(amount);
    if (category) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (date) updates.date = date;
    updates.updatedAt = new Date().toISOString();

    await expenseRef.update(updates);

    const updatedSnapshot = await expenseRef.once('value');

    res.json({ 
      success: true, 
      message: 'Expense updated successfully',
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

// Delete expense
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

    const expenseRef = db.ref(`expenses/${userId}/${id}`);
    const snapshot = await expenseRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    await expenseRef.remove();

    res.json({ 
      success: true, 
      message: 'Expense deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
