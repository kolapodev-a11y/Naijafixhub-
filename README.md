# 🇳🇬 NaijaFixHub

> **Find trusted local artisans & home service providers in Nigeria – fast & safe**

Built by [PeezuTech](https://peezutech.name.ng) | Contact: peezutech@gmail.com

---

## 🚀 Project Overview

NaijaFixHub is a mobile-first platform connecting Nigerians with verified plumbers,
electricians, tailors, cleaners, and other service providers.

### ✨ Key Features
- 🔐 User Registration & Login (Email/Password + JWT)
- 🏠 Home: Hero, Smart Match form, Featured carousel, Category grid, State filters
- 🔍 Search & Explore with filters (state, category, sort)
- 📋 Artisan Detail: Photos, reviews, WhatsApp contact, Report button
- ✍️ Multi-step Post Service form (3 steps: Details → Contact → Safety)
- ⚡ Quick Job Request form
- 🛡️ Admin Dashboard (Pending → Approve/Reject, Reports, Users)
- 💳 Premium "Top Artisan" listing via Paystack (₦5,000/month)
- 🚫 Auto-reject scam keywords
- ⚠️ Safety disclaimers throughout

---

## 🗂️ Project Structure

\`\`\`
NaijaFixHub/
├── frontend/         # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # Navbar, Footer, Layout
│   │   │   ├── ui/          # Modal, StarRating, LoadingSpinner
│   │   │   ├── artisan/     # ArtisanCard
│   │   │   └── home/        # HeroSection, SmartMatchForm, CategoryGrid, etc.
│   │   ├── pages/           # HomePage, SearchPage, ArtisanDetailPage, etc.
│   │   ├── context/         # AuthContext, AppContext
│   │   └── utils/           # api.js, constants.js, helpers.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vercel.json
│
└── backend/          # Node.js + Express + MongoDB
    ├── src/
    │   ├── models/          # User, Artisan, Review, Report, JobRequest
    │   ├── routes/          # auth, artisans, requests, reports, admin, payments
    │   ├── controllers/     # authController, artisanController, adminController, paymentController
    │   ├── middleware/       # auth, admin, upload, scamFilter
    │   ├── config/          # db.js
    │   └── utils/           # seeder.js
    ├── server.js
    └── render.yaml
\`\`\`

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier)
- Paystack account (for payments)

---

### 🔧 Backend Setup

\`\`\`bash
cd backend
npm install

# Copy and edit environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Cloudinary, Paystack keys

# Seed the database with sample data
npm run seed

# Start development server
npm run dev
\`\`\`

Backend runs at: **http://localhost:5000**

---

### 🎨 Frontend Setup

\`\`\`bash
cd frontend
npm install

# Copy environment file
cp .env.example .env
# Edit VITE_API_URL if needed

# Start development server
npm run dev
\`\`\`

Frontend runs at: **http://localhost:3000**

---

## 🌐 Deployment

### Frontend → Vercel
\`\`\`bash
cd frontend
npm run build
# Deploy to Vercel (auto-deploys on git push)
\`\`\`
Set environment variable in Vercel:
- \`VITE_API_URL\` = your backend URL

### Backend → Render.com
1. Push to GitHub
2. Create Web Service on Render
3. Set root directory to \`backend/\`
4. Build command: \`npm install\`
5. Start command: \`npm start\`
6. Add all environment variables from \`.env.example\`

### Database → MongoDB Atlas
1. Create free cluster
2. Create database user
3. Get connection string → \`MONGODB_URI\` in backend \`.env\`

---

## 👤 Admin Access
- **Email:** peezutech@gmail.com
- **Portfolio:** https://peezutech.name.ng
- After running seeder: Password = \`Admin@12345\`

**Admin capabilities:**
- Approve/Reject artisan listings
- View & resolve reports
- See all users
- Dashboard stats

---

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Purple | `#7C3AED` | Brand, buttons, links |
| Accent Magenta | `#A855F7` | CTAs, WhatsApp buttons |
| Background | `#F3E8FF` | Page background |
| Text | `#1F2937` | Body text |
| Success | `#10B981` | Verified badges |
| Danger | `#EF4444` | Reports, errors |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| State | Context + useReducer |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| File Upload | Multer + Cloudinary |
| Payments | Paystack |
| Deployment | Vercel + Render + MongoDB Atlas |

---

## ➕ Adding More Categories

Edit `frontend/src/utils/constants.js` → add to `CATEGORIES` array:
\`\`\`js
{ id: 'new-category', name: 'New Category Name', icon: '🔨', color: '#6B7280' },
\`\`\`

---

## ⚠️ Safety Policy

NaijaFixHub **does not process payments**. All transactions are directly between users and artisans.
Auto-rejection of scam keywords is enabled on both frontend and backend.

---

## 📄 License

MIT – Built with ❤️ by [PeezuTech](https://peezutech.name.ng)
