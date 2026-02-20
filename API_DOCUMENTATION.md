# 📚 FinTrack API Documentation

Complete API reference for FinTrack expense tracking application.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently using `userId` parameter for user identification. In production, implement proper JWT authentication.

---

## Expenses API

### Get All Expenses

Retrieve all expenses for a user with optional filtering.

**Endpoint:** `GET /api/expenses`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User identifier |
| startDate | string | No | Filter start date (ISO 8601) |
| endDate | string | No | Filter end date (ISO 8601) |
| category | string | No | Filter by category |

**Example Request:**
```bash
GET /api/expenses?userId=demo-user&category=Food
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "-NxxxExpenseId",
      "amount": 500,
      "category": "Food",
      "description": "Lunch at cafe",
      "date": "2024-02-20",
      "createdAt": "2024-02-20T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "userId is required"
}
```

---

### Get Single Expense

Retrieve a specific expense by ID.

**Endpoint:** `GET /api/expenses/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Expense ID |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User identifier |

**Example Request:**
```bash
GET /api/expenses/-NxxxExpenseId?userId=demo-user
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "-NxxxExpenseId",
    "amount": 500,
    "category": "Food",
    "description": "Lunch at cafe",
    "date": "2024-02-20",
    "createdAt": "2024-02-20T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Expense not found"
}
```

---

### Create Expense

Add a new expense.

**Endpoint:** `POST /api/expenses`

**Request Body:**
```json
{
  "userId": "demo-user",
  "amount": 500,
  "category": "Food",
  "description": "Lunch at cafe",
  "date": "2024-02-20"
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User identifier |
| amount | number | Yes | Expense amount |
| category | string | Yes | Expense category |
| description | string | No | Expense description |
| date | string | Yes | Expense date (YYYY-MM-DD) |

**Categories:**
- Food
- Travel
- Shopping
- Bills
- Entertainment
- Education
- Other

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user",
    "amount": 500,
    "category": "Food",
    "description": "Lunch",
    "date": "2024-02-20"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "id": "-NxxxExpenseId",
    "amount": 500,
    "category": "Food",
    "description": "Lunch",
    "date": "2024-02-20",
    "createdAt": "2024-02-20T10:30:00.000Z"
  }
}
```

---

### Update Expense

Update an existing expense.

**Endpoint:** `PUT /api/expenses/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Expense ID |

**Request Body:**
```json
{
  "userId": "demo-user",
  "amount": 600,
  "category": "Food",
  "description": "Updated lunch",
  "date": "2024-02-20"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Expense updated successfully",
  "data": {
    "id": "-NxxxExpenseId",
    "amount": 600,
    "category": "Food",
    "description": "Updated lunch",
    "date": "2024-02-20",
    "createdAt": "2024-02-20T10:30:00.000Z",
    "updatedAt": "2024-02-20T11:00:00.000Z"
  }
}
```

---

### Delete Expense

Delete an expense.

**Endpoint:** `DELETE /api/expenses/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Expense ID |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User identifier |

**Example Request:**
```bash
DELETE /api/expenses/-NxxxExpenseId?userId=demo-user
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

---

## Budgets API

### Get All Budgets

Retrieve all budgets for a user.

**Endpoint:** `GET /api/budgets`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User identifier |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "-NxxxBudgetId",
      "category": "Food",
      "amount": 5000,
      "period": "monthly",
      "createdAt": "2024-02-20T10:30:00.000Z",
      "updatedAt": "2024-02-20T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

### Get Budget by Category

Retrieve budget for a specific category.

**Endpoint:** `GET /api/budgets/category/:category`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | Yes | Budget category |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User identifier |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "-NxxxBudgetId",
    "category": "Food",
    "amount": 5000,
    "period": "monthly",
    "createdAt": "2024-02-20T10:30:00.000Z"
  }
}
```

---

### Create Budget

Create a new budget.

**Endpoint:** `POST /api/budgets`

**Request Body:**
```json
{
  "userId": "demo-user",
  "category": "Food",
  "amount": 5000,
  "period": "monthly"
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User identifier |
| category | string | Yes | Budget category |
| amount | number | Yes | Budget amount |
| period | string | Yes | Budget period (weekly/monthly) |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Budget created successfully",
  "data": {
    "id": "-NxxxBudgetId",
    "category": "Food",
    "amount": 5000,
    "period": "monthly",
    "createdAt": "2024-02-20T10:30:00.000Z",
    "updatedAt": "2024-02-20T10:30:00.000Z"
  }
}
```

---

### Update Budget

Update an existing budget.

**Endpoint:** `PUT /api/budgets/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Budget ID |

