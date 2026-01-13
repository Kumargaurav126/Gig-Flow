# GigFlow 🚀

GigFlow is a full-stack freelance marketplace application where users can post jobs (as Clients) and bid on projects (as Freelancers). The platform features fluid roles, meaning a single user account can both post gigs and apply for them.

It includes real-time notifications using Socket.io, secure authentication, and a responsive UI built with Tailwind CSS.

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Installation & Setup](#-installation--setup)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [Running the Application](#-running-the-application)

---

## ✨ Features
* **User Authentication:** Secure Login & Registration using JWT (JSON Web Tokens) and HTTP-Only Cookies.
* **Fluid Roles:** Users can switch between Client (posting jobs) and Freelancer (bidding) seamlessly.
* **Job Management:** Create, view, and search for open gigs.
* **Bidding System:** Freelancers can submit proposals with pricing and cover letters.
* **Hiring System:** Clients can review bids and hire freelancers (Atomic Transactions ensure data integrity).
* **Real-time Notifications:** Freelancers receive instant popup notifications when hired (powered by Socket.io).
* **Responsive Design:** Optimized for Mobile, Tablet, and Desktop using Tailwind CSS.

---

## 🛠 Tech Stack

### **Frontend**
* **React.js** (Vite)
* **Tailwind CSS** (Styling)
* **Axios** (API Requests)
* **Socket.io-client** (Real-time communication)
* **React Router DOM** (Navigation)

### **Backend**
* **Node.js** & **Express.js**
* **MongoDB** & **Mongoose** (Database)
* **Socket.io** (Real-time server)
* **Bcrypt.js** (Password Hashing)
* **JWT** (Authentication)
* **Cookie-Parser** (Secure Session Management)

---

## ⚙️ Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/try/download/community) (Local) or a [MongoDB Atlas](https://www.mongodb.com/atlas) account (Cloud)

---

## 🔐 Environment Variables

You need to configure environment variables for both the Backend and Frontend.

### **1. Backend .env**
Create a file named `.env` inside the `backend/` folder:

`PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173`


## 🚀 Installation & Setup

### 1. Backend Setup
Open a terminal and navigate to the backend folder:

` cd backend `

` npm install `

Start the backend server:

### Using Nodemon (Recommended for development)
` npm run dev `

### OR using standard Node
` node server.js `
You should see: 🚀 Server running on port 5000 and ✅ MongoDB Connected

### 2. Frontend Setup
Open a new terminal (keep the backend running) and navigate to the frontend folder:

` cd frontend `

` npm install `

Start the React development server:

` npm run dev `
You should see: Local: http://localhost:5173/

## 🏃‍♂️ Running the Application
* Ensure your MongoDB is running (or your Atlas URI is correct).
* Open Terminal 1: Run Backend (npm run dev inside /backend).
* Open Terminal 2: Run Frontend (npm run dev inside /frontend).
* Open your browser and navigate to: http://localhost:5173

