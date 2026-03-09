# Capstone Project: FamTree

## Project Overview

**Project Name:** FamTree

**Description:** FamTree is a family tree visualization platform where users can create, update, and manage family relationships. It allows users to add family members, edit details, and share their family trees with secure access and smooth collaboration.

## Key Features

- ✅ Family Tree Creation – Add and visualize relationships dynamically
- ✅ CRUD Operations – Create, read, update, and delete family members
- ✅ User Authentication – Secure login via JWT authentication
- ✅ Collaborative Input – Shareable links for family members to contribute
- ✅ Profile Management – Users can edit their profiles
- ✅ AI Chatbot – Groq-powered assistant for platform guidance

---

## Assignment Completion

### 1. Database Schema Created

The FamTree database uses MongoDB with Mongoose for schema definition.

**Collections:**
- **User** – Stores user account information
- **Member** – Stores family member details with references to User and parent Member

---

### 2. GET API Used

**Endpoint:** `GET /api/members`

- Fetches all family members from MongoDB
- Uses `Member.find()` with Mongoose
- Resolves relationships using `.populate()` for User and parent Member references
- Returns JSON array of family members

---

### 3. POST API Used

**Endpoint:** `POST /api/members`

- Creates a new family member in MongoDB
- Uses `new Member()` and `.save()` to insert data
- Accepts JSON body with member details
- Returns created member object with ID

---

### 4. PUT API Used

**Endpoint:** `PUT /api/members/:id`

- Updates existing family member records
- Uses `findByIdAndUpdate()` to modify data in MongoDB
- Accepts member ID and updated fields
- Returns updated member object

---

### 5. Deployed Backend Server

**Platform:** Render

**URL:** https://famtree-backend.onrender.com/api/members

- Backend connected to MongoDB Atlas using Mongoose
- All API endpoints deployed and operational
- Environment variables configured for production

---

### 6. Database Read and Write Performed

**Read Operations:**
- GET endpoint retrieves family members in real-time from MongoDB

**Write Operations:**
- POST endpoint inserts new members into the database
- PUT endpoint updates existing member records
- All operations use live MongoDB Atlas connection

---

### 7. Implemented Relationship Between Entities in Database

**Relationship 1: User → Member (One-to-Many)**
- Each Member stores `createdBy` as a reference to User
- Implemented using Mongoose `ref: "User"`
- Resolved using `.populate("createdBy")`

**Relationship 2: Member → Member (Self-referencing Tree)**
- Each Member can reference a parent via `parentId`
- Enables hierarchical family tree structure
- Resolved using `.populate("parentId")`

---

### 8. Initialized a React/Frontend Application

**Framework:** React with Vite

**Setup:**
- Project initialized inside `/client` folder
- Build tool: Vite (optimized production builds)
- Package manager: npm

---

### 9. Deployed Frontend Server

**Platform:** Vercel

**URL:** https://famtree-one.vercel.app/

**Deployment Configuration:**
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`

---

### 10. Created Frontend Components in React

**Components:**
- **Header** – Application title and subtitle
- **Dashboard** – Main layout container
- **MemberCard** – Displays family member information
- **AddMemberForm** – Form to add new family members

---

### 11. Implemented LLM/AI-Autocomplete Functionality in Application

**AI Service:** Groq API with `llama-3.3-70b-versatile` model

**Architecture:**
- Frontend sends user input to backend
- Backend calls Groq API securely
- Backend returns AI response to frontend
- Floating chatbot UI displays interactions

**Endpoint:** `POST /api/ai/chat`

**Security:**
- Rate-limited to 15 requests/min per IP
- API keys stored server-side only
- CORS configured for production domains

**Environment Variables:**
- `GROQ_API_KEY` – Groq API authentication
- `AI_MODEL` – LLM model selection
- `FRONTEND_URL` – CORS configuration
- `VITE_API_URL` – Frontend backend URL

---

## Project Timeline

6 weeks completed with buffer days for optimization and unforeseen issues.
