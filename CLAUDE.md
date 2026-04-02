# CLAUDE.md — Management System Next

## Project Overview

**Vape/disposable e-cigarette distribution management system.** Tracks client orders, seller commissions, inventory, expenses, and revenue. Interface and validation messages are in **Bulgarian**. Role-based access: Super Admin, Admin, Seller.

**Business domain:**
- Products are disposable vapes (бутилки), balloons (балони), and tips (накрайници) with flavor variants
- Sellers take orders from clients and get commissions (`seller_prices[]` array indexed by quantity)
- Admins manage the full order lifecycle and financials
- Super Admin confirms payments (`revenueConfirmed`) and has full system access

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| UI Library | @heroui/react + Tailwind CSS v4 |
| Database | MongoDB + Mongoose |
| Auth | NextAuth v4 (JWT, CredentialsProvider) |
| State | MobX (mobx-react-lite) |
| Real-time | Pusher + Socket.io |
| AI | Groq via AI SDK (`ai` + `@ai-sdk/groq`) |
| Push Notifications | Firebase / FCM |
| Validation | Zod + custom `validateFields()` in `utils.js` |
| Images | Cloudinary (remote patterns in next.config) |
| Charts | react-apexcharts |
| Animations | Framer Motion |

---

## Project Structure

```
/app                    # Next.js App Router
  /api                  # 39 API route handlers
  /dashboard            # Dashboard pages
  /register             # Registration page
  page.js               # Login page (root)
  layout.js             # Root layout with providers

/components             # React components by feature
  /layout               # Dashboard layout wrapper
  /ad                   # Advertising components
  /charts               # BarChart, LineChart, PieChart
  /forms                # Form components
  /html                 # Low-level HTML elements (Input, etc.)
  /pages                # Page templates
  /product              # Product components
  /table                # Table components

/models                 # 13 Mongoose schemas
/stores                 # 11 MobX singleton stores
/actions                # Client-side API action handlers
/libs                   # External service clients (MongoDB, Firebase, Pusher)
/helpers                # Auth utilities, rate limiter, role checks
/services               # Push notification service
/providers              # React context providers (AuthProvider, MainProvider)
/rules                  # Validation rules
/enums                  # Status enums
/seeders                # DB seeders (`npm run data:seed`)
```

---

## Path Aliases

`@/*` maps to the root directory (configured in `jsconfig.json`).

```js
import Foo from "@/components/Foo"
import { connectToDatabase } from "@/libs/mongodb"
```

---

## Database Models (13)

| Model | Key Fields |
|-------|-----------|
| User | name, email, password (bcrypt), role (ref), profile_image, percent, target, fcmTokens |
| Product | name, flavor, weight, model, count, puffs, availability, units_per_box, price, sell_prices, seller_prices, image_url, hidden, category (ref) |
| ClientOrder | phone, isNewClient, quantity, price, address, status (нова/доставена/отказана), assignedTo (User ref), payout, isPaid, paidAt, deliveryCost, rejectionReason, viewedBySeller, revenueConfirmed, orderNumber |
| Order | quantity, total_amount, price, message, date, product (ref) |
| Category | name |
| Role | name (Admin / Super Admin / Seller) |
| Income | amount, message, distributor (ref), date |
| Distributor | name |
| Sell | quantity, price, message, date, mileage, additional_costs, fuel_consumption, diesel_price, product (ref), user (ref) |
| Ad | platform, amount, date |
| Notification | type, orderId, orderNumber, changedBy, assignedTo, change, status, readBy[] |
| Value | fuel_consumption, diesel_price |

MongoDB connection: `libs/mongodb.js` — global singleton, caches across serverless invocations.

---

## MobX Stores (`stores/useStore.js`)

All stores use `makeAutoObservable()` and are exported as singletons.

| Store | Responsibility |
|-------|---------------|
| commonStore | Global UI state: loading, errors, messages, dashboard date filters |
| authStore | Login, registration, roles |
| orderStore | Internal orders |
| productStore | Products |
| sellStore | Sales data |
| expenseStore | Expenses |
| incomeStore | Income |
| adStore | Advertising |
| userStore | User management |
| categoryStore | Categories |
| clientOrderStore | Client orders (main feature) |

---

## Authentication

- **Provider:** NextAuth CredentialsProvider (email + password)
- **Password hashing:** bcryptjs
- **Session:** JWT strategy — enriched with `id`, `name`, `email`, `role`, `profile_image`
- **Rate limiting:** 5 failed attempts per 15-minute window (`helpers/rateLimiter.js`)
- **Authorization helpers:**
  - `requireAdmin()` — allows Admin and Super Admin
  - `requireSuperAdmin()` — allows Super Admin only

---

## API Routes (key endpoints)

