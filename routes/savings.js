const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Get database reference
const getDb = () => admin.database();

// Get all savings
router.get('/', async (req, res) => {
  try {
    const { userId, startDate, endDate, goal } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    const db = getDb();
    let savingsRef = db.ref(`savings/${userId}`);
    
    const snapshot = await savingsRef.once('value');
    let savings = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        savings.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      savings = savings.filter(saving => {
        const savingDate = new Date(saving.date);
        if (startDate && savingDate < new Date(startDate)) return false;
        if (endDate && savingDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Filter by goal if provided
    if (goal) {
      savings = savings.filter(saving => 
        saving.goal && saving.goal.toLowerCase().includes(goal.toLowerCase())
      );
    }

    // Sort by date (newest first)
    savings.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate total
    const totalSaved = savings.reduce((sum, saving) => sum + saving.amount, 0);

    res.json({
      success: true,
      data: savings,
      count: savings.length,
      totalSaved
    });
  } catch (error) {
    console.error('Error fetching savings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching savings',
      error: error.message
    });
  }
});

// Get single saving
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
    const savingRef = db.ref(`savings/${userId}/${id}`);
    const snapshot = await savingRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Saving not found'
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
    console.error('Error fetching saving:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saving',
      error: error.message
    });
  }
});

// Create new saving
router.post('/', async (req, res) => {
  try {
    const { userId, amount, goal, description, date } = req.body;

    // Validation - goal is now optional
    if (!userId || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, amount, date'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const saving = {
      amount: parseFloat(amount),
      goal: goal || 'General Savings',  // Default to 'General Savings' if not provided
      description: description || '',
      date,
      createdAt: new Date().toISOString()
    };

    const db = getDb();
    const savingsRef = db.ref(`savings/${userId}`);
    const newSavingRef = await savingsRef.push(saving);

    res.status(201).json({
      success: true,
      message: 'Saving added successfully',
      data: {
        id: newSavingRef.key,
        ...saving
      }
    });
  } catch (error) {
    console.error('Error creating saving:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating saving',
      error: error.message
    });
  }
});

// Update saving
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, amount, goal, description, date } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    const db = getDb();
    const savingRef = db.ref(`savings/${userId}/${id}`);
    const snapshot = await savingRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Saving not found'
      });
    }

    const updates = {};
    if (amount !== undefined) updates.amount = parseFloat(amount);
    if (goal !== undefined) updates.goal = goal || 'General Savings';
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = date;
    updates.updatedAt = new Date().toISOString();

    await savingRef.update(updates);

    const updatedSnapshot = await savingRef.once('value');

    res.json({
      success: true,
      message: 'Saving updated successfully',
      data: {
        id: updatedSnapshot.key,
        ...updatedSnapshot.val()
      }
    });
  } catch (error) {
    console.error('Error updating saving:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating saving',
      error: error.message
    });
  }
});

// Delete saving
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
    const savingRef = db.ref(`savings/${userId}/${id}`);
    const snapshot = await savingRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Saving not found'
      });
    }

    await savingRef.remove();

    res.json({
      success: true,
      message: 'Saving deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting saving:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting saving',
      error: error.message
    });
  }
});

// Get savings summary and statistics
router.get('/summary/stats', async (req, res) => {
  try {
    const { userId, period = 'month' } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const db = getDb();
    const savingsRef = db.ref(`savings/${userId}`);
    const snapshot = await savingsRef.once('value');

    let savings = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        savings.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Filter savings for the period
    const periodSavings = savings.filter(saving => 
      new Date(saving.date) >= startDate
    );

    // Calculate totals
    const totalSaved = savings.reduce((sum, s) => sum + s.amount, 0);
    const periodTotal = periodSavings.reduce((sum, s) => sum + s.amount, 0);

    // Group by goal and calculate top goals
    const goalTotals = {};
    savings.forEach(saving => {
      const goalName = saving.goal || 'General Savings';
      if (!goalTotals[goalName]) {
        goalTotals[goalName] = 0;
      }
      goalTotals[goalName] += saving.amount;
    });

    const topGoals = Object.entries(goalTotals)
      .map(([goal, amount]) => ({ goal, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalSaved,
        periodTotal,
        savingsCount: savings.length,
        periodCount: periodSavings.length,
        topGoals
      }
    });
  } catch (error) {
    console.error('Error fetching savings stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching savings statistics',
      error: error.message
    });
  }
});

module.exports = router;
