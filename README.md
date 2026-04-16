# FitForge - Elite Fitness & Nutrition Tracker

FitForge AI is a premium, full-stack fitness management platform designed for users who demand precision and aesthetics. Built with a modern glassmorphism design, it offers comprehensive workout tracking, nutritional oversight, and a powerful administrative suite.

---

## Key Features

### User Module
- **Dashboard**: Real-time KPI tracking for workouts, calories, and weight trend via interactive Recharts.
- **Workout Logging**: Segmented tracking for strength, cardio, and hypertrophy training.
- **Aggressive Nutrition**: Macro-nutrient breakdown (Protein, Carbs, Fats) and daily calorie targets.
- **Progress Analytics**: Visual weight progression charts and performance history.
- **Reminders & Notifications**: Integrated notification system for hydration and scheduled training.
- **Google OAuth**: One-click secure authentication.

### Administrative Suite (New)
- **Admin Dashboard**: System-wide health metrics, total user growth, and active ticket monitoring.
- **User Management**: Advanced CRUD operations, role assignment (Admin/User), and account auditing.
- **Audit Logs**: Track platform activity and security events.

---

## Technology Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React / React Icons
- **State Management**: Context API

### Backend
- **Environment**: Node.js / Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT (JSON Web Tokens) & Bcryptjs
- **Services**: Cloudinary (Media), Nodemailer (Email), PDFKit (Reporting)

---

## Local Installation

### Prerequisites
- Node.js (v16.x or higher)
- MongoDB (Local or Atlas)
- Cloudinary Account (for image uploads)

### 1. Clone the repository
```bash
git clone https://github.com/Muhammad-Ahmed-Developerr/Fitness-Tracker.git
cd Fitness-Tracker
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder by copying `.env.example`:
```bash
cp .env.example .env
```
Then, update the variables in `.env` with your actual credentials.

```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_id
```
`npm run dev`

---

## Project Structure

```bash
Fitness-Tracker/
├── backend/
│   ├── controllers/    # API Request Handlers
│   ├── models/         # MongoDB Schemas
│   ├── routes/         # API Endpoints
│   ├── middleware/     # Auth & Permissions
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── pages/      # View Components (User & Admin)
│   │   ├── context/    # Global State
│   │   └── services/   # Axios API Instance
│   └── tailwind.config.js
└── README.md
```
