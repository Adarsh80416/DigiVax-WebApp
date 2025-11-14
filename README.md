# DigiVax - Digital Vaccination Management Platform

A comprehensive MERN stack application for managing children's vaccination records, appointments, and reminders with role-based access control.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Role-Based Access Control**: Parent, Doctor, and Admin roles
- **Child Registration & Management**: Track vaccination history for children
- **Appointment Booking**: Schedule and manage vaccination appointments
- **Email Reminders**: Automated appointment reminders via Nodemailer
- **Admin Dashboard**: Analytics and management tools
- **Responsive UI**: Modern Material-UI interface

## 📁 Project Structure 

```
DigiVax/
 ├── server/          # Node.js + Express backend
 │   ├── config/      # Database configuration
 │   ├── models/      # MongoDB schemas
 │   ├── controllers/ # Route controllers
 │   ├── routes/      # API routes
 │   ├── middleware/  # Auth middleware
 │   └── utils/       # Helper functions
 └── client/          # React frontend
     ├── src/
     │   ├── api/     # API calls
     │   ├── components/ # Reusable components
     │   ├── pages/   # Page components
     │   └── context/ # React context
```

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT
- bcryptjs
- Nodemailer
- node-cron

### Frontend
- React.js
- Material-UI
- Axios
- React Router
- React Context API
- Recharts

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (Atlas or local)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd DigiVax
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Start Backend
```bash
cd server
npm run dev
```

### Start Frontend
```bash
cd client
npm start
```
The application will be available at `http://localhost:3000`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Parent Routes
- `POST /api/parents/children` - Add child
- `GET /api/parents/children` - Get all children
- `POST /api/parents/appointments` - Book appointment
- `GET /api/parents/appointments` - Get appointments

### Doctor Routes
- `GET /api/doctors/appointments` - Get appointments
- `PUT /api/doctors/appointments/:id/status` - Update appointment status

### Admin Routes
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/doctors` - Get all doctors
- `POST /api/admin/hospitals` - Create hospital
- `POST /api/admin/vaccines` - Create vaccine

## 👤 User Roles

### Parent
- Register children
- View vaccination history
- Book appointments
- Receive email reminders

### Doctor
- View assigned appointments
- Update appointment status
- Mark vaccinations as completed

### Admin
- View system analytics
- Manage hospitals and vaccines
- Monitor all appointments

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Protected API routes

## 📧 Email Notifications

The system automatically sends email reminders:
- Daily at 9 AM
- For appointments scheduled for tomorrow
- Including child name, vaccine, hospital, and time

## 🚢 Deployment

### Backend (Render/Railway)
1. Connect your repository
2. Set environment variables
3. Deploy

### Frontend (Vercel/Netlify)
1. Connect your repository
2. Set environment variables
3. Deploy

## 📄 License

MIT License

## 👨‍💻 Author 

DigiVax Development Team

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## ⭐ Show your support
Give a ⭐️ if you like this project