**Request Body:**
```json
{
  "userId": "demo-user",
  "amount": 6000,
  "period": "monthly"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Budget updated successfully",
  "data": {
    "id": "-NxxxBudgetId",
    "category": "Food",
    "amount": 6000,
    "period": "monthly",
    "createdAt": "2024-02-20T10:30:00.000Z",
    "updatedAt": "2024-02-20T11:00:00.000Z"
  }
}
```

---

### Delete Budget

Delete a budget.

**Endpoint:** `DELETE /api/budgets/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Budget ID |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User identifier |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Budget deleted successfully"
}
```

---

## Reports API

### Get Spending Summary

Get comprehensive spending summary with category breakdown and budget status.

**Endpoint:** `GET /api/reports/summary`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User identifier |
| period | string | No | Time period (week/month/year) |

**Example Request:**
```bash
GET /api/reports/summary?userId=demo-user&period=month
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "dateRange": {
      "start": "2024-02-01",
      "end": "2024-02-29"
    },
    "totalSpent": 15000,
    "expenseCount": 25,
    "categoryBreakdown": [
      {
        "category": "Food",
        "amount": 6000,
        "percentage": 40
      },
      {
        "category": "Travel",
        "amount": 4500,
        "percentage": 30
      }
    ],
    "budgetStatus": [
      {
        "category": "Food",
        "budget": 5000,
        "spent": 6000,
        "remaining": -1000,
        "percentage": 120,
        "status": "over"
      }
    ]
  }
}
```

**Budget Status Values:**
- `good`: < 80% of budget used
- `warning`: 80-100% of budget used
- `over`: > 100% of budget used

---

### Get Spending Trend

Get daily spending trend over a period.

**Endpoint:** `GET /api/reports/trend`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User identifier |
| period | string | No | Time period (week/month/year) |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "trend": [
      {
        "date": "2024-02-01",
        "amount": 500
      },
      {
        "date": "2024-02-02",
        "amount": 750
      }
    ]
  }
}
```

---

### Get Top Spending Categories

Get top spending categories for a period.

**Endpoint:** `GET /api/reports/top-categories`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User identifier |
| period | string | No | Time period (week/month/year) |
| limit | number | No | Number of categories (default: 5) |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "category": "Food",
      "amount": 6000
    },
    {
      "category": "Travel",
      "amount": 4500
    },
    {
      "category": "Shopping",
      "amount": 3000
    }
  ]
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "userId is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Something went wrong!",
  "error": "Detailed error message (development only)"
}
```

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production:
- 100 requests per minute per user
- 1000 requests per hour per user

---

## Testing with cURL

### Add Expense
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user",
    "amount": 500,
    "category": "Food",
    "description": "Lunch",
    "date": "2024-02-20"
  }'
```

### Get Expenses
```bash
curl http://localhost:3000/api/expenses?userId=demo-user
```

### Set Budget
```bash
curl -X POST http://localhost:3000/api/budgets \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user",
    "category": "Food",
    "amount": 5000,
    "period": "monthly"
  }'
```

### Get Summary
```bash
curl http://localhost:3000/api/reports/summary?userId=demo-user&period=month
```

---

## Testing with Postman

1. Import this collection: [Download Postman Collection](#)
2. Set environment variable: `baseUrl = http://localhost:3000`
3. Set environment variable: `userId = demo-user`
4. Run requests

---

## Future Enhancements

- [ ] JWT Authentication
- [ ] Pagination for large datasets
- [ ] Advanced filtering options
- [ ] Bulk operations
- [ ] Export to CSV/PDF
- [ ] Webhooks for budget alerts
- [ ] GraphQL API
- [ ] API versioning

---

**Need Help?**
- GitHub: [Create an issue](https://github.com/richu337/FinTrack/issues)
- Email: rayhanjaleel904@gmail.com
