# Chit Fund Management System

A full-stack application for managing chit funds, tracking members, payments, and monthly cycles.

## 🚀 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Neon DB)

## 🛠️ Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [PostgreSQL](https://www.postgresql.org/) (or a Neon DB account)

## 💻 Local Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chit-fund-management
```

### 2. Server Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following content:

```env
DATABASE_URL='postgresql://<user>:<password>@<host>/<database>?sslmode=require'
PORT=3001
```

> **Note:** Replace the `DATABASE_URL` with your actual Neon DB connection string.

Initialize the database schema:

```bash
npm run dev
```
*(The server automatically ensures the schema exists on startup)*

### 3. Client Setup

Open a new terminal, navigate to the client directory, and install dependencies:

```bash
cd client
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🌍 Deployment

### Database (Neon)

1.  Create a project on [Neon](https://neon.tech).
2.  Copy the connection string from the dashboard.
3.  Use this connection string for your `DATABASE_URL` environment variable in both local and production environments.

### Server (Render / Railway)

**Option A: Render**
1.  Create a new **Web Service** on [Render](https://render.com).
2.  Connect your repository.
3.  Set the **Root Directory** to `server`.
4.  Set the **Build Command** to `npm install`.
5.  Set the **Start Command** to `node index.js`.
6.  Add the `DATABASE_URL` in the **Environment Variables** section.

**Option B: Railway**
1.  Create a new project on [Railway](https://railway.app).
2.  Deploy from your GitHub repo.
3.  Set the **Root Directory** to `server`.
4.  Add the `DATABASE_URL` variable.

### Client (Vercel)

1.  Import your project into [Vercel](https://vercel.com).
2.  Set the **Root Directory** to `client`.
3.  The build settings should auto-detect Vite (`npm run build` / `dist`).
4.  **Important:** You need to configure the client to point to your deployed server URL.
    *   Update `client/src/api.js` or use an environment variable (`VITE_API_URL`) to point to your production backend URL (e.g., `https://your-server-app.onrender.com`).
    *   Add `VITE_API_URL` to Vercel's Environment Variables.

## 📁 Project Structure

```
├── client/          # React Frontend
│   ├── src/
│   ├── public/
│   └── ...
├── server/          # Express Backend
│   ├── db.js        # Database connection
│   ├── index.js     # API routes & server entry
│   └── ...
└── README.md
```
