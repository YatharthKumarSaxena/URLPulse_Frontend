# URLPulse Frontend

Frontend dashboard for **URLPulse — Async Job Queue Dashboard**.

The application provides a dashboard for submitting asynchronous batches, monitoring their progress in real time, viewing individual job-item status, and retrying failed items.

## Live Application

* **Frontend:** `[<FRONTEND_DEPLOYED_URL>](https://urlpulse-frontend.onrender.com/)`
* **Backend API:** `[<BACKEND_DEPLOYED_URL>](https://urlpulse-backend.onrender.com/)`

---

## Setup & Run

### Prerequisites

* Node.js 20+
* Running URLPulse Backend

### Installation

```bash
git clone https://github.com/YatharthKumarSaxena/URLPulse_Frontend.git
cd URLPulse_Frontend
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
BACKEND_API_URL="your-backend-api-url"
```

### Run Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

---

## Features

* Create Random/Simulation batches
* Configure the number of jobs in a batch
* Upload CSV/XLS/XLSX files for URL Health Check
* View total, completed, failed, processing and pending jobs
* Real-time batch progress
* Per-item job status
* Paginated job-item listing
* Retry individual failed jobs
* Responsive dashboard interface

---

## Architecture

The frontend is built using **Next.js with TypeScript**.

```text
Browser
   │
   ▼
Next.js Application
   │
   ▼
Next.js API Routes / tRPC
   │
   ▼
Express Backend API
   │
   ▼
BullMQ + Redis
   │
   ▼
Background Worker
```

The browser does not directly handle background processing. It communicates with the backend through the Next.js application boundary.

---

## API Communication

The frontend uses Next.js API routes and tRPC procedures as the server-side communication layer between the UI and the Express backend.

```text
UI
 │
 ▼
Next.js / tRPC
 │
 ▼
Backend API
```

This keeps backend communication centralized and avoids coupling individual UI components directly to backend implementation details.

---

## Real-Time Updates

The dashboard receives live progress updates using **Server-Sent Events (SSE)**.

```text
Background Worker
       │
       ▼
   Job Status
       │
       ▼
     SSE
       │
       ▼
 Next.js Application
       │
       ▼
    Dashboard
```

The frontend updates the dashboard as individual jobs complete instead of repeatedly requesting the complete job list every second.

---

## Dashboard

The dashboard provides an overview of the selected batch including:

* Total jobs
* Completed jobs
* Failed jobs
* Processing jobs
* Pending jobs
* Overall progress
* Individual job status
* Retry actions for failed items

Job items are displayed using pagination so that large batches do not require loading the complete dataset at once.

---

## Batch Submission

### Random / Simulation

Users can provide a job count and submit a batch.

```text
User enters count
       ↓
Submit Batch
       ↓
Backend creates JobItems
       ↓
Jobs processed asynchronously
       ↓
Dashboard receives live updates
```

### URL Health Check

Users can upload a CSV/XLS/XLSX file containing URLs.

```text
Upload File
    ↓
Frontend sends file
    ↓
Backend creates batch
    ↓
URLs become JobItems
    ↓
Background processing
    ↓
Live dashboard updates
```

---

## Retry Flow

When an individual job fails, the frontend exposes a retry action.

```text
FAILED
  ↓
Retry
  ↓
Backend
  ↓
Same JobItem queued again
  ↓
PROCESSING
```

The frontend does not resubmit the complete batch.

---

## Technology Stack

| Technology | Purpose                 |
| ---------- | ----------------------- |
| Next.js    | Frontend framework      |
| TypeScript | Type-safe development   |
| React      | UI components           |
| tRPC       | Typed API communication |
| SSE        | Real-time updates       |
| CSS        | Styling                 |

---

## Design Decisions

### Next.js

Next.js was used as required by the assignment and provides the application framework along with server-side API capabilities.

### TypeScript

TypeScript is used throughout the frontend to provide type safety and reduce runtime errors.

### tRPC

tRPC is used as the typed communication layer between the frontend application and backend API.

### SSE for Live Progress

SSE was used for one-way server-to-client progress updates. It allows the dashboard to receive updates without repeatedly polling the complete job list.

### Pagination

Job items are fetched in pages rather than loading all items simultaneously. This keeps the dashboard usable for larger batches.

---

## Time-Limit Trade-offs

The assignment had a **3-day implementation window**.

Development focused on the core assignment requirements:

* Batch submission
* Asynchronous job monitoring
* Live progress updates
* Individual job status
* Retry functionality
* Persistent backend state
* Public deployment

The frontend was kept focused on the dashboard workflow instead of adding features outside the assignment requirements.

---

## Related Repository

**Backend:**

```text
https://github.com/YatharthKumarSaxena/URLPulse_Backend
```

---

## Author

**Yatharth Kumar Saxena**

Computer Engineering
Zakir Husain College of Engineering & Technology
Aligarh Muslim University
