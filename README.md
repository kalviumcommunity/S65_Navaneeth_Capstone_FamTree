# FamTree

FamTree is a full-stack family relationship management application. It combines member profiles and relationship data with an interactive, focus-centric family tree that makes complex family structures easier to explore.

## Features

- Account registration and login with JWT authentication
- Create, edit, view, and delete family member profiles
- Store profile photos, dates, notes, family branches, and relationship tags
- Connect parents, spouses, and children in a persistent genealogy graph
- Explore the graph from a focused member using an interactive React Flow canvas
- Automatically position parents, siblings, spouses, and children around the focused member
- Expand incomplete branches with starter and unknown-member placeholders
- Edit member details directly from the tree view
- Responsive dashboard and member management pages

## Technology

### Frontend

- React 19 and Vite
- React Router
- React Flow
- Zustand
- Axios
- Tailwind CSS 4

### Backend

- Node.js and Express
- MongoDB and Mongoose
- JSON Web Tokens (JWT)
- bcryptjs

The frontend is configured for Vercel and the backend is configured for Render.

## Project Structure

```text
server.js                 Backend entry point
server/                   Express application, routes, controllers, models, and middleware
client/src/               React application source
client/src/features/      Family tree canvas, nodes, edges, layout, and stores
client/src/pages/         Authentication, dashboard, tree, and member pages
client/src/services/      API and authentication service modules
```

## Getting Started

### 1) Backend

Create a `.env` file in the project root with the backend variables listed below.

Install and run:

```bash
npm install
npm run dev
```

The backend runs at `http://localhost:5000` by default.

### 2) Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

In development, Vite proxies `/api` requests to `http://localhost:5000`.

---

## Environment Variables

Backend (`.env`):

```env
MONGO_URI=your-mongodb-connection-string
PORT=5000
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:5173
```

- `MONGO_URI` is the MongoDB connection string.
- `PORT` defaults to `5000` locally.
- `JWT_SECRET` is used to sign authentication tokens and is required at startup.
- `FRONTEND_URL` is the frontend origin allowed by CORS.

Frontend (`client/.env`):

```env
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` can be set to the deployed backend URL. It is optional during local development because Vite proxies `/api` requests.

---

## API Routes

Authentication:

- `POST /api/users/register` – create an account
- `POST /api/users/login` – authenticate and receive a token

Members (protected; requires `Authorization: Bearer <token>`):

- `GET /api/members`
- `GET /api/members/:id`
- `POST /api/members`
- `PUT /api/members/:id`
- `DELETE /api/members/:id`

---

## Deployment

### Backend on Render

- Set `MONGO_URI`, `JWT_SECRET`, and `FRONTEND_URL` in the Render environment.
- Set `FRONTEND_URL` to the deployed frontend origin.
- The included `render.yaml` configures the Node.js service and production start command.

### Frontend on Vercel

- Set `VITE_API_URL` to the deployed Render backend URL.
- Deploy the `client` directory as the project root.

## Architecture Overview

The backend scopes member data to the authenticated user. Each member stores profile information and references to related parents, spouses, and children. The frontend fetches this graph, keeps the active focus in a Zustand store, and derives the visible React Flow nodes and edges from that focus. This keeps large family graphs readable while allowing users to move through the wider structure as needed.
