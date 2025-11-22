# 🎯 SheDev – AI Workforce Analytics Platform

A comprehensive analytics platform for tracking AI adoption, workforce sentiment, training effectiveness, and organizational maturity.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
cd Nikitha
npm install
```

2. **Setup Database:**
   - Create a Neon database
   - Run `etl/schema.sql` (main data schema)
   - Run `etl/users_schema.sql` (authentication)

3. **Configure Environment:**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NODE_ENV=development
```

4. **Run Development Server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 👥 User Roles

The platform supports 4 user roles:

| Role | Theme | Dashboard | Access |
|------|-------|-----------|--------|
| **Super Admin** | 🔴 Red | `/admin` | Full system access |
| **HR Manager** | 🔵 Blue | `/dashboard` | Organization analytics |
| **Manager** | 🟢 Green | `/dashboard/team` | Team metrics |
| **L&D Specialist** | 🟣 Purple | `/dashboard/lnd` | Training management |

### Default Test Accounts

After running `users_schema.sql`:

| Email | Password | Role |
|-------|----------|------|
| admin@company.com | admin123 | Super Admin |
| hr@company.com | password123 | HR Manager |
| manager@company.com | password123 | Manager |
| lnd@company.com | password123 | L&D Specialist |

## 📊 Features

### Super Admin
- User management (create, edit, delete users)
- Data upload and management
- Activity logs and monitoring
- System settings configuration
- Access to all dashboards

### HR Manager
- Organization-wide analytics
- Sentiment analysis
- Training impact reports
- Organizational maturity metrics
- Advanced filtering (7 types)
- CSV exports

### Manager
- Team dashboard with KPIs
- Team sentiment analysis
- Team productivity metrics
- Team training status
- Professional report generation

### L&D Specialist
- Training dashboard
- Skill readiness assessment
- Training impact analysis
- Training needs identification
- Learning path recommendations

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon)
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React

## 📁 Project Structure

```
Nikitha/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin interface
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # HR, Manager, L&D dashboards
│   └── api/               # API routes
├── components/            # Reusable components
├── lib/                   # Utilities and helpers
├── etl/                   # Database schemas and data
├── public/                # Static assets
└── Data/                  # Sample data files
```

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel --prod
```

3. **Set Environment Variables in Vercel:**
- `DATABASE_URL` - Your Neon database URL
- `NEXTAUTH_URL` - https://your-app.vercel.app
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`

4. **Test:**
- Visit your app
- Create account at `/auth/signup`
- Login and verify dashboard loads

### Alternative Platforms
- Railway
- Render
- DigitalOcean App Platform

## 📖 Documentation

- **DEPLOY_NOW.md** - Quick 5-minute deployment guide
- **DEPLOYMENT_CHECKLIST.md** - Complete deployment checklist
- **SIGNUP_ROLES_EXPLAINED.md** - User roles and permissions
- **LND_COMPLETE_IMPLEMENTATION.md** - L&D interface details
- **FINAL_DEPLOYMENT_SUMMARY.md** - Complete feature list

## 🔒 Security

- Password hashing (bcrypt, 10 rounds)
- SQL injection prevention
- XSS protection
- CSRF protection
- Role-based access control
- Secure session management (JWT)

## 🧪 Testing

Create test accounts for each role:
```bash
# Visit /auth/signup
# Create accounts with different roles
# Test each dashboard
```

## 📊 Key Metrics

- **15 dashboard pages**
- **80+ functional buttons**
- **40+ charts and visualizations**
- **7 filter types**
- **CSV exports on all pages**
- **Professional report generation**

## 🤝 Contributing

This is a complete, production-ready application. For customization:
1. Modify components in `components/`
2. Update API routes in `app/api/`
3. Customize styling in `app/globals.css`

## 📝 License

MIT

## 🆘 Support

For issues or questions:
1. Check documentation in root folder
2. Review deployment guides
3. Verify environment variables
4. Ensure database connection

---

**Status:** ✅ Production Ready

**Version:** 1.0.0

Deploy and start analyzing your workforce AI adoption today! 🚀