```
POST   /api/auth/[...nextauth]     NextAuth login
POST   /api/register               Registration

GET    /api/products               All products
POST   /api/products               Create product (Super Admin)
GET|PUT|DELETE /api/products/[id]  Product CRUD

GET    /api/client-orders          List orders (paginated, role-filtered)
POST   /api/client-orders          Create order (Admin or Seller)
GET    /api/client-orders/[id]     Order details
POST   /api/client-orders/pay      Payment
POST   /api/client-orders/payment-confirm
POST   /api/client-orders/ai-summary   Groq AI summary (streaming)
GET    /api/client-orders/summary  Aggregated stats
GET    /api/client-orders/history  Order history

GET    /api/users                  User list
GET    /api/categories             Categories
GET    /api/expenses               Expenses (+ fuel, additional sub-routes)
GET    /api/incomes                Income (+ additional sub-routes)
GET    /api/sales                  Sales + statistics + chart data
GET    /api/distributors           Distributors
GET    /api/roles                  Roles
POST|GET /api/notifications        Notifications
POST   /api/notifications/token    Register FCM token
```

---

## Real-time (Pusher)

- Channel: `"client-orders"`
- Events: `order-event` with payload `{ type, orderId, orderNumber, changedBy }`
- Server pushes on order create/update
- Client subscribes via custom hooks (e.g., `usePusherClientOrders.js`)

---

## AI Integration (Groq)

- Route: `POST /api/client-orders/ai-summary` — streaming
- Also: `POST /api/client-orders/stream`
- Model: configured via `@ai-sdk/groq`
- Used to generate Bulgarian-language order summaries

---

## Firebase / Push Notifications

- Client init: `components/PushNotificationInit.js`
- Server-side: `libs/firebase-admin.js` + `services/pushNotification.js`
- FCM tokens stored on `User.fcmTokens[]`

---

## Environment Variables

Defined in `.env`. Key variables:

```
NEXTAUTH_SECRET
MONGODB_URI
GROQ_API_KEY
PUSHER_KEY / PUSHER_SECRET / PUSHER_APP_ID / PUSHER_CLUSTER
NEXT_PUBLIC_FIREBASE_* (client-side Firebase config)
FIREBASE_PROJECT_ID / FIREBASE_PRIVATE_KEY / FIREBASE_CLIENT_EMAIL (Admin SDK)
```

---

## Useful Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run data:seed    # Seed database with products
```

---

## Role Permissions Matrix

| Action | Super Admin | Admin | Seller |
|--------|:-----------:|:-----:|:------:|
| Create/edit/delete products | ✓ | ✗ | ✗ |
| View products | ✓ | ✓ | ✓ |
| Create client orders | ✓ | ✓ | ✓ (auto-assigned to self) |
| View client orders | ✓ all | ✓ all | ✓ own only |
| Edit client orders | ✓ any status | ✓ "нова" only | ✓ own "нова" only |
| Delete client orders | ✓ | ✓ | ✗ |
| Mark order as viewed | ✓ | ✓ | ✓ |
| Process payment (`/pay`) | ✓ | ✗ | ✗ |
| Confirm payment (`/payment-confirm`) | ✓ | ✗ | ✗ |
| View users list | ✓ | ✓ | ✗ |
| Edit users | ✓ | ✓ | ✗ |
| View/edit expenses | ✓ | ✓ | ✗ |
| Add additional income | ✓ | ✓ | ✗ |
| View/edit marketing (ads) | ✓ | ✓ | ✗ |
| View/edit system values | ✓ | ✓ | ✗ |
| View all sales statistics | ✓ | ✓ | ✗ |
| View own sales statistics | ✓ | ✓ | ✓ |

**Notes:**
- Role names are compared as plain strings: `"Admin"`, `"Super Admin"`, `"Seller"`
- `session.user.role` is a string (not ObjectId) — transformed during NextAuth JWT callback
- Seller data isolation is enforced per-route via `assignedTo === session.user.id` checks

---

## API Route Pattern

Every API route follows this structure:

```js
// 1. Auth check
const { error, session } = await requireAdmin(); // or requireSuperAdmin()
if (error) return error;

// 2. Parse request
const data = await request.json();

// 3. Connect DB
await connectMongoDB();

// 4. Business logic
const result = await Model.operation(data);

// 5. Response (always this shape)
return NextResponse.json({ message: "...", status: true }, { status: 201 });
```

**Response format:** always `{ message: string, status: boolean }` + optional data fields.
**Pagination:** `page` + `per_page` params, max 20 per page, uses `.skip().limit()`.
**Date filtering:** utility `getDateCondition()` for flexible date range queries.
**Lean queries:** use `.lean()` for read-only operations.

---

## Code Conventions

- `"use client"` directive on interactive components
- Bulgarian text in UI, validation errors, and status enums (`нова`, `доставена`, `отказана`)
- Client-side validation: `validateFields()` from `utils.js`
- Server-side validation: Zod schemas
- Components are feature-scoped (e.g., all ClientOrder UI lives under `/components/` with `ClientOrder` prefix)
- Custom hooks co-located with features (e.g., `useOrderState.js` next to order components)
- Real-time notifications: server calls `notifyOrderClients()` (Pusher) + `saveNotification()` (DB) on order changes

---

## Known Quirks

- **Order number:** uses MongoDB atomic counter (workaround for missing auto-increment)
- **Daily boundary:** "today's orders" counts from 7:00 AM, not midnight
- **secondProduct:** always initialized as `{}` on ClientOrder even when unused
- **Deployment:** no `vercel.json` or other deploy config — standard Next.js deployment
