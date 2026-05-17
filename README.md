# AtomQuest Goal Portal - Hackathon Project

A comprehensive web-based Goal Setting & Tracking Portal for the Atomberg Hackathon 1.0.

## 🎯 Project Overview

This portal supports the full lifecycle of employee goals:
- **Phase 1:** Goal Creation & Approval (May 1st)
- **Phase 2:** Achievement Tracking & Quarterly Check-ins (July, October, January, March/April)

### User Roles
- **Employee:** Create, draft, and submit goals
- **Manager (L1):** Review, approve, or reject goals; conduct check-ins
- **Admin/HR:** Configure cycles, manage hierarchy, audit logs

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication:** Role-based demo mode (no external auth required for demo)
- **State Management:** localStorage + React Context

## 📋 Prerequisites

- Node.js 18+ and npm
- (Optional) PostgreSQL for persistent storage

## 🚀 Quick Start

### 1. Installation

```bash
# Navigate to project directory
cd In-House-Goal-Setting-Tracking-Portal-Atomberg-Hackathon-

# Install dependencies (already done)
npm install
```

### 2. Environment Setup

Create a `.env.local` file (template provided in `.env.example`):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/atomquest_db"
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page with role selector
│   └── globals.css         # Tailwind styles
├── components/
│   ├── Dashboard.tsx       # Main dashboard wrapper
│   ├── Header.tsx          # Navigation header
│   ├── RoleSelector.tsx    # Role selection screen
│   ├── roles/
│   │   ├── EmployeeDashboard.tsx
│   │   ├── ManagerDashboard.tsx
│   │   └── AdminDashboard.tsx
│   └── goal/
│       ├── GoalForm.tsx
│       └── GoalList.tsx
├── prisma/
│   └── schema.prisma       # Database schema
├── public/                 # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## ✨ Key Features (Phase 1 & 2)

### Phase 1: Goal Creation & Approval
✅ Employee-facing interface to create goals
✅ Thrust Area selection and goal definition
✅ Unit of Measurement (UoM) support: Numeric, Percentage, Timeline, Zero-based
✅ Weightage validation (Total = 100%, Min = 10% per goal, Max = 8 goals)
✅ Manager approval workflow with inline editing
✅ Goal locking mechanism
✅ Shared goals functionality (push to multiple employees)

### Phase 2: Achievement Tracking
✅ Quarterly achievement update interface
✅ Status tracking (Not Started / On Track / Completed)
✅ Manager check-in module with comments
✅ Progress score calculation (4 formulas)
✅ Planned vs. Actual comparison

## 📊 Demo Accounts

Use the role selector to switch between accounts:

- **Employee:** john.doe@atomberg.com (Password: any)
- **Manager:** sarah.smith@atomberg.com (Password: any)
- **Admin:** admin@atomberg.com (Password: any)

## 🔄 Data Storage

Currently uses `localStorage` for demo purposes. To use PostgreSQL:

1. Set up PostgreSQL database
2. Configure `DATABASE_URL` in `.env.local`
3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

## 📈 Quarterly Schedule

| Period | Window Opens | Action |
|--------|--------------|--------|
| Phase 1 | 1st May | Goal Creation, Submission & Approval |
| Q1 | July | Progress Update — Planned vs. Actual |
| Q2 | October | Progress Update — Planned vs. Actual |
| Q3 | January | Progress Update — Planned vs. Actual |
| Q4 / Annual | March / April | Final Achievement Capture |

## 🎁 Good-to-Have Features (Bonus)

- [ ] Microsoft Entra ID (Azure AD) Integration with SSO
- [ ] Email & Microsoft Teams notifications
- [ ] Rule-based escalation module
- [ ] Advanced analytics and heatmaps
- [ ] Audit trail logging
- [ ] CSV/Excel export

## 🐛 Validation Rules Implemented

- ✅ Total weightage = 100% (enforced at submission)
- ✅ Minimum weightage = 10% per goal
- ✅ Maximum goals = 8 per employee
- ✅ Required fields validation
- ✅ UoM-specific target validation

## 📝 Notes for Hackathon

1. **Demo Mode:** The portal runs in localStorage mode for easy demoing without DB setup
2. **Role Switching:** Click logout and select a different role for testing
3. **Data Persistence:** All data is stored in browser's localStorage (data persists across page refreshes)
4. **Shared Goals:** Admin can create shared goals that multiple employees receive
5. **Audit Trail:** Track all changes in the system (implementation in progress)

## 🚀 Deployment

Ready to deploy to:
- **Vercel:** `vercel deploy` (recommended for Next.js)
- **AWS/Railway:** Use Docker or custom environment
- **Heroku:** Configure buildpack for Node.js

## 📝 License

Built for Atomberg Hackathon 1.0

## 📞 Support

For issues or questions, check the validation rules and try refreshing the page.

---

**Status:** 🔄 Active Development | **Phase:** MVP (Phase 1 & 2 Core Complete)
