# Ecommerce Application Setup Guide

## ✅ Completed Steps

### 1. Dependencies Installed
All required packages have been installed including:
- Next.js 14.2.4
- Express.js
- Prisma with PostgreSQL
- Authentication (JWT, bcryptjs)
- UI Libraries (Tailwind CSS)

### 2. Database Setup
- PostgreSQL database "ecommerce_db" created
- Prisma schema configured with all ecommerce entities:
  - Users (with roles)
  - Products
  - Categories
  - Orders & OrderItems
  - Cart & CartItems
  - Reviews
  - Addresses
- Database migrated successfully

### 3. Environment Configuration
Environment variables configured in `.env`:
- Database URL
- JWT Secret
- Server Port: 5001
- Next.js URL: http://localhost:3001

### 4. Servers Running
✅ Express API Server: http://localhost:5001
✅ Next.js Frontend: http://localhost:3001

## 🚀 How to Access Your Application

### Frontend (User Interface)
- **URL**: http://localhost:3001
- **Features**: 
  - Product catalog
  - User authentication
  - Shopping cart
  - Order management

### Backend API (Server)
- **URL**: http://localhost:5001
- **API Endpoints**:
  - Authentication: `/api/auth/*`
  - Products: `/api/products/*`
  - Categories: `/api/categories/*`
  - Cart: `/api/cart/*`
  - Orders: `/api/orders/*`
  - Reviews: `/api/reviews/*`

### Database Management
- **Prisma Studio**: Run `npm run db:studio` to open visual database browser
- **Database URL**: postgresql://postgres:password@localhost:5432/ecommerce_db

## 🛠️ Development Commands

### Start Development Servers
```bash
# Start both servers together
npm run dev:full

# Or start separately:
npm run server    # Express API server
npm run dev       # Next.js frontend
```

### Database Commands
```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Create new migration
npm run db:studio    # Open Prisma Studio
```

### Build for Production
```bash
npm run build    # Build Next.js app
npm start        # Start production server
```

## 📁 Project Structure

```
ecommerce/
├── prisma/
│   └── schema.prisma        # Database schema
├── pages/
│   ├── _app.tsx            # Next.js app wrapper
│   └── index.tsx           # Homepage
├── components/
│   ├── Navbar.tsx          # Navigation component
│   └── Footer.tsx          # Footer component
├── contexts/
│   ├── AuthContext.tsx     # Authentication context
│   └── CartContext.tsx     # Shopping cart context
├── routes/
│   ├── auth.js             # Authentication API
│   ├── products.js         # Products API
│   ├── cart.js             # Cart API
│   └── orders.js           # Orders API
├── middleware/
│   └── auth.js             # JWT authentication middleware
├── server.js               # Express server
└── .env                    # Environment variables
```

## 🔑 Key Features Implemented

### Authentication System
- User registration and login
- JWT token-based authentication
- Role-based access control (USER/ADMIN)
- Protected routes

### Product Management
- Product CRUD operations
- Category management
- Image upload support
- Search and filtering

### Shopping Cart
- Add/remove items
- Update quantities
- Persistent cart state
- Cart total calculation

### Order System
- Order creation and management
- Order history
- Order status tracking
- Cash on Delivery payment

### Review System
- Product reviews and ratings
- User review management

## 🔧 Next Steps

1. **Customize the UI**: Modify components in `/components` folder
2. **Add Products**: Use the admin interface or API to add products
3. **Add Images**: Configure Cloudinary for image uploads
4. **Deploy**: Deploy to Vercel (frontend) and Railway/Heroku (backend)

## 📞 API Testing

You can test the API endpoints using tools like Postman or curl:

```bash
# Register a new user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🎉 Your ecommerce application is now running!

Open http://localhost:3001 in your browser to see your application.
#   a n j u m - s - E c o m m e r c e  
 #   a n j u m s - e c o m m e r c e  
 