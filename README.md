# Patton Pest Control — Virtual Scratch-Off Ticket

A fun promotional web app where customers enter their phone number or email to scratch a virtual ticket and reveal a prize. Built with Next.js, TypeScript, and SQLite (Prisma).

---

## ✨ Features

- 🎟 HTML Canvas scratch-off animation
- 🔒 Phone/email required before playing (one ticket per person per month, enforced server-side)
- 🎲 Customizable prizes & odds (edit live from the Admin Panel — no coding needed)
- 📊 Admin panel at `/admin` to add/edit/delete prizes and view stats
- 🗄 SQLite database — no external database required
- 🚀 Deployable to Vercel in minutes

---

## 🖥 Running Locally (Step-by-Step for Non-Coders)

> You need [Node.js](https://nodejs.org) installed (v18 or later).

1. **Download and open the project**
   - Click the green "Code" button on GitHub → **Download ZIP**
   - Unzip the folder and open a terminal (or command prompt) inside it

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and change `ADMIN_TOKEN` to a secret password only you know.

4. **Create the database**
   ```bash
   npm run db:push
   ```

5. **Start the app**
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000/scratch to play!  
   Open http://localhost:3000/admin to manage prizes.

---

## 🎁 How to Update Prizes / Odds (No Coding Needed)

1. Go to **`/admin`** in your browser (e.g. `https://yoursite.com/admin`)
2. Enter your **Admin Token** (the `ADMIN_TOKEN` from your `.env` file)
3. You'll see a table of all prizes. You can:
   - **Edit** a prize — change the name, description, weight, or toggle it on/off
   - **Add** a new prize — click "+ Add New Prize"
   - **Delete** a prize you no longer want
4. Click **Save Prize** — changes take effect immediately for all new tickets

### Understanding Weights

Weights control how often a prize appears. Higher weight = more common.

| Prize        | Weight | Chance |
|--------------|--------|--------|
| No prize     | 70     | 70%    |
| $5 off       | 20     | 20%    |
| $25 off      | 9      | 9%     |
| Free service | 1      | 1%     |

**Example:** To make "$10 off" appear 15% of the time, set its weight to 15 and adjust others so they still add up to 100.

> Prizes can be **any text** — e.g. "Free Inspection", "10% off", "Call for a surprise!", "Thank you for visiting!" etc.

---

## 🚀 Deploying to Vercel (Recommended)

1. Push this repo to GitHub (it already is!)
2. Go to [vercel.com](https://vercel.com), sign in with GitHub
3. Click **"Add New Project"** → import `PattonPest/pattonpestcontrol`
4. Under **Environment Variables**, add:

   | Variable       | Value                          |
   |----------------|--------------------------------|
   | `DATABASE_URL` | `file:/tmp/prod.db`            |
   | `ADMIN_TOKEN`  | your-secret-password           |

5. Click **Deploy**

> **Note:** Vercel's file system is ephemeral — the SQLite DB resets on each redeploy. For a persistent database, use [PlanetScale](https://planetscale.com) (MySQL) or [Supabase](https://supabase.com) (Postgres) and update `prisma/schema.prisma` to use that provider.

---

## 🔑 Environment Variables

| Variable       | Required | Description                                          |
|----------------|----------|------------------------------------------------------|
| `DATABASE_URL` | ✅        | Path to SQLite file, e.g. `file:./prisma/dev.db`    |
| `ADMIN_TOKEN`  | ✅        | Secret password to access `/admin` and stats API    |

---

## 📊 Admin Panel

Go to **`/admin`** and log in with your `ADMIN_TOKEN`.

- View total tickets issued and unique players
- See how many times each prize was won
- Add, edit, or delete prizes in real time

### Stats API (for developers)

```
GET /api/admin/stats?token=YOUR_ADMIN_TOKEN
```

Returns JSON with total tickets, unique players, and per-prize win counts.

---

## ⚠️ Limitations

- **Monthly limit** is enforced **server-side by contact info** (email/phone). A person could bypass this by using a different email or phone number.
- The `localStorage` fast-path on the client is a convenience only — the server always enforces the real limit.
- SQLite is great for small/medium traffic. For high traffic (1000+ concurrent users), switch to PostgreSQL or MySQL.
- At least 3 users can play simultaneously — SQLite WAL mode is enabled for concurrent read/write support.

---

## 🛠 Scripts

| Command           | Description                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Start dev server at localhost:3000       |
| `npm run build`   | Build for production                     |
| `npm start`       | Start production server                  |
| `npm run db:push` | Apply schema changes to the database     |
| `npm run lint`    | Lint the code                            |
