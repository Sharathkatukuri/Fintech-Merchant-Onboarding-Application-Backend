# Viyona Backend

- **My Project**: [Merchant-Onboarding](https://fintech-merchant-onboarding-applica.vercel.app/register).
- 
## Description

Backend service for the Fintech Merchant Onboarding Application.
Handles authentication, merchant onboarding, document uploads, and admin workflows.

---

## Tech Stack

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* bcrypt
* multer

---

## Setup

Clone the repo:

```
git clone https://github.com/<your-username>/viyona-backend.git
cd viyona-backend
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_secret_key
CLIENT_URL=https://your-frontend.vercel.app
```

Run server:

```
npm start
```

---

## Base URL

```
https://your-backend.onrender.com
```

---

## Authentication

Uses JWT tokens.

Send token in headers:

```
Authorization: Bearer <token>
```

---

## API Endpoints

### Auth

```
POST /api/auth/register
POST /api/auth/merchant/login
POST /api/admin/login
```

### Merchant

```
POST /api/application/submit
GET /api/application/status
```

### Documents

```
POST /api/upload
```

### Admin

```
GET /api/admin/applications
GET /api/admin/applications/:id
PUT /api/admin/applications/:id/status
```

---

## Features

* Merchant registration & login
* Admin authentication
* Application submission
* Document upload (multer)
* Status tracking
* Filtering & review system

---

## Database Collections

* users
* merchantApplications
* documents
* adminUsers

---

## Deployment

* Backend: Render
* Database: MongoDB Atlas

---

## Notes

* Admin is created using seed script (no public signup)
* Environment variables are required
* CORS configured for frontend

---

## Status

Project completed and deployed.
