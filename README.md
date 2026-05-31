# 🎓 AI-Powered LMS Online Coding Platform

An advanced Learning Management System with AI-assisted tools, live coding challenges, real-time classes, leaderboard, forums, and more.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [First-Time Setup](#first-time-setup)
- [Running the Project](#running-the-project)
- [Demo Login Credentials](#demo-login-credentials)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Common Errors & Fixes](#common-errors--fixes)

---

## 🛠 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 14, Tailwind CSS, Zustand   |
| Backend    | Node.js, Express.js, Socket.IO      |
| Database   | MongoDB Atlas (Mongoose)            |
| Auth       | JWT (JSON Web Tokens) + bcrypt      |
| AI         | Google Gemini API                   |
| Media      | Cloudinary                          |
| Payments   | Stripe                              |

---

## ✅ Prerequisites

Make sure you have the following installed before starting:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- Internet connection (for MongoDB Atlas)

Check versions:
```bash
node -v
npm -v
```

---

## 🚀 First-Time Setup

> Only do this once when you first clone/download the project.

### 1. Install Server Dependencies

```bash
cd D:\Downloads\veena\server
npm install
```

### 2. Install Client Dependencies

```bash
cd D:\Downloads\veena\client
npm install
```

### 3. Seed Demo Users (Only Once)

This creates the default admin, instructor, and student accounts in MongoDB:

```bash
cd D:\Downloads\veena\server
node seed.js
```

You should see:
```
✅ Created user: admin@lms.com (role: admin)
✅ Created user: instructor@lms.com (role: instructor)
✅ Created user: student@lms.com (role: student)
```

---

## ▶️ Running the Project

Every time you want to run the project, **open two separate terminal windows/tabs**.

### Terminal 1 — Start the Backend Server

```bash
cd D:\Downloads\veena\server
npm run dev
```

✅ You should see:
```
[nodemon] starting `node server.js`
Server running in development mode on port 5000
MongoDB Connected: ac-dxuuxnu-shard-00-01.i12jwbz.mongodb.net
```

### Terminal 2 — Start the Frontend

```bash
cd D:\Downloads\veena\client
npm run dev
```

✅ You should see:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

### Open in Browser

Go to: **[http://localhost:3000](http://localhost:3000)**

> ⚠️ **Important**: The backend (Terminal 1) MUST be running before you open the app, otherwise you'll see a "Network Error" on the login page.

---

## 🔑 Demo Login Credentials

Use these to log in without registering:

| Role        | Email                  | Password        | Redirects To              |
|-------------|------------------------|-----------------|---------------------------|
| 👑 Admin    | admin@lms.com          | Admin@123       | /instructor/dashboard     |
| 🧑‍🏫 Instructor | instructor@lms.com | Instructor@123  | /instructor/dashboard     |
| 🎓 Student  | student@lms.com        | Student@123     | /student/dashboard        |

Or you can **register a new account** at [http://localhost:3000/register](http://localhost:3000/register)

---

## 📁 Project Structure

```
veena/
├── client/                  # Next.js Frontend
│   ├── src/
│   │   ├── app/             # Pages (Next.js App Router)
│   │   │   ├── login/       # Login page
│   │   │   ├── register/    # Registration page
│   │   │   ├── student/     # Student dashboard & features
│   │   │   ├── instructor/  # Instructor dashboard & features
│   │   │   ├── forum/       # Discussion forums
│   │   │   └── leaderboard/ # Global leaderboard
│   │   ├── components/      # Reusable UI components
│   │   ├── store/           # Zustand state management
│   │   └── contexts/        # React contexts
│   └── package.json
│
├── server/                  # Express.js Backend
│   ├── config/
│   │   └── db.js            # MongoDB connection
│   ├── controllers/         # Route handler logic
│   ├── middleware/          # Auth middleware (JWT)
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Challenge.js
│   │   ├── ForumPost.js
│   │   └── LiveClass.js
│   ├── routes/              # API route definitions
│   ├── utils/               # Helper utilities
│   ├── seed.js              # Demo data seeder
│   ├── server.js            # Main entry point
│   └── .env                 # Environment variables (DO NOT commit)
│
└── README.md
```

---

## ⚙️ Environment Variables

The server uses `server/.env`. It is already configured. Do **not** commit this file.

| Variable               | Purpose                          |
|------------------------|----------------------------------|
| `PORT`                 | Server port (default: 5000)      |
| `MONGO_URI`            | MongoDB Atlas connection string  |
| `JWT_SECRET`           | Secret for signing JWT tokens    |
| `GEMINI_API_KEY`       | Google Gemini AI API key         |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary media storage         |
| `CLOUDINARY_API_KEY`   | Cloudinary API key               |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret            |
| `STRIPE_SECRET_KEY`    | Stripe payment gateway           |
| `STRIPE_WEBHOOK_SECRET`| Stripe webhook verification      |

---

## 🐛 Common Errors & Fixes

### ❌ "Network Error" on login page
**Cause:** Backend server is not running.  
**Fix:** Open a new terminal and run:
```bash
cd D:\Downloads\veena\server
npm run dev
```

### ❌ "Invalid email or password"
**Cause:** The account doesn't exist in the database yet.  
**Fix:** Run the seed script once:
```bash
cd D:\Downloads\veena\server
node seed.js
```
Then log in using the [Demo Credentials](#demo-login-credentials) above.

### ❌ "'nodemon' is not recognized"
**Cause:** nodemon is not installed.  
**Fix:**
```bash
cd D:\Downloads\veena\server
npm install nodemon --save-dev
npm run dev
```

### ❌ Port already in use (EADDRINUSE)
**Cause:** Another instance of the server is running.  
**Fix:** Kill the process using the port:
```bash
# Find process on port 5000
netstat -ano | findstr :5000
# Kill it (replace PID with the number from above)
taskkill /PID <PID> /F
```

### ❌ MongoDB connection error
**Cause:** No internet connection or Atlas IP not whitelisted.  
**Fix:** Ensure you have internet access. If deploying, add your IP to MongoDB Atlas → Network Access → Add IP Address.

---

## 📌 Quick Start Summary

```bash
# Terminal 1 - Backend
cd D:\Downloads\veena\server && npm run dev

# Terminal 2 - Frontend
cd D:\Downloads\veena\client && npm run dev

# Browser → http://localhost:3000
# Login with: student@lms.com / Student@123
```
