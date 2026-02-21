const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Get database reference
const getDb = () => admin.database();

// Helper function to get date range
function getDateRange(period) {
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

  return { startDate, endDate: now };
}

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
    
    const db = getDb();
    const expensesRef = db.ref(`expenses/${userId}`);
    const budgetsRef = db.ref(`budgets/${userId}`);

    const [expensesSnapshot, budgetsSnapshot] = await Promise.all([
      expensesRef.once('value'),
      budgetsRef.once('value')
    ]);

    let expenses = [];
    if (expensesSnapshot.exists()) {
      expensesSnapshot.forEach((childSnapshot) => {
        const expense = childSnapshot.val();
        const expenseDate = new Date(expense.date);
        if (expenseDate >= startDate && expenseDate <= endDate) {
          expenses.push({
            id: childSnapshot.key,
            ...expense
          });
        }
      });
    }

    // Calculate totals
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expenseCount = expenses.length;

    // Category breakdown
    const categoryTotals = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const categoryBreakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: ((amount / totalSpent) * 100).toFixed(1)
    })).sort((a, b) => b.amount - a.amount);

    // Budget status
    let budgetStatus = [];
    if (budgetsSnapshot.exists()) {
      budgetsSnapshot.forEach((childSnapshot) => {
        const budget = childSnapshot.val();
        if (budget.period === period) {
          const spent = categoryTotals[budget.category] || 0;
          const percentage = (spent / budget.amount) * 100;
          
          budgetStatus.push({
            category: budget.category,
            budget: budget.amount,
            spent,
            remaining: budget.amount - spent,
            percentage: percentage.toFixed(1),
            status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
          });
        }
      });
    }

    res.json({
      success: true,
      data: {
        period,
        totalSpent,
        expenseCount,
        categoryBreakdown,
        budgetStatus,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating summary',
      error: error.message
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
    
    const db = getDb();
    const expensesRef = db.ref(`expenses/${userId}`);
    const snapshot = await expensesRef.once('value');

    let expenses = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const expense = childSnapshot.val();
        const expenseDate = new Date(expense.date);
        if (expenseDate >= startDate && expenseDate <= endDate) {
          expenses.push(expense);
        }
      });
    }

    // Calculate category totals
    const categoryTotals = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    // Sort and limit
    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: topCategories
    });
  } catch (error) {
    console.error('Error fetching top categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top categories',
      error: error.message
    });
  }
});

// Get spending trends (daily breakdown)
router.get('/trends', async (req, res) => {
  try {
    const { userId, period = 'month' } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    const { startDate, endDate } = getDateRange(period);
    
    const db = getDb();
    const expensesRef = db.ref(`expenses/${userId}`);
    const snapshot = await expensesRef.once('value');

    let expenses = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const expense = childSnapshot.val();
        const expenseDate = new Date(expense.date);
        if (expenseDate >= startDate && expenseDate <= endDate) {
          expenses.push(expense);
        }
      });
    }

    // Group by date
    const dailyTotals = {};
    expenses.forEach(exp => {
      const date = exp.date.split('T')[0]; // Get YYYY-MM-DD
      dailyTotals[date] = (dailyTotals[date] || 0) + exp.amount;
    });

    // Convert to array and sort
    const trends = Object.entries(dailyTotals)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trends',
      error: error.message
    });
  }
});

// Get category comparison
router.get('/category-comparison', async (req, res) => {
  try {
    const { userId, category } = req.query;

    if (!userId || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId and category are required' 
      });
    }

    const db = getDb();
    const expensesRef = db.ref(`expenses/${userId}`);
    const snapshot = await expensesRef.once('value');

    let expenses = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const expense = childSnapshot.val();
        if (expense.category === category) {
          expenses.push({
            id: childSnapshot.key,
            ...expense
          });
        }
      });
    }

    // Calculate monthly totals
    const monthlyTotals = {};
    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + exp.amount;
    });

    const comparison = Object.entries(monthlyTotals)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      success: true,
      data: {
        category,
        comparison,
        totalExpenses: expenses.length,
        totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching category comparison:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category comparison',
      error: error.message
    });
  }
});

module.exports = router;
