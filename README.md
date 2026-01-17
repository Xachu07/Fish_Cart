# Fish Cart - Hyperlocal Seafood Delivery System

A full-stack MERN application for managing a hyperlocal seafood delivery business. This system allows customers to order fresh fish online, admins to manage inventory and orders, and delivery partners to track and deliver orders.

## Tech Stack

- **Frontend:** React, React Router, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs

## Features

### Customer Features
- User registration and login
- Browse daily fish inventory (Daily Catch)
- Filter products by category (Sea Fish, Shellfish, River Fish)
- Add items to cart with preparation preference (Whole or Cleaned & Cut)
- Place orders and track order status
- View order history

### Admin Features
- Dashboard with statistics overview
- Manage product inventory (Add, Edit, Delete)
- View all orders with customer details
- Update order status
- Generate packing lists (grouped by preparation type)
- Assign orders to delivery partners
- Toggle shop open/closed status

### Delivery Partner Features
- View assigned deliveries
- Update delivery status (Packed → Out for Delivery → Delivered)
- Mobile-friendly interface
- Customer contact information

## Project Structure

```
FishCart/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context providers
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── middleware/        # Auth middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── server.js          # Express server
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

4. Start the server:
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is occupied)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `POST /api/orders` - Create order (customer)
- `GET /api/orders/myorders` - Get user's orders (customer)
- `GET /api/orders/admin` - Get all orders (admin)
- `GET /api/orders/assigned` - Get assigned orders (partner)
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/assign` - Assign order to partner (admin)

### Shop
- `GET /api/shop/status` - Get shop status
- `PUT /api/shop/status` - Update shop status (admin)

## Creating User Roles

To create users with different roles, use the register endpoint or create them directly in the database:

**Admin User:**
```json
{
  "name": "Admin",
  "email": "admin@fishcart.com",
  "password": "admin123",
  "role": "admin"
}
```

**Delivery Partner:**
```json
{
  "name": "Partner Name",
  "email": "partner@fishcart.com",
  "password": "partner123",
  "role": "partner"
}
```

**Customer:**
```json
{
  "name": "Customer Name",
  "email": "customer@fishcart.com",
  "password": "customer123",
  "role": "user"
}
```

## Testing the Application

### 1. Create an Admin Account
- Register through the frontend with role "admin" (or create manually)
- Login and access the admin dashboard

### 2. Add Products
- Go to `/admin/products`
- Click "Add Product"
- Fill in product details and save

### 3. Open Shop
- Go to `/admin/shop-status`
- Click "Open Shop"

### 4. Create Customer Account
- Register as a regular user
- Browse products on the home page
- Add items to cart and checkout

### 5. Process Orders
- As admin, view orders at `/admin/orders`
- Update order status to "Packed"
- Assign to a delivery partner (using partner user ID)
- Partner can view and update status at `/partner`

## Notes

- For demo purposes, admin panel is accessible via frontend
- JWT tokens are stored in localStorage
- Shop status controls whether customers can place orders
- Orders automatically update product stock quantities
- Password validation is minimal for demo purposes

## Troubleshooting

**MongoDB Connection Error:**
- Check your `.env` file has correct `MONGO_URI`
- Ensure MongoDB Atlas whitelist includes your IP address
- Verify database connection string format

**CORS Errors:**
- Ensure backend server is running on port 5000
- Check `API_URL` in `client/src/utils/api.js` matches backend URL

**Authentication Issues:**
- Clear localStorage and try logging in again
- Verify JWT_SECRET is set in backend `.env` file

## License

This is a final year project for educational purposes.
