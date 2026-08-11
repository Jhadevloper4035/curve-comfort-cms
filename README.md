
# Curve Comfort Admin Dashboard

Full-stack MERN admin dashboard for Curve Comfort lead capture, website content, product catalogue management, analytics, and role-scoped operations.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Bootstrap 5, Zustand, TanStack Table |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Auth | JWT in httpOnly cookies |
| Exports | Excel via XLSX |
| Dev Runtime | Docker Compose or local Node/Vite |

### Frontend Libraries

- **Routing/UI shell**: `react-router-dom`, `react-bootstrap`, Bootstrap SCSS, Iconify icons.
- **State and auth session**: Zustand stores, React Context, `cookies-next`.
- **Forms and validation**: `react-hook-form`, Yup, React Select, React IMask/Input Mask.
- **Tables and admin lists**: TanStack Table, Grid.js.
- **Charts and dashboards**: ApexCharts / React ApexCharts.
- **Editors and rich inputs**: React Quill, Flatpickr, Swiper, SweetAlert2, React Toastify.
- **Maps/media/utilities**: Google Maps libraries, React Dropzone, Simplebar, Day.js, Moment.

### Backend Libraries

- **HTTP/API**: Express 5, CORS, Helmet, Morgan, Cookie Parser.
- **Database**: MongoDB through Mongoose.
- **Auth/security**: JSON Web Tokens, bcrypt, Express Rate Limit.
- **Validation/utilities**: validator, slugify.
- **Files/storage**: AWS SDK S3 client and presigned URLs.
- **Exports**: XLSX.
- **Development**: Nodemon, Cross Env, ESLint, Prettier.

---

## Project Structure

```txt
admindashboard/
├── backend/
│   └── src/
│       ├── config/       # DB, env, storage config
│       ├── controller/   # API controllers
│       ├── middleware/   # JWT auth, role guards, validation, rate limits
│       ├── model/        # Mongoose models
│       ├── routes/       # Express route modules
│       └── utils/        # Excel export, activity logging, IP helpers
├── frontend/
│   └── src/
│       ├── app/          # Admin/public pages
│       ├── components/   # Layout, topbar, Activity Stream, shared UI
│       ├── context/      # Auth and layout state
│       ├── helpers/      # API client helpers
│       ├── routes/       # React Router config
│       └── store/        # Zustand stores
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── Makefile
```

---

## Features

- **Lead Management**: event leads, showroom leads, Dubaiwood Show leads, website contact leads, product enquiries, and job enquiries.
- **International Dubaiwood Leads**: Dubaiwood Show mobile numbers are stored as plain trimmed text so visitors from any country can submit.
- **Excel Exports**: lead lists, enquiries, applications, products, and newsletter subscribers can be exported.
- **Newsletter Subscribers**: public subscription endpoint plus admin-only subscriber listing and Excel export.
- **Activity Stream**: MongoDB-backed activity logs displayed in the existing topbar Activity Stream offcanvas. No Socket.IO or real-time streaming.
- **Admin-Only Activity Access**: Activity Stream UI and APIs are visible only to `admin` and `superadmin` users.
- **Products, Blogs, SEO Meta**: CRUD/admin workflows for website content and catalogue data.
- **Analytics Dashboard**: summary cards and charts for leads and website activity.
- **Role-Based Access**: users are scoped by `accessType` and explicit permissions.

---

## Roles And Permissions

Primary access types:

- `superadmin`: full access.
- `admin`: full admin access except superadmin-only user creation rules.
- `website` / `sales`: website leads, product enquiries, job enquiries, newsletters.
- `event`: event, Dubaiwood, and showroom enquiry access.
- `showroom`: showroom enquiry access.
- `jobs`: job posts and job enquiries.
- `custom`: explicit permission-based access only.

Activity Stream is intentionally stricter than normal permission checks:

- Frontend shows the topbar Activity Stream button only for `admin` and `superadmin`.
- Backend protects `/api/activity-stream` with `protect` and `adminOnly`.
- Non-admin users receive `403 Forbidden` even if they call the API directly.

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- Docker and Docker Compose, recommended for local development
- MongoDB, local through Docker or Atlas/managed MongoDB

### Docker Development

```bash
make dev-up        # start mongo, backend, frontend
make dev-logs      # follow logs
make dev-ps        # show running containers
make dev-down      # stop services
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`
- Dev admin seeded by Docker env: `admin` / `admin12345`

Seed the kitchen and wardrobe landing-page baseline:

```bash
make dev-seed-landing # local Docker development database

cd backend
NODE_ENV=production npm run seed:landing-page # Atlas/production database
```

It skips existing landing-page content. Use `npm run seed:landing-page -- --replace` only when you intentionally want to replace it.

If port `5173` is already in use, stop the existing Vite process or recreate the frontend container:

