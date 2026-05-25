# CashFlowIQ - AI Payment Analytics Dashboard

A comprehensive AI-powered system for analyzing financial data, detecting late payments, tracking trends, and providing actionable business insights.

## Features

###  Dashboard Analytics
- **Summary Statistics**: Total invoices, paid amounts, overdue amounts, collection rates
- **Payment Trends**: Monthly revenue tracking and collection rate analysis
- **Real-time Charts**: Line and bar charts for visual insights
- **Risk Scoring**: AI-powered customer risk assessment based on payment behavior

###  Late Payment Detection
- Automatic identification of overdue payments
- Days late calculation
- Customer payment history tracking
- Risk score per customer

###  Trend Analysis
- Monthly payment flow tracking
- Collection rate trends
- Late payment frequency analysis
- Revenue patterns

###  Customer Behavior
- Late payer identification
- High-value customer tracking
- Payment consistency analysis
- Frequency of delayed payments

###  Smart Notifications
- Local alerts for high-value overdue invoices
- Frequent late payer warnings
- Revenue drop notifications
- Collection rate alerts

###  File Management
- Excel file upload (.xlsx, .xls)
- Auto column detection
- Manual column mapping
- Multiple file uploads over time
- File history tracking

## Project Structure

```
finance-insights/
├── backend/                    # Python Flask API
│   ├── app/
│   │   ├── models/            # Database models
│   │   │   ├── payment.py
│   │   │   ├── customer.py
│   │   │   └── file_upload.py
│   │   ├── routes/            # API endpoints
│   │   │   ├── file_routes.py
│   │   │   ├── analysis_routes.py
│   │   │   └── dashboard_routes.py
│   │   ├── services/          # Business logic
│   │   │   ├── excel_processor.py
│   │   │   ├── analysis_service.py
│   │   │   ├── notification_service.py
│   │   │   └── file_service.py
│   │   └── __init__.py
│   ├── uploads/               # Uploaded Excel files
│   ├── requirements.txt
│   ├── run.py
│   └── finance_insights.db    # SQLite database
│
└── frontend/                  # React Dashboard
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/        # React components
    │   │   ├── FileUpload.js
    │   │   ├── Dashboard.js
    │   │   ├── LatePayments.js
    │   │   └── *.css
    │   ├── api.js            # API client
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── package.json
    └── .gitignore
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+ and npm
- Windows/Mac/Linux

### Backend Setup

1. Navigate to the backend directory:
```bash
cd finance-insights/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python run.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd finance-insights/frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will open on `http://localhost:3000`

## API Endpoints

### File Management
- `POST /api/files/upload` - Upload and process Excel file
- `GET /api/files/list` - Get list of uploaded files
- `DELETE /api/files/<id>` - Delete uploaded file
- `POST /api/files/preview` - Preview file before uploading

### Analysis
- `GET /api/analysis/late-payments` - Get late payment list
- `GET /api/analysis/trends` - Get payment trends (default 12 months)
- `GET /api/analysis/customer-behavior` - Get customer behavior analysis
- `GET /api/analysis/summary` - Get dashboard summary
- `GET /api/analysis/notifications` - Get notifications and insights

### Dashboard
- `GET /api/dashboard/stats` - Get all dashboard statistics
- `GET /api/dashboard/export` - Export report as JSON

## Excel File Format

Your Excel file should have the following columns (auto-detected):

| Customer | Amount | Due Date | Payment Date |
|----------|--------|----------|--------------|
| Company A | 5000 | 2024-01-15 | 2024-01-20 |
| Company B | 3000 | 2024-01-20 | (empty) |

**Supported Column Names (auto-detected):**
- Customer: `customer`, `customer_name`, `name`, `company`, `client`
- Amount: `amount`, `invoice_amount`, `total`, `value`, `payment_amount`
- Due Date: `due_date`, `due`, `payment_due`, `deadline`
- Payment Date: `payment_date`, `paid_date`, `paid_on`
- Email: `email`, `email_address`, `contact_email`
- Phone: `phone`, `phone_number`, `contact`

## Database Models

### Payment
- ID, Customer ID, Amount, Due Date, Payment Date
- Status (pending/paid/overdue), Days Late
- File Upload ID, Created/Updated timestamps

### Customer
- ID, Name, Email, Phone
- Total Transactions, Late Payment Count
- Total Amount, Risk Score

### FileUpload
- ID, Filename, File Path
- Upload Date, Record Count
- Status, Error Message

## Key Features Explained

### Risk Scoring Algorithm
```
Risk Score = (Late Payment Count / Total Transactions) * 100
Range: 0-100
```

### Late Payment Detection
- Compares payment date with due date
- Calculates days late automatically
- Updates status: pending → overdue → paid

### Trend Analysis
- Groups payments by month
- Calculates collection rate monthly
- Tracks revenue patterns

## Usage Workflow

1. **Upload Excel File**
   - Click "Upload" tab
   - Select your Excel file
   - Review/adjust column mapping
   - Click "Upload & Process"

2. **View Dashboard**
   - Summary stats update automatically
   - Charts show payment trends
   - Customer risk table displays risk scores

3. **Review Late Payments**
   - Click "Late Payments" tab
   - See detailed late payment list
   - Filter by customer or date

4. **Export Report**
   - Dashboard has export functionality
   - Export as JSON for further analysis

## Features Implemented

 Excel file upload and processing  
 Auto column detection  
 Manual column mapping  
 Late payment detection  
 Payment trend analysis  
 Customer behavior analysis  
 Risk scoring system  
 Dashboard with charts  
 Notifications & insights  
 SQLite database  
 Offline functionality  
 Responsive design  

## Configuration

### Backend Config (app/__init__.py)
- Database: SQLite (finance_insights.db)
- Max file size: 16MB
- CORS enabled for frontend

### Frontend Config (src/api.js)
- API Base URL: `http://localhost:5000/api`
- Timeout: Default axios timeout

## Troubleshooting

### Database Issues
```bash
# Reset database
rm finance_insights.db
python run.py
```

### Port Already in Use
```bash
# Change port in backend/run.py
app.run(debug=True, host='localhost', port=5001)
```

### Excel Processing Errors
- Ensure required columns (customer, amount, due_date) exist
- Check date format consistency
- Verify amounts are numeric values

## Technology Stack

**Backend**
- Flask 2.3.0
- SQLAlchemy 3.0.3
- Pandas 2.0.0
- OpenPyXL 3.10.5

**Frontend**
- React 18.2.0
- Recharts 2.10.3
- Axios 1.3.0
- CSS Grid & Flexbox

**Database**
- SQLite 3

## Future Enhancements

- [ ] Automated email notifications for late payments
- [ ] Integration with accounting software (QuickBooks, Xero)
- [ ] Machine learning-based payment prediction
- [ ] Multi-currency support
- [ ] Advanced filtering and custom reports
- [ ] Payment scheduling and reminders
- [ ] Bulk payment processing
- [ ] API rate limiting
- [ ] User authentication
- [ ] Data export to PDF/Excel

## Performance Notes

- Handles up to 50,000 payments
- Large file uploads optimized
- Caching for dashboard queries
- Indexed database queries

## License

MIT License - Feel free to use this for your projects

## Support

For issues or questions:
1. Check the README
2. Review API endpoints documentation
3. Check browser console for error messages
4. Review backend logs for detailed errors



