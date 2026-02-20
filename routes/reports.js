const express = require('express');
const router = express.Router();
const { db } = require('../server');

// Helper function to get date range
const getDateRange = (period) => {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      endDate = new Date();
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 30));
      endDate = new Date();
  }

  return { startDate, endDate };
};

// Get spending summary
router.get('/summary', async (req, res) => {
  try {
    const { userId, period = 'month' } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    const { startDate, endDate } = getDateRange(period);
    const snapshot = await db.ref(`expenses/${userId}`).once('value');
    
    let expenses = [];
    snapshot.forEach((child) => {
      expenses.push(child.val());
    });

    // Filter by date range
    expenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startDate && expDate <= endDate;
    });

    // Calculate totals
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Group by category
    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    // Get budgets
    const budgetSnapshot = await db.ref(`budgets/${userId}`).once('value');
    let budgets = [];
    budgetSnapshot.forEach((child) => {
      budgets.push(child.val());
    });

    // Calculate budget status
    const budgetStatus = budgets.map(budget => {
      const spent = categoryTotals[budget.category] || 0;
      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;

      return {
        category: budget.category,
        budget: budget.amount,
        spent,
        remaining,
        percentage: Math.round(percentage),
        status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
      };
    });

    res.json({
      success: true,
      data: {
        period,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        totalSpent: Math.round(totalSpent * 100) / 100,
        expenseCount: expenses.length,
        categoryBreakdown: Object.entries(categoryTotals).map(([category, amount]) => ({
          category,
          amount: Math.round(amount * 100) / 100,
          percentage: Math.round((amount / totalSpent) * 100)
        })),
        budgetStatus
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get daily spending trend
router.get('/trend', async (req, res) => {
  try {
    const { userId, period = 'month' } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    const { startDate, endDate } = getDateRange(period);
    const snapshot = await db.ref(`expenses/${userId}`).once('value');
    
    let expenses = [];
    snapshot.forEach((child) => {
      expenses.push(child.val());
    });

    // Filter by date range
    expenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startDate && expDate <= endDate;
    });

    // Group by date
    const dailyTotals = expenses.reduce((acc, exp) => {
      const date = exp.date.split('T')[0];
      acc[date] = (acc[date] || 0) + exp.amount;
      return acc;
    }, {});

    const trend = Object.entries(dailyTotals)
      .map(([date, amount]) => ({
        date,
        amount: Math.round(amount * 100) / 100
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: {
        period,
        trend
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get top spending categories
router.get('/top-categories', async (req, res) => {
  try {
    const { userId, period = 'month', limit = 5 } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    const { startDate, endDate } = getDateRange(period);
    const snapshot = await db.ref(`expenses/${userId}`).once('value');
    
    let expenses = [];
    snapshot.forEach((child) => {
      expenses.push(child.val());
    });

    // Filter by date range
    expenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startDate && expDate <= endDate;
    });

    // Group by category
    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: topCategories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
