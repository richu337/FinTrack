# 💰 FinTrack - Smart Expense Tracker for Students

![FinTrack Banner](https://img.shields.io/badge/FinTrack-Expense%20Tracker-6366f1?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

FinTrack is a simple and powerful expense tracking app designed to help students manage their money with confidence. Small daily expenses can quietly drain your budget - FinTrack makes it easy to record spending, understand where your money goes, and build smarter financial habits through a clean and easy-to-use dashboard.

## 🚀 Key Features

- ⚡ **Quick Daily Expense Entry** - Add expenses in seconds with streamlined interface
- 🗂 **Smart Category Tracking** - Organize spending across Food, Travel, Shopping, Bills, Entertainment, Education & more
- 📊 **Interactive Dashboard** - Visual insights showing where your money goes
- 📅 **Weekly & Monthly Reports** - Comprehensive spending analysis at your fingertips
- 🎯 **Budget Tracking** - Set limits and monitor spending to avoid overspending
- 📈 **Spending Trends** - Track daily, weekly, and monthly spending patterns
- 🎨 **Minimal Design** - Distraction-free interface that just works
- 🔥 **Real-time Sync** - Firebase Realtime Database for instant updates

## 📸 Screenshots

### Landing Page
Beautiful landing page showcasing FinTrack's features with a modern gradient design.

### Dashboard
- **Overview**: Quick stats showing total spent, transaction count, budget status, and average daily spending
- **Category Breakdown**: Visual representation of spending across different categories
- **Recent Expenses**: Quick view of your latest transactions
- **Spending Trends**: Daily spending patterns over time

### Expense Management
- Add, edit, and delete expenses with ease
- Filter expenses by category
- View detailed expense history

### Budget Management
- Set budgets for different categories
- Visual progress bars showing budget utilization
- Color-coded warnings (green = good, yellow = warning, red = over budget)

## 🛠 Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: Firebase Realtime Database
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Template Engine**: EJS
- **Styling**: Custom CSS with modern design principles

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [Firebase](https://firebase.google.com/) account

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/richu337/FinTrack.git
cd FinTrack
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable **Realtime Database**:
   - Go to Build → Realtime Database
   - Click "Create Database"
   - Start in **test mode** (for development)
   - Note your database URL (e.g., `https://your-project-id.firebaseio.com`)

4. Generate Service Account Key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely

### 4. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Important**: 
- Replace all placeholder values with your actual Firebase credentials
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- The private key should include `\n` for line breaks

### 5. Firebase Database Rules (Optional - For Production)

For development, test mode is fine. For production, update your database rules:

```json
{
  "rules": {
    "expenses": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "budgets": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```

### 6. Run the Application

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

The application will be available at:
- **Landing Page**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard

## 📁 Project Structure

```
FinTrack/
├── public/                 # Static files
│   ├── css/
│   │   ├── style.css      # Landing page styles
│   │   └── dashboard.css  # Dashboard styles
│   └── js/
│       └── dashboard.js   # Dashboard functionality
├── routes/                # API routes
│   ├── expenses.js        # Expense CRUD operations
│   ├── budgets.js         # Budget management
│   └── reports.js         # Analytics & reports
├── views/                 # EJS templates
│   ├── index.ejs          # Landing page
│   └── dashboard.ejs      # Dashboard page
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies
├── server.js             # Main server file
└── README.md             # Documentation
```

## 🔌 API Endpoints

### Expenses

- `GET /api/expenses?userId={userId}` - Get all expenses
- `GET /api/expenses/:id?userId={userId}` - Get single expense
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id?userId={userId}` - Delete expense

### Budgets

- `GET /api/budgets?userId={userId}` - Get all budgets
- `GET /api/budgets/category/:category?userId={userId}` - Get budget by category
- `POST /api/budgets` - Create/update budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id?userId={userId}` - Delete budget

### Reports

- `GET /api/reports/summary?userId={userId}&period={period}` - Get spending summary
- `GET /api/reports/trend?userId={userId}&period={period}` - Get spending trend
- `GET /api/reports/top-categories?userId={userId}&period={period}` - Get top categories

**Period Options**: `week`, `month`, `year`

## 💡 Usage Guide

### Adding an Expense

1. Click the **"+ Add Expense"** button
2. Fill in:
   - Amount (₹)
   - Category (Food, Travel, Shopping, etc.)
   - Description (optional)
   - Date
3. Click **"Add Expense"**

### Setting a Budget

1. Navigate to **"Budgets"** section
2. Click **"+ Add Budget"**
3. Select category
4. Set budget amount
5. Choose period (Weekly/Monthly)
6. Click **"Set Budget"**

### Viewing Reports

1. Navigate to **"Reports"** section
2. Use the period selector to view:
   - This Week
   - This Month
   - This Year
3. View top spending categories and trends

## 🎨 Customization

### Categories

Edit categories in `public/js/dashboard.js`:

```javascript
const icons = {
    'Food': '🍔',
    'Travel': '🚗',
    'Shopping': '🛍',
    'Bills': '📄',
    'Entertainment': '🎬',
    'Education': '📚',
    'YourCategory': '🎯'
};
```

### Colors

Modify color scheme in `public/css/style.css`:

```css
:root {
    --primary: #6366f1;
    --secondary: #8b5cf6;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
}
```

## 🔒 Security Notes

- Never commit `.env` file or Firebase service account keys
- Use Firebase Authentication in production
- Implement proper user authentication
- Set up Firebase security rules
- Use HTTPS in production
- Validate all user inputs

## 🚀 Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create new app
heroku create your-fintrack-app

# Set environment variables
heroku config:set FIREBASE_PROJECT_ID=your-project-id
heroku config:set FIREBASE_CLIENT_EMAIL=your-email
heroku config:set FIREBASE_PRIVATE_KEY="your-private-key"
heroku config:set FIREBASE_DATABASE_URL=your-database-url

# Deploy
git push heroku main
```

### Deploy to Vercel/Netlify

1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Rayhan**
- GitHub: [@richu337](https://github.com/richu337)
- Email: rayhanjaleel904@gmail.com

## 🙏 Acknowledgments

- Firebase for the awesome real-time database
- Express.js for the robust backend framework
- All the students who inspired this project

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Email: rayhanjaleel904@gmail.com

---

**Built with ❤️ for students by students**

⭐ Star this repo if you find it helpful!
