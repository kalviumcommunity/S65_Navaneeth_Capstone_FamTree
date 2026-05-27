# FamTree (MERN Capstone)

FamTree is a simple family tree visualization web app.

Users can:
- Register / Login
- Add, view, edit, and delete family members
- Create a basic parent → child relationship (`parentId`)
- Visualize a simple family hierarchy (nested layout)

This project is intentionally beginner-friendly and interview-defendable:
- No AI/chatbot features
- No complex state libraries
- Clear folder structure (controllers/routes/models)

---

## Tech Stack

Frontend:
- React + Vite
- React Router
- Axios
- TailwindCSS

Backend:
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT Authentication

Deployment (recommended):
- Frontend: Vercel
- Backend: Render

---

## Folder Structure

Backend:

server/
	app.js
	config/
		db.js
	controllers/
	middleware/
	models/
	routes/

Frontend:

client/src/
	components/
	context/
	pages/
	services/

---

## Getting Started (Local)

### 1) Backend

Create a `.env` in the project root (see `.env.example`).

Install and run:

```bash
npm install
npm run dev
```

Backend runs at: `http://localhost:5000`

### 2) Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

In development, Vite proxies `/api` calls to `http://localhost:5000`.

---

## Environment Variables

Backend (`.env`):
- `MONGO_URI` – MongoDB connection string
- `PORT` – backend port (default `5000`)
- `JWT_SECRET` – secret key used to sign JWT tokens
- `FRONTEND_URL` – allowed frontend origin for CORS (e.g. Vercel URL)

Frontend (`client/.env`):
- `VITE_API_URL` – backend base URL (Render URL). Optional in dev.

---

## API Routes

Auth:
- `POST /api/users/register` – create account (returns `{ token, user }`)
- `POST /api/users/login` – login (returns `{ token, user }`)

Members (protected — requires `Authorization: Bearer <token>`):
- `GET /api/members`
- `GET /api/members/:id`
- `POST /api/members`
- `PUT /api/members/:id`
- `DELETE /api/members/:id`

---

## Deployment Notes

Backend (Render):
- Set the backend env vars from `.env.example` in Render

Frontend (Vercel):
- Set `VITE_API_URL` to your Render backend URL

---

## Interview Notes (What to Explain)

- How JWT works (token returned on login, sent in `Authorization` header)
- How MongoDB relationships work:
	- `Member.createdBy` links members to a user
	- `Member.parentId` links a child to a parent (self-reference)
- How the frontend builds the tree:
	- group members by `parentId`
	- recursively render children
