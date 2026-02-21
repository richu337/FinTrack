const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Get database reference
const getDb = () => admin.database();

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

    const db = getDb();
    let expensesRef = db.ref(`expenses/${userId}`);
    
    const snapshot = await expensesRef.once('value');
    let expenses = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        expenses.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      expenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        if (startDate && expenseDate < new Date(startDate)) return false;
        if (endDate && expenseDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Filter by category if provided
    if (category) {
      expenses = expenses.filter(expense => expense.category === category);
    }

    // Sort by date (newest first)
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: expenses,
      count: expenses.length
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message
    });
  }
});

// Get single expense
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
    const expenseRef = db.ref(`expenses/${userId}/${id}`);
    const snapshot = await expenseRef.once('value');

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
    console.error('Error fetching expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense',
      error: error.message
    });
  }
});

// Create new expense
router.post('/', async (req, res) => {
  try {
    const { userId, amount, category, description, date } = req.body;

    // Validation
    if (!userId || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, amount, category, date'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const expense = {
      amount: parseFloat(amount),
      category,
      description: description || '',
      date,
      createdAt: new Date().toISOString()
    };

    const db = getDb();
    const expensesRef = db.ref(`expenses/${userId}`);
    const newExpenseRef = await expensesRef.push(expense);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: {
        id: newExpenseRef.key,
        ...expense
      }
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating expense',
      error: error.message
    });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, amount, category, description, date } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    const db = getDb();
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
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = date;
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
    console.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense',
      error: error.message
    });
  }
});

// Delete expense
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
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
      error: error.message
    });
  }
});

module.exports = router;