```bash
docker compose -f docker-compose.dev.yml up -d --force-recreate frontend
```

### Backend Local Development

```bash
cd backend
npm install
npm run dev
```

Example environment:

```env
PORT=8000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017
DBNAME=curve_comfort-dev
JWT_SECRET=<your-secret>
ALLOWED_ORIGINS=http://localhost:5173
ADMIN_SECRET=<optional-admin-secret>
AWS_ACCESS_KEY_ID=<your-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
AWS_REGION=ap-south-1
S3_BUCKET=curve-comfort-admin-dashboard
# Optional: CDN or custom S3 public URL
S3_PUBLIC_BASE_URL=
```

The Express app uses `app.set("trust proxy", true)` so real client IPs work behind Nginx, Cloudflare, Render, Railway, Vercel, and similar proxies.

### Provision S3 uploads

From the repository root, authenticate the AWS CLI with an IAM principal allowed to manage S3 and IAM, then run:

```bash
cd terraform
terraform init
terraform apply
terraform output -raw backend_s3_env > ../s3-credentials.txt
```

The generated credentials are stored in the ignored root file `s3-credentials.txt`; copy them into `backend/.env.development` or `backend/.env.production`. For a deployed dashboard, also provide its URL during apply: `terraform apply -var='cors_origins=["https://admin.example.com"]'`.

### Frontend Local Development

```bash
cd frontend
npm install
npm run dev
npm run build
```

Example frontend env:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WEBSITE_BASE_URL=http://localhost:8000/api
VITE_ADMIN_SECRET=
```

---


http://localhost:8000/api/public/landing-page/kitchen
http://localhost:8000/api/public/landing-page/wardrobe

## API Overview

All backend routes are prefixed with `/api`.

Authentication is cookie-based. Protected requests rely on the `token` httpOnly cookie set by `/api/auth/login`.

Permission names used by the API include:

```txt
dashboard.view
users.manage
products.manage
blogs.manage
seoMeta.manage
websiteLeads.manage
newsletterSubscribers.view
productEnquiries.view
jobs.manage
eventLeads.view
dubaiwoodLeads.view
showroomLeads.manage
```

### Auth — `/api/auth`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/login` | Public | Login and set JWT cookie |
| POST | `/logout` | Public | Clear auth cookie |
| GET | `/me` | Authenticated | Get current user |
| PUT | `/change-password` | Authenticated | Change own password |
| POST | `/register` | `users.manage` | Create a scoped user |
| GET | `/users` | `users.manage` | List users |
| PUT | `/users/:id` | `users.manage` | Update user |
| DELETE | `/users/:id` | `users.manage` | Delete user |

### Leads — `/api/lead`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/event/contact-form-submit/:place` | Public | Submit event lead |
| POST | `/showroom/contact-form-submit` | Public | Submit showroom enquiry |
| POST | `/dubaiwood/contact-form-submit` | Public | Submit Dubaiwood Show enquiry |
| POST | `/contactleads` | Public/Admin | Create website contact lead |
| GET | `/event/:place` | `eventLeads.view` | List event leads |
| GET | `/event/download/:place` | `eventLeads.view` | Export event leads |
| GET | `/showroom` | `showroomLeads.manage` | List showroom leads |
| GET | `/showroom/download` | `showroomLeads.manage` | Export showroom leads |
| GET | `/dubaiwood` | `dubaiwoodLeads.view` | List Dubaiwood Show leads |
| GET | `/dubaiwood/download` | `dubaiwoodLeads.view` | Export Dubaiwood Show leads |
| GET | `/contactleads` | `websiteLeads.manage` | List website leads |
| PUT | `/contactleads/:id` | `websiteLeads.manage` | Update website lead |
| DELETE | `/contactleads/:id` | `websiteLeads.manage` | Delete website lead |
| GET | `/website/download` | `websiteLeads.manage` | Export website leads |
| GET | `/productEnquiry` | `productEnquiries.view` | List product enquiries |
| GET | `/product-enquiry/download` | `productEnquiries.view` | Export product enquiries |

The same lead routes are also mounted under `/api/leads` for compatibility.

### Activity Stream — `/api/activity-stream`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Admin/superadmin only | Paginated activity logs |
| GET | `/leads` | Admin/superadmin only | Paginated lead activity logs |

Supported query params:

```txt
page, limit, module, action, user, status, from, to, search
```

Response shape:

```json
{
  "success": true,
  "activities": [],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 0,
    "pages": 0
  }
}
```

Activity logs store actor metadata, title, description, module, action, target, status, badge, icon type, method, route, user agent, `ipAddress`, `realIpAddress`, and `forwardedFor`.

Real IP detection priority:

1. `cf-connecting-ip`
2. `x-real-ip`
3. first IP from `x-forwarded-for`
4. `req.ip`
5. `req.socket.remoteAddress`

