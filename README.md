# Smart Mess Management System

A complete digital management platform for college and hostel mess operations, featuring a modern React frontend and a full Node.js + Express + MongoDB + JWT backend architecture.

---

## AI Studio Preview Mode

The application in Google AI Studio Preview is fully functional out of the box using instant, rich local mock data:
- **Zero Environment Variables Required**: No `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `VITE_API_URL`, or `JWT_EXPIRES_IN` needed to run or explore.
- **Phase 1 Demo Complete**: Full interactivity for Admin, Manager, and Student portals.
- **Instant Role Switching**: Use the top navigation role switcher or 1-click credentials on the Sign In page to toggle between Chief Warden (Admin), Mess Manager, and Student (Hostel Inmate).
- **Persistent State**: Changes to students, menus, attendance, inventory, complaints, notices, and billing are saved locally to `localStorage`.

---

## Seeded Demo Credentials

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin (Chief Warden)** | `admin@messsystem.com` | `Password@123` | Full control across all student directories, billing rates, menu approvals, inventory, staff, and system settings |
| **Mess Manager** | `manager@messsystem.com` | `Password@123` | Weekly menu planning, meal attendance tracking, inventory restocking, complaint management |
| **Student (Hostel Inmate)** | `student@messsystem.com` | `Password@123` | Digital meal pass, daily attendance, bill review & payment receipts, complaint submission |

---

## Running in VS Code (Full-Stack MongoDB + JWT)

When downloading or cloning this repository to VS Code, the complete backend codebase is ready for local execution:

### Architecture
```
├── server.ts                    # Root unified server (Express + Vite Middleware)
├── server/                      # Standalone backend package
│   ├── src/
│   │   ├── config/              # MongoDB connection & in-memory fallback
│   │   ├── controllers/         # Express controllers (Auth, Users, Students, Menu, etc.)
│   │   ├── middleware/          # JWT verification & error handling
│   │   ├── models/              # Mongoose data schemas (User, Attendance, Bill, etc.)
│   │   ├── routes/              # Express API routers (/api/*)
│   │   ├── services/            # Calculation & business logic
│   │   ├── utils/               # JWT helper & seed script
│   │   └── server.ts            # Express server factory
│   ├── package.json             # Backend dependencies
│   └── tsconfig.json            # Backend TypeScript configuration
├── src/                         # React 18 + Vite + Tailwind CSS frontend
│   ├── components/              # Modular UI components & layouts
│   ├── context/                 # AuthContext & AppContext
│   ├── pages/                   # Admin, Manager, and Student dashboards & views
│   ├── services/                # Axios client & typed API wrappers (api.ts)
│   └── types/                   # Shared TypeScript definitions
```

### Steps for Local Development in VS Code:
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **(Optional) Configure `.env` in root**:
   ```env
   PORT=3000
   NODE_ENV=development
   # Optional: set MongoDB URI (if omitted, automatic in-memory MongoDB will be used)
   # MONGODB_URI=mongodb://localhost:27017/mess_management
   # JWT_SECRET=your_secret_key_here
   ```
3. **Start the backend server**:
   ```bash
   npx tsx server.ts
   ```
   Or run the standalone backend:
   ```bash
   cd server && npm run dev
   ```

---

## Features Matrix

- **Student Directory**: Profile cards, diet preferences (Veg/Non-Veg/Jain), room and hostel block assignment.
- **Menu Management**: Weekly timetable covering Breakfast, Lunch, Evening Snacks, and Dinner with nutritional info.
- **Attendance Logging**: Real-time meal check-ins with daily percentage metrics and barcode scanner view.
- **Automated Billing**: Monthly invoices calculated from meal rates, active days, discounts, and payment receipt tracking (UPI / Card / Net Banking / Cash).
- **Inventory & Restocking**: Stock levels, threshold alerts for low or out-of-stock commodities, and supplier tracking.
- **Grievance Redressal**: Student ticket filing, status workflows (Pending, In Progress, Resolved), and warden response notes.
- **Notices & Circulars**: Priority banners (Urgent, Important, Normal) with targeted student/staff distribution.
- **Dark / Light Theme**: One-click theme toggle with persistent preference.
