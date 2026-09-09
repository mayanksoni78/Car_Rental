# 🚗 Car Rental Platform — Production MERN Architecture

> A high-reliability, full-stack vehicle rental and fleet management platform engineered with atomic database concurrency locks, server-authoritative pricing, cryptographic Razorpay payment verification, automated background inventory reconciliation, timezone-aware deadline scheduling, and server-generated PDF tax invoicing.

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Architecture Rationale](#2-tech-stack--architecture-rationale)
3. [System Architecture](#3-system-architecture)
4. [Project Folder Structure](#4-project-folder-structure)
5. [Complete Application Workflows](#5-complete-application-workflows)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Database Design & Data Models](#7-database-design--data-models)
8. [API Architecture & Endpoint Reference](#8-api-architecture--endpoint-reference)
9. [Concurrency Management & Race-Condition Hardening](#9-concurrency-management--race-condition-hardening)
10. [Transactions & Data Consistency](#10-transactions--data-consistency)
11. [Error Handling Strategy](#11-error-handling-strategy)
12. [Validation & Security Hardening](#12-validation--security-hardening)
13. [Payment System (Razorpay Integration)](#13-payment-system-razorpay-integration)
14. [Email & Notification Infrastructure](#14-email--notification-infrastructure)
15. [Frontend Architecture (React 19)](#15-frontend-architecture-react-19)
16. [Backend Architecture (Express 5 & Mongoose 8)](#16-backend-architecture-express-5--mongoose-8)
17. [Important Technical Concepts Used](#17-important-technical-concepts-used)
18. [End-to-End Request Lifecycle](#18-end-to-end-request-lifecycle)
19. [Important Architectural & Design Decisions](#19-important-architectural--design-decisions)
20. [Edge Cases & Failure Recovery](#20-edge-cases--failure-recovery)
21. [Installation & Local Setup](#21-installation--local-setup)
22. [Running the Application](#22-running-the-application)
23. [Automated Test Suite & Concurrency Benchmarks](#23-automated-test-suite--concurrency-benchmarks)
24. [Deployment Infrastructure](#24-deployment-infrastructure)
25. [Performance Considerations](#25-performance-considerations)
26. [Scalability Analysis (10 → 100K Users)](#26-scalability-analysis-10--100k-users)
27. [🎯 Interview Talking Points & Technical Q&A](#27--interview-talking-points--technical-qa)
28. [Known Limitations](#28-known-limitations)
29. [Future Roadmap & Improvements](#29-future-roadmap--improvements)
30. [Final Architecture Summary](#30-final-architecture-summary)

---

# 1. Project Overview

### What the Project Does
The **Car Rental Platform** is an enterprise-grade vehicle booking and fleet management application. It bridges individual car renters looking for short-term or long-term mobility solutions with vehicle owners who monetize their fleet.

### Real-World Problems It Solves
1. **The Double-Booking Race Condition**: In distributed booking portals, when two users attempt to reserve the same vehicle for overlapping dates at the exact same millisecond, standard check-then-insert flows create duplicate conflicting reservations. This system eliminates that vulnerability using atomic MongoDB reservation slots combined with ACID transactions.
2. **Client-Side Financial Tampering**: Malicious actors frequently alter client-side cart totals before calling payment gateways. Here, pricing calculation is strictly server-authoritative; client prices are completely discarded.
3. **Ghost Bookings & Inventory Lockup**: In "Pay Later" models, users reserve cars and never pay, starving inventory from paying customers. This platform implements strict timezone-aware payment deadlines and an automated background cancellation daemon that releases inventory back to the fleet when deadlines elapse.
4. **Untrusted Third-Party State**: Payment confirmations are never finalized via frontend callbacks alone. Cryptographic HMAC-SHA256 signatures are evaluated server-side before confirming transactions.
5. **Decoupled Notification Resilience**: Third-party SMTP failures never abort valid database reservations; emails and invoices run outside transaction rollback boundaries while maintaining persistent audit logs.

### Key Features
* **Role-Based Access Control (RBAC)**: Dual-role accounts (`user`, `owner`, `admin`) allowing customers to rent cars and owners to list vehicles, manage reservations, and track monthly/total revenue.
* **Dual Payment Flows**:
  * **Pay Now**: Immediate settlement via Razorpay checkout with server-side HMAC-SHA256 signature verification.
  * **Pay Later**: Lock inventory with an automated payment deadline (23:59:59 of the day prior to pickup); settle anytime before the deadline.
* **Automated Cancellation Scheduler**: Background daemon executing every 5 minutes to sweep unpaid reservations whose deadlines have passed, releasing car slots atomically.
* **Server-Generated PDF Tax Invoices**: Generates production-quality A4 tax receipts with invoice references, rental itineraries, and price breakdowns using `pdfkit`.
* **Idempotent API Operations**: Guarded against network retries and duplicate button clicks via `Idempotency-Key` headers and database unique sparse indexes.
* **ImageKit CDN Integration**: Auto-compression, WebP transformation, and responsive delivery for owner-uploaded vehicle photographs.
* **Security & Auditing**: Tiered rate limiting, Joi schema validation, Winston structured JSON file/console logging, and SHA-256 hashed single-use password reset tokens.

---

# 2. Tech Stack & Architecture Rationale

| Category | Technology | Version | Architectural Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React** | `^19.1.1` | Concurrent rendering, modern hooks (`useContext`, `useState`, `useEffect`), high-speed state synchronization. |
| **Build Tool** | **Vite** | `^7.3.3` | Instant HMR, Rollup-based tree-shaking production builds under 4 seconds. |
| **Styling & Design** | **Tailwind CSS** | `^4.1.16` | Modern CSS-first utility architecture; zero runtime overhead; uniform custom design system (`#3D4C27` green, `#FAF7F0` cream). |
| **Client Routing** | **React Router DOM** | `^7.9.4` | Declarative routing; utilizes `HashRouter` to prevent 404s on static hosting (Vercel/Render) without server rewrite dependencies. |
| **OAuth Integration** | **@react-oauth/google** | `^0.12.2` | Streamlined Google Sign-In button rendering and ID token capture. |
| **HTTP Client** | **Axios** | `^1.13.2` | Centralized instance configuration, Bearer token interceptors, and typed response handling. |
| **Date Arithmetic** | **date-fns** | `^4.1.0` | Lightweight, immutable date calculation (`differenceInDays`, `isSameDay`) without bloated legacy Moment.js bundles. |
| **Backend Runtime** | **Node.js (ESM)** | `Node 18+` | Native ECMAScript Modules (`import`/`export`), non-blocking asynchronous event loop. |
| **Web Framework** | **Express** | `^5.2.1` | Next-generation Express with native async error routing, robust middleware pipeline, and route modularization. |
| **Database ODM** | **Mongoose** | `^8.24.1` | Schema modeling, automated casting, population hooks, compound indexing, and ACID transaction sessions. |
| **Database Engine** | **MongoDB** | `^7.5.0` | Distributed document database supporting single-document atomic mutations (`$push`, `$pull`, `$not`) and multi-document ACID transactions. |
| **Authentication** | **JWT & bcrypt** | `jwt 9.0`, `bcrypt 6.0` | Stateless authentication with 7-day HMAC-SHA256 signed tokens; 10-round salted password hashing. |
| **Payment Gateway** | **Razorpay Node SDK** | `^2.9.6` | Industry standard payment gateway for Indian currency (INR), supporting UPI, Cards, NetBanking, and HMAC signature validation. |
| **Document Generation**| **PDFKit** | `^0.20.2` | Low-overhead vector-based streaming PDF generation on the server; zero external headless browser dependencies (like Puppeteer). |
| **Email Transport** | **Nodemailer** | `^8.0.7` | SMTP transport configured with Gmail App Password authentication and lazy proxy initialization. |
| **Image Optimization**| **ImageKit SDK** | `^6.0.0` | Cloud media storage with real-time on-the-fly transformations (WebP format, auto quality, width scaling). |
| **Validation** | **Joi** | `^18.0.2` | Strict schema validation guarding API boundaries against malformed payloads. |
| **Rate Limiting** | **express-rate-limit** | `^8.7.0` | Protects sensitive auth, booking, and payment routes against brute-force attacks and volumetric DoS. |
| **Logging** | **Winston** | `^3.19.0` | Structured JSON log rotation to local files (`logs/app.log`) and standard console output. |

---

# 3. System Architecture

```text
                               ┌────────────────────────────────────────────────┐
                               │                 CLIENT TIER                    │
                               │          React 19 + Vite (HashRouter)          │
                               │   AppContext • Axios Interceptors • Tailwind   │
                               └───────────────────────┬────────────────────────┘
                                                       │ HTTPS JSON Requests
                                                       │ Bearer JWT / Idempotency-Key
                                                       ▼
                               ┌────────────────────────────────────────────────┐
                               │                API GATEWAY TIER                │
                               │       Express 5.x REST API (Port 2005)         │
                               │   Trust Proxy • CORS Guard • Request Logger    │
                               └───────────────────────┬────────────────────────┘
                                                       │
                                   ┌───────────────────┴───────────────────┐
                                   ▼                                       ▼
                       ┌──────────────────────┐                ┌──────────────────────┐
                       │  Rate Limiting Tier  │                │ Authentication Tier  │
                       │  API: 1000/15min     │                │ JWT Bearer Verify    │
                       │  Auth: 200/15min     │                │ Google ID Token Auth │
                       │  Booking: 20/15min   │                │ Role Guard (RBAC)    │
                       │  Payment: 10/15min   │                │ Joi Input Validation │
                       └───────────┬──────────┘                └───────────┬──────────┘
                                   └───────────────────┬───────────────────┘
                                                       │ Validated & Authorized
                                                       ▼
                               ┌────────────────────────────────────────────────┐
                               │             BUSINESS LOGIC CONTROLLERS         │
                               │   booking.js • user.js • owner.js • review.js  │
                               └───────┬──────────────┬──────────────┬──────────┘
                                       │              │              │
                   ┌───────────────────┘              │              └──────────────────┐
                   ▼                                  ▼                                 ▼
       ┌────────────────────────┐         ┌────────────────────────┐        ┌────────────────────────┐
       │   EXTERNAL SERVICES    │         │  BACKGROUND SCHEDULER  │        │   ATOMIC DB LAYER      │
       │ • Razorpay API (Orders)│         │ • cancellationService  │        │ • findOneAndUpdate     │
       │ • ImageKit CDN Uploads │         │ • Periodic Sweep (5m)  │        │ • ACID Transactions    │
       │ • Gmail SMTP Transport │         │ • Timezone Arithmetic  │        │ • withRetry Backoff    │
       │ • PDFKit Vector Engine │         │ • Slot Release Guard   │        │ • Compound Indexes     │
       └────────────────────────┘         └────────────────────────┘        └───────────┬────────────┘
                                                                                        │
                                                                                        ▼
                                                                            ┌────────────────────────┐
                                                                            │     MONGODB ATLAS      │
                                                                            │ Replica Set (ACID)     │
                                                                            │ users • cars • bookings│
                                                                            │ payments • notifs      │
                                                                            └────────────────────────┘
```

---

# 4. Project Folder Structure

```text
Car_Rental/
├── client/                                 # Frontend SPA (React 19 + Vite)
│   ├── public/                             # Static public assets
│   │   ├── car-illustration.jpg            # Scenic cartoon illustration for auth modal
│   │   └── car-illustration.png            # High-res vector artwork fallback
│   ├── src/
│   │   ├── assets/                         # SVG icons and visual assets
│   │   ├── components/                     # Reusable presentation components
│   │   │   ├── BackButton.jsx              # Universal dynamic history back button
│   │   │   ├── Banner.jsx                  # Promotional road-trip CTA banner
│   │   │   ├── CarCards.jsx                # Fleet catalog card display
│   │   │   ├── ForgotPassword.jsx          # Dedicated forgot password reset request UI
│   │   │   ├── Hero.jsx                    # Homepage hero search form (Location/Dates)
│   │   │   ├── LoginPage.jsx               # Universal modal + standalone route auth card
│   │   │   ├── Navbar.jsx                  # Header with active links & user profile menu
│   │   │   ├── ResetPassword.jsx           # Token-authenticated password reset UI
│   │   │   └── owner/                      # Owner dashboard sub-components
│   │   │       ├── Navbarowner.jsx         # Dedicated owner navigation
│   │   │       └── Sidebar.jsx             # Owner sidebar navigation
│   │   ├── context/
│   │   │   └── AppContext.jsx              # Global React Context (User, Auth, Cars, Axios)
│   │   ├── pages/                          # Primary view routes
│   │   │   ├── BookingDetails.jsx          # Individual booking view + Pay Now settlement + PDF
│   │   │   ├── Car.jsx                     # Search catalog & multi-criteria filter view
│   │   │   ├── CarDetails.jsx              # Vehicle specification & date picker calendar
│   │   │   ├── Checkout.jsx                # Multi-step checkout & Razorpay payment orchestrator
│   │   │   ├── Confirmation.jsx            # Post-reservation success confirmation
│   │   │   ├── Home.jsx                    # Landing page orchestrator
│   │   │   ├── MyBooking.jsx               # Customer booking history & status management
│   │   │   ├── Review.jsx                  # Customer testimonial submission & review feed
│   │   │   └── owner/                      # Owner portal views
│   │   │       ├── AddCar.jsx              # Vehicle listing form with image upload
│   │   │       ├── Dashboard.jsx           # Revenue metrics, booking counts, charts
│   │   │       ├── Layout.jsx              # Nested owner routing layout
│   │   │       ├── ManageBooking.jsx       # Booking approval, status, & dispute controls
│   │   │       ├── ManageCars.jsx          # Fleet availability toggle and vehicle deletion
│   │   │       └── Profile.jsx             # Owner profile and contact number updater
│   │   ├── App.jsx                         # Main client routing declaration
│   │   └── main.jsx                        # React root mount, GoogleOAuthProvider, HashRouter
│   ├── package.json                        # Client dependencies & build scripts
│   └── vite.config.js                      # Vite configuration & Tailwind plugin integration
│
├── server/                                 # Backend REST API (Node.js Express ESM)
│   ├── config/                             # External service configurations
│   │   ├── imagekit.js                     # ImageKit CDN SDK client instance
│   │   ├── logger.js                       # Winston logger configuration (console + app.log)
│   │   ├── nodemailer.js                   # Lazy-initialized Gmail SMTP proxy & verifyTransporter
│   │   └── razorpay.js                     # Razorpay payment gateway client instance
│   ├── controllers/                        # Business logic controllers
│   │   ├── booking.js                      # Atomic booking, payments, receipts, availability
│   │   ├── owner.js                        # Car listing, dashboard analytics, fleet management
│   │   ├── review.js                       # Customer reviews and star ratings
│   │   └── user.js                         # Register, login, Google auth, password reset
│   ├── middlewares/                        # Express middleware
│   │   ├── auth.js                         # Joi validation schemas and JWT protect middleware
│   │   ├── multer.js                       # Disk storage file upload handler for vehicle images
│   │   └── rateLimiter.js                  # Tiered rate limits (API, Auth, Booking, Payment)
│   ├── models/                             # Mongoose database models
│   │   ├── Booking.js                      # Booking schema with deadline & idempotency index
│   │   ├── Car.js                          # Vehicle fleet schema with embedded reservedSlots
│   │   ├── Notification.js                 # In-app and email notification tracking schema
│   │   ├── Payment.js                      # Financial transaction ledger schema
│   │   ├── Review.js                       # Rating and user testimonial schema
│   │   └── user.js                         # User account schema with reset tokens & roles
│   ├── routes/                             # Express route declarations
│   │   ├── booking.js                      # Reservation, order creation, receipt download endpoints
│   │   ├── notification.js                 # Notification retrieval and read receipt routes
│   │   ├── owner.js                        # Fleet owner operations and analytics routes
│   │   ├── review.js                       # Public and authenticated review routes
│   │   └── user.js                         # Authentication, profile, and password reset routes
│   ├── services/                           # Reusable domain services
│   │   ├── cancellationService.js          # Auto-cancellation scheduler and slot reclamation
│   │   ├── notificationService.js          # Unified in-app and email dispatch engine
│   │   └── pdfService.js                   # PDFKit vector invoice and receipt generator
│   ├── utils/                              # Utility helpers
│   │   └── deadline.js                     # Timezone-aware date calculations (Asia/Kolkata)
│   ├── logs/                               # Winston log storage directory
│   │   └── app.log                         # Continuous JSON log stream
│   ├── server.js                           # Application entry point, DB connect, daemon init
│   ├── stress-test.js                      # 50-request concurrent booking race benchmark
│   ├── test_payment_audit.js               # Comprehensive 28-point Razorpay verification audit
│   ├── test_email.js                       # Standalone Nodemailer SMTP diagnostic utility
│   ├── test-auth-flow.js                   # Script verifying registration, login, and JWT logic
│   └── package.json                        # Server dependencies and runner scripts
│
├── CONCURRENCY.md                          # In-depth technical note on reservation slot locking
├── render.yaml                             # Render static site deployment specification
└── README.md                               # Project documentation
```

---

# 5. Complete Application Workflows

### 5.1 Registration Workflow
1. User enters name, email, password, and optional role (`user` or `owner`).
2. If `owner` is selected, `phone_no` is mandatory.
3. Payload is validated by `signupValidation` via Joi.
4. Controller normalizes email via `email.toLowerCase().trim()`.
5. Database is queried for existing accounts. If exists, returns generic message.
6. Password hashed with bcrypt using 10 salt rounds.
7. User document saved to MongoDB; signed JWT (7 days) returned with sanitized user profile.

### 5.2 Login Workflow
1. User provides email and password.
2. `LoginValidation` checks payload format.
3. User queried by normalized email.
4. If account was registered via Google Sign-In (`password` is undefined), returns explicit message directing user to click "Continue with Google".
5. Validates password via `bcrypt.compare()`.
6. Generates 7-day JWT; sets common Axios authorization headers in React state.

### 5.3 Google OAuth Workflow
1. Client renders Google Sign-In button using `@react-oauth/google`.
2. Upon user consent, Google returns an `id_token` JWT.
3. Client dispatches token to `POST /user/google-login`.
4. Backend verifies signature via Google's official `OAuth2Client.verifyIdToken()` with `process.env.GOOGLE_CLIENT_ID`.
5. Extracts sub (Google ID), email, name, and profile picture.
6. If account does not exist, atomically creates account with empty password; if account exists without `googleId`, links account.
7. Signs application JWT and returns authenticated session.

### 5.4 Forgot & Reset Password Workflow
1. User enters email at `/forgot-password`.
2. Backend queries user. **Anti-Enumeration**: If email is not found, it still returns HTTP 200 with *"If an account with that email exists, a password reset link has been sent."*
3. Generates 32-byte cryptographically secure random token (`crypto.randomBytes(32).toString('hex')`).
4. Computes SHA-256 hash of token and stores only the hash in `user.resetPasswordToken` with 15-minute expiration (`Date.now() + 15*60*1000`).
5. Transmits raw token inside email reset link: `${CLIENT_URL}/reset-password/${rawToken}`.
6. User clicks link and submits new password (minimum 8 characters).
7. Backend hashes incoming token with SHA-256 and queries for matching unexpired token (`$gt: Date.now()`).
8. Updates password, wipes reset token fields, and marks token single-use.

### 5.5 Vehicle Search & Booking Workflow
1. **Search**: Customer selects Pickup Location, Pickup Date, and Return Date on Homepage.
2. **Availability Filtering**: `POST /bookings/check-availability` queries all vehicles in the target city and eliminates those whose `reservedSlots` overlap with the requested dates.
3. **Price Calculation**: User proceeds to vehicle details. `calculateRentalPricing()` calculates `days = Math.ceil((returnDate - pickupDate) / 1000*60*60*24)` and determines authoritative total `days * car.pricePerDay`.
4. **Checkout Route**: User chooses **Pay Now** (Online) or **Pay Later**.

### 5.6 Pay Now Flow (Immediate Online Settlement)
1. Client requests `POST /bookings/payment` with vehicle ID and dates.
2. Backend recalculates authoritative price, verifies slot availability, and creates a Razorpay Order in paise (`amount * 100`).
3. Frontend opens Razorpay Checkout modal with `order_id`.
4. User completes payment via UPI / Card.
5. Razorpay returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
6. Client posts verification payload to `POST /bookings/create`.
7. Backend computes HMAC-SHA256 of `order_id|payment_id` with `RAZORPAY_KEY_SECRET` and verifies match.
8. Initiates MongoDB ACID transaction with retry logic.
9. Atomically pushes dates into `Car.reservedSlots`, creates `Booking` record with `paymentStatus: "paid"`, and creates `Payment` ledger entry.
10. Generates PDF receipt via PDFKit and sends booking confirmation email with PDF attached.

### 5.7 Pay Later Flow & Automated Background Cancellation
1. Client selects **Pay Later**; calls `POST /bookings/create` with `paymentType: "PAY_LATER"`.
2. Backend calculates `paymentDeadline = 23:59:59.999` of the day prior to pickup in `Asia/Kolkata` timezone.
3. Atomically reserves car slot and records booking with `status: "confirmed"` and `paymentStatus: "pending"`.
4. **Post-Booking Settlement**:
   * User can open `/my-booking` or `/booking/:id` anytime before deadline and click **Pay Now**.
   * Calls `POST /bookings/:id/pay-order` to generate fresh Razorpay order.
   * Calls `POST /bookings/:id/verify-payment` to verify signature and atomically transition `paymentStatus: "paid"`.
5. **Automatic Cancellation**:
   * If user fails to pay and the deadline elapses (or pickup date starts), the background daemon (`cancellationService`) runs every 5 minutes.
   * Atomically flips status to `cancelled` (`cancelledBy: "system"`, `cancellationReason: "Payment deadline expired"`).
   * Pulls the slot out of `Car.reservedSlots`, instantly restoring vehicle availability to the public catalog.
   * Dispatches cancellation notice email to customer.

---

# 6. Authentication & Authorization

### Architecture Breakdown
Authentication is stateless and based on JSON Web Tokens (JWT) stored in client `localStorage` and dispatched via the standard HTTP `Authorization: Bearer <token>` header.

```text
Incoming Request
  │
  ▼
protect Middleware (server/middlewares/auth.js)
  │
  ├─► Check Authorization header exists? ──No──► 401 "Not Authorized, please login"
  │
  ├─► Extract token (strip "Bearer ")
  │
  ├─► jwt.verify(token, JWT_SECRET) ──Invalid/Expired──► 401 "Session expired or invalid token"
  │
  ├─► Usermodel.findById(decoded._id).select("-password")
  │        │
  │        └──User deleted in DB? ──Yes──► 401 "User account not found"
  │
  ▼
req.user = userDoc (hydrated without password hash)
  │
  ▼
Next Handler (Controller / Role Guard)
```

### Role-Based Authorization
The `User` schema designates three distinct roles:
* `user`: Standard customer role. Can browse cars, create bookings, make payments, download personal receipts, write reviews.
* `owner`: Vehicle host role. Can list new vehicles with images, toggle car availability, delete cars, inspect vehicle reservation rosters, and access Owner Dashboard revenue metrics.
* `admin`: Platform administrative authority. Can inspect all bookings, cancel disputed reservations, and access all receipts.

---

# 7. Database Design & Data Models

### Entity Relationship Overview

```text
 ┌─────────────────┐           1:N           ┌──────────────────┐
 │      User       │────────────────────────►│       Car        │
 │─────────────────│                         │──────────────────│
 │ _id (PK)        │                         │ _id (PK)         │
 │ name            │                         │ owner (FK->User) │
 │ email (UNIQUE)  │                         │ brand, model     │
 │ password        │                         │ pricePerDay      │
 │ googleId        │                         │ location         │
 │ role            │                         │ isAvailable      │
 │ phone_no        │                         │ reservedSlots[]  │
 └────────┬────────┘                         └────────┬─────────┘
          │                                           │
          │ 1:N                                       │ 1:N
          ▼                                           ▼
 ┌─────────────────┐       1:1 Rel           ┌──────────────────┐
 │     Payment     │◄────────────────────────│     Booking      │
 │─────────────────│                         │──────────────────│
 │ _id (PK)        │                         │ _id (PK)         │
 │ booking (FK)    │                         │ car (FK->Car)    │
 │ user (FK->User) │                         │ user (FK->User)  │
 │ orderId         │                         │ owner (FK->User) │
 │ paymentId       │                         │ pickupDate       │
 │ amount          │                         │ returnDate       │
 │ status          │                         │ price            │
 │ method          │                         │ paymentStatus    │
 └─────────────────┘                         │ paymentDeadline  │
                                             │ idempotencyKey   │
                                             └────────┬─────────┘
                                                      │
                                                      │ 1:N
                                                      ▼
                                             ┌──────────────────┐
                                             │   Notification   │
                                             │──────────────────│
                                             │ _id (PK)         │
                                             │ user (FK->User)  │
                                             │ booking (FK)     │
                                             │ type, title, msg │
                                             │ status (SENT...) │
                                             └──────────────────┘
```

### Schema Definitions & Compound Indexes

#### `User` (`server/models/user.js`)
* `name` (String, required)
* `email` (String, required, unique, lowercase)
* `password` (String, required if not Google auth)
* `googleId` (String, sparse, unique)
* `role` (String, enum: `["owner", "user", "admin"]`, default: `"user"`)
* `phone_no` (String, required for owners)
* `resetPasswordToken` (String, indexed)
* `resetPasswordExpires` (Date)

#### `Car` (`server/models/Car.js`)
* `owner` (ObjectId -> `User`)
* `brand`, `model`, `number`, `category`, `fuel_type`, `transmission`, `location`, `description`
* `year`, `seating_capacity`, `pricePerDay`, `phone_no`, `ownerName`
* `isAvailable` (Boolean, default: `true`)
* `reservedSlots`: Array of objects:
  * `pickupDate` (Date)
  * `returnDate` (Date)
  * `bookingId` (ObjectId -> `Booking`)

#### `Booking` (`server/models/Booking.js`)
* `car` (ObjectId -> `Car`, required)
* `user` (ObjectId -> `User`, required)
* `owner` (ObjectId -> `User`, required)
* `pickupDate` (Date, required)
* `returnDate` (Date, required)
* `price` (Number, required)
* `status` (enum: `["pending", "pending_payment", "confirmed", "active", "completed", "cancelled", "expired"]`)
* `paymentId` (String)
* `paymentStatus` (enum: `["pending", "processing", "paid", "failed"]`)
* `paymentDeadline` (Date)
* `cancellationReason` (String), `cancelledAt` (Date), `cancelledBy` (`"user"`, `"owner"`, `"admin"`, `"system"`)
* `receiptGenerated` (Boolean), `receiptGeneratedAt` (Date)
* `idempotencyKey` (String, unique, sparse)
* **Compound Indexes**:
  * `{ car: 1, pickupDate: 1, returnDate: 1, status: 1 }` — High-speed catalog search & collision checks
  * `{ user: 1, createdAt: -1 }` — Fast user booking history resolution
  * `{ owner: 1, createdAt: -1 }` — Fast owner reservation roster queries
  * `{ status: 1, paymentStatus: 1, paymentDeadline: 1 }` — Background auto-cancellation daemon index

#### `Payment` (`server/models/Payment.js`)
* `booking` (ObjectId -> `Booking`, required)
* `user` (ObjectId -> `User`, required)
* `provider` (String, default: `"razorpay"`)
* `orderId` (String, required, indexed)
* `paymentId` (String, indexed)
* `amount` (Number, required)
* `currency` (String, default: `"INR"`)
* `status` (enum: `["CREATED", "PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"]`)
* `method` (String), `paidAt` (Date), `metadata` (Mixed)

---

# 8. API Architecture & Endpoint Reference

### Base URL: `/` (Default Local Port: `2005`)

| Method | Endpoint | Description | Rate Limiter | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/user/register` | Register new user or car owner | `authLimiter` (200/15m) | None |
| `POST` | `/user/login` | Email/password login with JWT generation | `authLimiter` (200/15m) | None |
| `POST` | `/user/google-login` | Verify Google ID token & issue session JWT | `authLimiter` (200/15m) | None |
| `POST` | `/user/forgot-password`| Request SHA-256 hashed password reset link | `authLimiter` (200/15m) | None |
| `POST` | `/user/reset-password/:token` | Complete password reset using secure token | `authLimiter` (200/15m) | None |
| `GET` | `/user/data` | Retrieve authenticated user profile | `apiLimiter` (1000/15m) | Bearer Token |
| `GET` | `/user/cars` | Get all publicly available cars | `apiLimiter` (1000/15m) | None |
| `POST` | `/bookings/check-availability` | Check cars available for location & dates | `bookingLimiter` (20/15m) | None |
| `POST` | `/bookings/payment` | Initiate Razorpay order with server-calculated price | `paymentLimiter` (10/15m) | Bearer Token |
| `POST` | `/bookings/create` | Atomically reserve car and confirm booking | `bookingLimiter` (20/15m) | Bearer Token |
| `GET` | `/bookings/user` | Fetch booking history for logged-in user | `apiLimiter` (1000/15m) | Bearer Token |
| `GET` | `/bookings/car/:id` | Fetch confirmed booking dates for a car | `apiLimiter` (1000/15m) | Bearer Token |
| `GET` | `/bookings/owner` | Fetch all bookings for cars owned by user | `apiLimiter` (1000/15m) | Bearer Token (Owner) |
| `POST` | `/bookings/change-status` | Owner updates booking status (confirmed, cancelled) | `apiLimiter` (1000/15m) | Bearer Token (Owner) |
| `POST` | `/bookings/delete-booking`| Safe cancellation of a reservation | `apiLimiter` (1000/15m) | Bearer Token |
| `GET` | `/bookings/:id/receipt` | Generate & download PDF tax invoice | `bookingLimiter` (20/15m) | Bearer Token |
| `POST` | `/bookings/:id/pay-order`| Generate Razorpay order for unpaid Pay Later booking| `paymentLimiter` (10/15m) | Bearer Token |
| `POST` | `/bookings/:id/verify-payment`| Verify payment & finalize Pay Later booking | `paymentLimiter` (10/15m) | Bearer Token |
| `POST` | `/bookings/cleanup-expired`| Trigger auto-cancellation sweep (cron webhook) | `apiLimiter` (1000/15m) | Bearer Token |
| `POST` | `/owner/change-role` | Upgrade user account to Car Owner role | `apiLimiter` (1000/15m) | Bearer Token |
| `POST` | `/owner/add-car` | Publish car with ImageKit image upload | `apiLimiter` (1000/15m) | Bearer Token (Owner) |
| `GET` | `/owner/cars` | Get all cars listed by logged-in owner | `apiLimiter` (1000/15m) | Bearer Token (Owner) |
| `POST` | `/owner/toggle-car` | Toggle car active availability status | `apiLimiter` (1000/15m) | Bearer Token (Owner) |
| `POST` | `/owner/delete-car` | Soft-delete / decommission car from fleet | `apiLimiter` (1000/15m) | Bearer Token (Owner) |
| `GET` | `/owner/dashboard` | Get owner revenue, booking statistics, counts | `apiLimiter` (1000/15m) | Bearer Token (Owner) |
| `GET` | `/notifications` | Get user notifications list | `apiLimiter` (1000/15m) | Bearer Token |
| `GET` | `/notifications/unread` | Get unread notification count | `apiLimiter` (1000/15m) | Bearer Token |
| `PATCH`| `/notifications/:id/read` | Mark single notification as read | `apiLimiter` (1000/15m) | Bearer Token |
| `PATCH`| `/notifications/read-all` | Mark all notifications as read | `apiLimiter` (1000/15m) | Bearer Token |
| `POST` | `/review/add-review` | Submit star rating and written testimonial | `apiLimiter` (1000/15m) | Bearer Token |
| `GET` | `/review/get-review` | Get all public platform reviews | `apiLimiter` (1000/15m) | None |

---

# 9. Concurrency Management & Race-Condition Hardening

### The Core Concurrency Vulnerability
In a standard booking system, availability check and booking insertion are separated:
```javascript
// NAIVE FLAWED PATTERN:
const isFree = await checkAvailability(carId, dates);
if (isFree) {
    await Booking.create({ car: carId, dates }); // <-- RACE CONDITION HERE
}
```
Under concurrent load (e.g., flash sales, festivals), if 50 users submit overlapping booking requests at the same millisecond, all 50 threads execute `checkAvailability` simultaneously, all 50 see 0 bookings, and all 50 proceed to create conflicting bookings for a single physical car.

### The Multi-Tier Solution Implemented

```text
Concurrent Requests (50 simultaneous threads)
  │
  ├─► Thread 1 ──┐
  ├─► Thread 2 ──┼─► MongoDB Engine (Single Document Lock on Car document)
  ├─► ...      ──┤
  └─► Thread 50 ─┘
                   │
                   ▼
  Car.findOneAndUpdate({
      _id: carId,
      reservedSlots: {
          $not: { $elemMatch: { pickupDate: { $lt: returnDate }, returnDate: { $gt: pickupDate } } }
      }
  }, {
      $push: { reservedSlots: { pickupDate, returnDate, bookingId } }
  })
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
   MATCHES (1 Thread)    FAILS / NULL (49 Threads)
        │                     │
        ▼                     ▼
  Slot Appended         Transaction Aborts
  Booking Created       Immediate 400 Rejection
  HTTP 200 OK           "Car is not available for selected dates"
```

1. **Atomic In-Document Slot Reservation (`findOneAndUpdate`)**:
   Instead of querying a separate collection, the `Car` schema maintains an array of `reservedSlots`. Using MongoDB's single-document atomic update guarantee, we query with `$not: { $elemMatch: ... }`. If an overlapping slot already exists, the match returns `null` immediately. Only **one** thread can mutate the document.
2. **MongoDB ACID Transactions (`session.startTransaction()`)**:
   Reservation requires mutating `Car.reservedSlots`, creating a `Booking` document, and creating a `Payment` ledger record. These operations run inside a single replica set transaction. If any step fails, `session.abortTransaction()` automatically undoes the slot reservation without manual cleanup.
3. **Exponential Backoff Retry Wrapper (`withRetry`)**:
   Under heavy write concurrency, MongoDB transactions may throw `TransientTransactionError` or write conflict error code `112` or `251`. Our `withRetry` utility catches these specific transient engine codes and retries the entire transaction up to 3 times with randomized exponential backoff:
   $$\text{Backoff} = 2^i \times 100\text{ms} + \text{Random}(0, 50\text{ms})$$
4. **HTTP `Idempotency-Key` Header**:
   Clients transmit a unique UUID header `Idempotency-Key`. The `Booking` schema enforces a unique, sparse index on `idempotencyKey`. If a user double-clicks the submission button, the second insert causes a MongoDB duplicate key error (`11000`). The controller safely catches this and returns the existing booking record with `{ idempotent: true }` without duplicating financial or slot allocations.

---

# 10. Transactions & Data Consistency

### Transaction Lifecycle in `createBooking`
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
    // Step 1: Atomically lock vehicle inventory slot
    const updatedCar = await Car.findOneAndUpdate(..., { session });
    if (!updatedCar) throw new Error("Car is not available");

    // Step 2: Create Booking record
    const booking = await Booking.create([...], { session });

    // Step 3: Create Payment ledger record
    await Payment.create([...], { session });

    // Step 4: Commit both operations atomically
    await session.commitTransaction();
} catch (error) {
    // Rollback changes on any failure
    await session.abortTransaction();
    throw error;
} finally {
    session.endSession();
}
```

### Side-Effect Decoupling (Crucial Reliability Pattern)
Third-party network dependencies (generating PDFKit buffers, uploading to S3/ImageKit, communicating with Gmail SMTP) are **intentionally executed outside the database transaction boundary**:
* Database locks are released in milliseconds.
* If Nodemailer times out or Gmail credentials fail, the database transaction is already safely committed.
* An email failure marks the internal `Notification` as `FAILED` without cancelling the customer's legitimate car reservation.

---

# 11. Error Handling Strategy

### Backend Error Normalization
* **Standard Response Shape**: Every error returns `{ success: false, message: "Descriptive error" }`.
* **HTTP Status Code Discipline**:
  * `400 Bad Request`: Validation failure (Joi schema error, invalid dates, missing Razorpay signature).
  * `401 Unauthorized`: Missing, expired, or corrupted JWT token.
  * `403 Forbidden`: Authenticated user lacks permission (e.g. non-owner attempting to view owner dashboard).
  * `404 Not Found`: Entity missing (booking ID, car ID, user profile).
  * `409 Conflict`: Business rule violation (date collision, vehicle already booked, payment deadline expired).
  * `500 Internal Server Error`: Unhandled server runtime failure.
* **Structured Logging with Winston**:
  All errors are captured in `logs/app.log` and console with context (e.g., `logger.error("booking.verify_payment_failed", { error: error.message })`). Secrets and passwords are systematically excluded from logs.

---

# 12. Validation & Security Hardening

* **Password Security**: Passwords hashed using `bcrypt` with salt round cost factor 10. Raw passwords never stored or logged.
* **Timing-Safe Reset Tokens**: Password reset tokens are generated with 32 bytes of cryptographic entropy (`crypto.randomBytes(32)`). The raw token is sent to the user's email, while only its SHA-256 hash is persisted in the database, preventing token theft in case of database leakage.
* **Anti-Enumeration Protection**: The forgot-password endpoint returns an identical success message whether an email exists in the database or not.
* **Tiered Rate Limiting (`express-rate-limit`)**:
  * General API: 1000 requests / 15 min window
  * Authentication endpoints (`/login`, `/register`, `/forgot-password`): 200 requests / 15 min window
  * Booking creation endpoints: 20 requests / 15 min window
  * Payment initiation & verification endpoints: 10 requests / 15 min window
* **Trust Proxy**: Enabled via `app.set('trust proxy', 1)` to guarantee accurate IP tracking behind reverse proxies (Vercel, Render, Cloudflare).
* **CORS Whitelisting**: Strict origin whitelisting allowing only verified production domains (`https://car-rental-mu-ashy.vercel.app`) and designated local development ports (`5173`, `5174`, `5175`).

---

# 13. Payment System (Razorpay Integration)

### Sequence Diagram: Pay Now Flow

```text
User                 Frontend (React)         Backend (Express)            Razorpay API
 │                          │                         │                          │
 │── Click "Pay Now" ──────►│                         │                          │
 │                          │── POST /bookings/payment ─────────────────────────►│
 │                          │   (carId, dates)        │                          │
 │                          │                         │── Authoritative Price    │
 │                          │                         │   Calculation & Check    │
 │                          │                         │── Create Order ─────────►│
 │                          │                         │◄─ Return order_id ───────│
 │                          │◄─ Return order_id, amount                          │
 │                          │                                                    │
 │                          │── Open Razorpay Modal ───► Payment Gateway UI      │
 │                          │                            │                       │
 │◄─ Complete Payment ──────┼────────────────────────────┘                       │
 │   (UPI / Card)           │                                                    │
 │                          │◄─ Returns: razorpay_payment_id, razorpay_signature │
 │                          │                                                    │
 │                          │── POST /bookings/create ──────────────────────────►│
 │                          │   (order_id, payment_id, signature, dates)         │
 │                          │                         │                          │
 │                          │                         │── Verify HMAC-SHA256     │
 │                          │                         │   Signature Matches?     │
 │                          │                         │── Start Mongo TX         │
 │                          │                         │   • Lock Car Slot        │
 │                          │                         │   • Create Booking       │
 │                          │                         │   • Create Payment Rec   │
 │                          │                         │── Commit Mongo TX        │
 │                          │                         │── Stream PDF Invoice     │
 │                          │                         │── Send Email (Async)     │
 │                          │◄─ Return Booking Confirmed                         │
 │◄─ Redirect to Confirmed ─│                                                    │
```

### Signature Verification Code Architecture
```javascript
const body = `${razorpay_order_id}|${razorpay_payment_id}`;
const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

if (expectedSignature !== razorpay_signature) {
    logger.error("payment.signature_mismatch", { razorpay_order_id, razorpay_payment_id });
    return res.status(400).json({ success: false, message: "Invalid payment signature." });
}
```

---

# 14. Email & Notification Infrastructure

### Lazy-Initialized SMTP Proxy (`server/config/nodemailer.js`)
In Node.js ES Modules, `import` statements are hoisted and evaluated before runtime statements. Standard module evaluation would read `process.env.EMAIL_USER` before `dotenv.config()` finishes.
To solve this, the transporter uses an **ES6 Proxy with a lazy getter**:
```javascript
let _transporter = null;
function getTransporter() {
    if (_transporter) return _transporter;
    _transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS?.replace(/\s+/g, "") // Automatically strips spaces from 16-char Gmail App Passwords
        }
    });
    return _transporter;
}

export default new Proxy({}, {
    get(_t, prop) {
        const t = getTransporter();
        const val = t[prop];
        return typeof val === 'function' ? val.bind(t) : val;
    }
});
```

### Automatic Startup Diagnostic
On backend startup, `verifyTransporter()` executes non-blocking connection verification (`transporter.verify()`), logging safe status messages without exposing credentials.

---

# 15. Frontend Architecture (React 19)

### Key Architectural Patterns
* **State Management (`AppContext.jsx`)**: Centralized React Context providing `user`, `token`, `isOwner`, `cars`, `pickupDate`, `returnDate`, and `showLogin` (global modal visibility).
* **Global Authentication Modal**: `LoginPage.jsx` operates dual-mode:
  1. As an inline route at `#/login`.
  2. As a global backdrop modal triggered anywhere in the app when an unauthorized user attempts to book a car (`showLogin: true`), featuring an explicit `✕` close button and backdrop dismissal.
* **Hash Routing (`HashRouter`)**: Uses URL hash fragments (`#/cars`, `#/my-booking`) to ensure 100% reliable deep-linking on static hosts (Vercel, GitHub Pages) without server rewrite rules.
* **Responsive Styling**: Built with Tailwind CSS 4 using mobile-first grid layouts, custom drop shadows, and brand palettes.

---

# 16. Backend Architecture (Express 5 & Mongoose 8)

### Architectural Separation of Concerns
1. **Config Layer (`server/config/`)**: Initializes external SDKs (ImageKit, Razorpay, Nodemailer, Winston).
2. **Middleware Layer (`server/middlewares/`)**: Executes cross-cutting concerns (Rate limiting, Multer file parsing, Joi schema validation, JWT verification).
3. **Route Layer (`server/routes/`)**: Maps HTTP verbs and endpoints to specific controller actions.
4. **Controller Layer (`server/controllers/`)**: Handles request parameters, initiates domain calculations, coordinates services, and responds with normalized JSON.
5. **Service Layer (`server/services/`)**: Isolated, testable domain modules (`cancellationService`, `pdfService`, `notificationService`).
6. **Data Layer (`server/models/`)**: Mongoose schemas enforcing database constraints, compound indexes, and typing.

---

# 17. Important Technical Concepts Used

1. **ACID Transactions**: Atomicity, Consistency, Isolation, Durability across multiple documents in MongoDB Replica Sets.
2. **Optimistic Locking & Atomic Operators**: Utilizing `$not: { $elemMatch: ... }` with single-document atomicity to eliminate race conditions.
3. **Server-Authoritative Pricing**: Enforcing calculation on the backend to prevent client-side cart tampering.
4. **Cryptographic HMAC Signatures**: Authenticating webhook and client payment receipts using SHA-256 keyed-hash message authentication codes.
5. **Idempotency**: Guaranteeing that duplicate network transmissions result in identical outcomes without duplicate resource creation.
6. **Anti-Enumeration Defense**: Hardening authentication endpoints against account harvesting via uniform timing and response messages.
7. **Lazy Proxy Pattern**: Deferring object instantiation until execution time to resolve ES Module environment variable race conditions.
8. **Timezone-Aware Scheduling**: Computing business deadlines relative to a fixed geographic timezone (`Asia/Kolkata`) regardless of server system clock.

---

# 18. End-to-End Request Lifecycle

### Lifecycle of `POST /bookings/create`

```text
1. Client Dispatch: Axios transmits payload + Authorization header + Idempotency-Key
       │
2. Express Engine: Passes through Winston HTTP request logging middleware
       │
3. Rate Limiter: bookingLimiter verifies client IP hasn't exceeded 20 req/15min
       │
4. Auth Middleware: protect strips Bearer token, verifies JWT, queries User document
       │
5. Controller Entry: calculateRentalPricing validates dates and calculates authoritative price
       │
6. Signature Check: If Online payment, crypto.createHmac verifies razorpay_signature
       │
7. Transaction Execution: withRetry executes session.startTransaction()
       ├─► Car.findOneAndUpdate (reserves slot atomically)
       ├─► Booking.create (creates booking record)
       └─► Payment.create (creates financial ledger record)
       │
8. Commit: session.commitTransaction() writes changes permanently to MongoDB
       │
9. Async Side-Effects: (Outside TX)
       ├─► pdfService.generateBookingReceipt streams A4 PDF binary
       ├─► notificationService sends in-app alert and dispatches Nodemailer email
       │
10. Response: HTTP 200 JSON returned to client; React updates UI and redirects to confirmation
```

---

# 19. Important Architectural & Design Decisions

### 1. Why Embedded `reservedSlots` in `Car` instead of querying `Booking`?
* **Problem**: Querying the `Booking` collection to check if dates overlap and then creating a record creates an unavoidable race condition window between the check and the insert.
* **Decision**: Embedding an array of reserved date ranges directly on the `Car` document enables MongoDB's atomic single-document update (`findOneAndUpdate`). The check and the lock happen in a single, indivisible database operation.

### 2. Why Server-Authoritative Pricing?
* **Problem**: Trusting client-calculated amounts allows malicious users to modify request bodies (e.g. paying ₹1 for a ₹10,000 luxury car rental).
* **Decision**: The backend queries `car.pricePerDay`, computes the date difference, and derives the exact amount. Any price sent by the client is discarded.

### 3. Why `HashRouter` instead of `BrowserRouter`?
* **Problem**: Single Page Applications using HTML5 `BrowserRouter` return 404 Not Found when users refresh deep URLs on static hosts like Vercel or Render unless complex URL rewrite rules are configured.
* **Decision**: `HashRouter` ensures 100% reliable routing out-of-the-box across all static hosting environments.

---

# 20. Edge Cases & Failure Recovery

| Edge Case | Scenario | System Defense & Handling |
| :--- | :--- | :--- |
| **Simultaneous Reservation** | Two users book same car for overlapping dates at the exact same millisecond. | `Car.findOneAndUpdate` with `$not: { $elemMatch: ... }` ensures only 1 update succeeds. Second request receives `null` and fails with 400. |
| **Button Double-Click** | User clicks "Confirm Booking" twice quickly due to slow internet. | Unique sparse index on `idempotencyKey` rejects second insert with error 11000. Controller catches it and returns existing booking with `{ idempotent: true }`. |
| **Price Tampering** | User alters HTTP body to `amount: 100`. | Backend ignores `req.body.amount` completely, recalculating `days * car.pricePerDay` from the database. |
| **Payment Signature Forgery** | User sends fake `razorpay_payment_id`. | Backend computes `HMAC-SHA256(order_id + "|" + payment_id, SECRET)`. Forged signatures fail immediately with 400. |
| **Late Pay Later Payment** | User tries to pay after pickup date has started. | `isDeadlineExpired()` checks business timezone; rejects payment with 409 Conflict, cancels booking, and frees vehicle. |
| **Email Service Outage** | Gmail SMTP is down or credentials expire. | Email failure is caught and logged; internal `Notification` marked `FAILED`. Booking database transaction remains intact. |

---

# 21. Installation & Local Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **MongoDB**: MongoDB Atlas Cluster or local MongoDB instance configured with a **Replica Set** (required for transactions).

### 1. Clone the Repository
```bash
git clone https://github.com/mayanksoni78/Car_Rental.git
cd Car_Rental
```

### 2. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

#### Server Configuration (`server/.env`):
Create a `.env` file in the `server` directory:
```env
PORT=2005
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/car_rental?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173

# Razorpay Credentials (from dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Nodemailer Credentials (Gmail App Password: myaccount.google.com/apppasswords)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# ImageKit Credentials (from imagekit.io/dashboard)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGE_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Google OAuth Client ID (from console.cloud.google.com)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Timezone
APP_TIMEZONE=Asia/Kolkata
```

#### Client Configuration (`client/.env`):
Create a `.env` file in the `client` directory:
```env
VITE_CURRENCY=₹
VITE_BASE_URL=http://localhost:2005
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

---

# 22. Running the Application

### Start the Backend Server:
```bash
cd server
npm run dev      # Runs with nodemon auto-reload on port 2005
# OR: npm start  # Standard production node server.js
```
*Expected console output:*
```text
info: Database.connected
[nodemailer] ✅ Email transporter verified — SMTP connection OK
info: server.started {"port":2005}
```

### Start the Frontend Client:
```bash
cd client
npm run dev
```
*Expected output:*
```text
VITE v7.3.3 ready in 250 ms
➜  Local:   http://localhost:5173/
```

---

# 23. Automated Test Suite & Concurrency Benchmarks

The repository includes specialized diagnostic and stress-testing scripts in `server/`:

### 1. 50-Thread Concurrent Booking Benchmark (`stress-test.js`)
Simulates 50 simultaneous incoming requests attempting to reserve the exact same vehicle for the exact same date range:
```bash
cd server
node stress-test.js
```
*Expected Result*: Exactly **1 request succeeds** (HTTP 200), and **49 requests are cleanly rejected** (HTTP 400 / Conflict). Zero double-bookings.

### 2. Complete Razorpay Payment & Price Integrity Audit (`test_payment_audit.js`)
Audits all 28 security and financial invariants:
```bash
cd server
node test_payment_audit.js
```
*Checks performed*: Razorpay SDK configuration, server-side price calculation tampering defense, deadline expiry calculation, HMAC-SHA256 signature verification, and rate limiter configurations.

### 3. SMTP Connectivity Diagnostic (`test_email.js`)
Verifies Gmail SMTP connectivity and dispatches a test email:
```bash
cd server
node test_email.js
```

### 4. Authentication Flow Audit (`test-auth-flow.js`)
Verifies user registration, bcrypt salt verification, JWT generation, and login credential matching directly against the database:
```bash
cd server
node test-auth-flow.js
```

---

# 24. Deployment Infrastructure

* **Frontend Hosting**: Deployed on **Vercel** (`https://car-rental-mu-ashy.vercel.app`). Also configured for Render static publishing via `render.yaml`.
* **Backend Hosting**: Deployed on **Vercel** / **Render** using Express serverless endpoints configured via `server/vercel.json`.
* **Database Hosting**: **MongoDB Atlas** M0/M10 Replica Set providing multi-document ACID transactions.
* **Media CDN**: **ImageKit.io** handling dynamic image optimization, caching, and WebP compression.

---

# 25. Performance Considerations

1. **Compound Index Optimization**: Critical MongoDB queries (such as checking car overlap and querying user booking history) are fully backed by compound indexes (`car + pickupDate + returnDate + status`).
2. **On-the-Fly Image CDN Transformations**: Vehicle photos uploaded by owners are transformed via ImageKit URLs (`width: 1280, quality: auto, format: webp`), reducing image payload sizes by ~75%.
3. **Zero-Disk Streaming Invoices**: PDF receipts are compiled in-memory as Node.js Buffers via PDFKit and streamed directly over HTTP without temporary disk I/O bottlenecks.
4. **Lean Client Bundles**: Vite production builds complete in under 8 seconds, generating minified, tree-shaken chunks.

---

# 26. Scalability Analysis (10 → 100K Users)

### 10 to 1,000 Concurrent Users (Current Architecture)
* Current architecture handles this easily.
* Node.js non-blocking I/O effortlessly services concurrent HTTP connections.
* MongoDB Atlas handles connection pooling and compound index lookups in sub-millisecond ranges.

### 10,000 to 100,000+ Concurrent Users (Scale-Up Roadmap)
* **Bottleneck 1: In-Memory Rate Limiting**: `express-rate-limit` currently tracks hits in Node.js process memory. Across multiple clustered instances, rate limits are not synchronized.
  * *Solution*: Switch to `rate-limit-redis`.
* **Bottleneck 2: Database Slot Lock Contention**: Under massive load, competing transactions on popular cars could cause high retry counts.
  * *Solution*: Implement a distributed reservation lock using Redis (`Redlock`) with a 10-minute TTL to hold slots before writing to MongoDB.
* **Bottleneck 3: Background Scheduler Redundancy**: Running `setInterval` in multiple clustered backend containers would result in duplicate auto-cancellation sweeps.
  * *Solution*: Delegate the sweep task to an external distributed queue (BullMQ backed by Redis) or a dedicated Cron Worker.

---