### Newsletter — `/api/newsletter`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/subscribe` | Public | Create/reactivate newsletter subscriber |
| GET | `/` | `newsletterSubscribers.view` | List subscribers |
| GET | `/download` | `newsletterSubscribers.view` | Export subscribers |

### Products — `/api/product`

All product routes require `products.manage`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List products |
| GET | `/download` | Export products |
| POST | `/` | Create product |
| PUT | `/:id` | Update product |
| DELETE | `/:id` | Delete product |

### Blogs — `/api/blog`

All blog routes require `blogs.manage`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List blogs |
| POST | `/` | Create blog |
| PUT | `/:id` | Update blog |
| DELETE | `/:id` | Delete blog |

### SEO Meta — `/api/seo-meta`

All SEO meta routes require `seoMeta.manage`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List SEO metadata entries |
| POST | `/` | Create SEO metadata entry |
| PUT | `/:id` | Update SEO metadata entry |
| DELETE | `/:id` | Delete SEO metadata entry |

### Jobs — `/api/jobs`

All job post routes require `jobs.manage`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List jobs; supports `status` query |
| GET | `/:id` | Get job by ID |
| POST | `/` | Create job |
| PUT | `/:id` | Update job |
| DELETE | `/:id` | Delete job |

### Uploads — `/api/upload`

Upload routes are protected and available to managers for products, blogs, SEO meta, and jobs.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/presign` | Create a single S3 presigned upload URL |
| POST | `/presign-batch` | Create multiple S3 presigned upload URLs |
| DELETE | `/delete` | Delete an uploaded object |

### Health — `/api/health`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check for API/database status |

### Admin Module Prefix Summary

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Login, logout, current user, user management |
| `/api/lead` and `/api/leads` | Lead submission, lead lists, exports |
| `/api/activity-stream` | Admin-only activity logs |
| `/api/newsletter` | Newsletter subscription and subscriber admin |
| `/api/product` | Product catalogue management and export |
| `/api/blog` | Blog management |
| `/api/seo-meta` | SEO metadata management |
| `/api/upload` | Upload/presign helpers |
| `/api/health` | Health check |

---

## Activity Stream Behavior

The Activity Stream is the existing right-side offcanvas opened from the topbar history icon.

It logs important lead actions:

- `LEAD_CREATED`
- `LEAD_UPDATED`
- `LEAD_STATUS_CHANGED`
- `LEAD_ASSIGNED`
- `LEAD_NOTE_ADDED`
- `LEAD_DELETED`
- `LEAD_EXPORTED`

`LEAD_VIEWED` is reserved for a future lead-detail endpoint.

The logger is intentionally safe:

- It does not log request bodies.
- It does not store passwords, tokens, OTPs, or secrets.
- Logging errors never break the original business flow.
- Logging errors are printed only in development.

---

## Scripts

### Root Makefile

```bash
make dev              # Build images and start dev services
make dev-up           # Start dev services without rebuild
make dev-down         # Stop dev services
make dev-down-v       # Stop dev services and remove volumes
make dev-build        # Build dev images
make dev-logs         # Tail dev logs
make dev-ps           # Show dev containers
make prod             # Build and start production services
make prod-up          # Start production services
make prod-down        # Stop production services
```

### Backend

```bash
npm run dev       # Start with nodemon
npm start         # Production start
npm run lint      # Lint backend
npm run format    # Format backend
```

### Frontend

```bash
npm run dev       # Vite dev server
npm run build     # TypeScript check + Vite build
npm run lint      # ESLint
npm run format    # Prettier
npm run preview   # Preview production build
```

---

## Testing Checklist

### Activity Stream

- Login as `admin` or `superadmin`.
- Confirm the Activity Stream history button appears in the topbar.
- Create a website lead.
- Update the lead status.
- Add/update notes.
- Delete the lead.
- Export leads.
- Open Activity Stream and confirm newest-first logs with title, user name, action, date, and real IP.
- Login as a normal/custom user.
- Confirm the Activity Stream button is hidden.
- Call `GET /api/activity-stream` as the normal user and confirm `403 Forbidden`.

### Dubaiwood Show Leads

- Open `/dubaiwood-lead`.
- Submit a mobile number from any country, for example `+971 43292444`.
- Confirm the form submits successfully and the number is visible in Dubaiwood leads.

### Newsletter Subscribers

- Submit `POST /api/newsletter/subscribe` with an email.
- Login as an admin/website/sales user with `newsletterSubscribers.view`.
- Open **Website Apps → Newsletters**.
- Confirm subscribers list, search, stats, and Excel export work.

---

## Notes

- The Activity Stream is database-backed and fetched through REST APIs only. It does not use Socket.IO or real-time streaming.
- Static demo Activity Stream data is no longer used by the built-in offcanvas.
- Keep reverse proxies configured to pass forwarding headers so `realIpAddress` is useful in production.
