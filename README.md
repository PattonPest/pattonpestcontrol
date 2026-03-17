# Patton Pest Control — Virtual Scratch-Off Ticket

A fun promotional web app where customers enter their phone number or email to scratch a virtual ticket and reveal a prize. Built with Next.js, TypeScript, and SQLite.

---

## 🚨 Getting a 404 on Vercel? Read this first.

If you deployed to Vercel and see **"404: NOT_FOUND"** (possibly with an ID like `cle1::wnvdb-...`), it means Vercel deployed from the wrong branch. The app code is in this **pull request** — it has NOT been merged into `main` yet.

**Fix in 2 steps:**

1. **Merge this pull request into main** — on the GitHub page for this repo, click the **"Merge pull request"** button (green button near the bottom of the PR page).
2. **Vercel will automatically redeploy** within ~2 minutes after the merge. Your URL will start working.

That's it. No other changes needed — the environment variables you already set are fine.

---

## 🧪 How to Test It Right Now (No Coding Experience Needed)

### Option A — Test it on your computer (free, takes ~5 minutes)

**Step 1 — Install Node.js** (only do this once)

1. Go to [https://nodejs.org](https://nodejs.org)
2. Click the big green **"LTS"** download button and install it like any normal program
3. When done, you're ready for Step 2

**Step 2 — Download this project**

1. On this GitHub page, click the green **"Code"** button (top right area)
2. Click **"Download ZIP"**
3. Find the ZIP file in your Downloads folder and double-click it to unzip it
4. You'll get a folder called something like `pattonpestcontrol-main`

**Step 3 — Open a Terminal inside the folder**

- **On Mac:** Right-click the unzipped folder → "New Terminal at Folder"  
  *(or open Terminal app, type `cd ` then drag the folder into the window, press Enter)*
- **On Windows:** Open the folder, click the address bar at the top, type `cmd`, press Enter

**Step 4 — Run these 4 commands** (copy and paste each one, press Enter after each)

```
npm install
```
*(Wait for it to finish — this downloads everything the app needs. May take 1–2 minutes.)*

```
copy .env.example .env
```
*(Windows — creates your settings file. On Mac, use: `cp .env.example .env`)*

```
npm run db:push
```
*(Creates the database file)*

```
npm run dev
```
*(Starts the app — you'll see "Ready" when it's done)*

**Step 5 — Open your browser and go to:**

| Page | What it does |
|------|-------------|
| http://localhost:3000/scratch | 🎟 The scratch-off ticket your customers will use |
| http://localhost:3000/admin | 🔐 Admin panel to change prizes and themes |
| http://localhost:3000 | 🏠 Home/welcome page |

> **To log into the admin panel**, use the password: `change-me-to-a-secret`  
> (You should change this — see the "Change your admin password" section below)

**To stop the app:** Press `Ctrl + C` in the terminal window.

---

### Option B — Deploy it live on the internet (free, takes ~10 minutes)

> ⚠️ **You must complete Step 1 (merge the PR) before Vercel will work.**

1. **Merge this pull request** — on the GitHub page for this repo, click **"Merge pull request"** (the green button at the bottom of the PR). This moves the app code into the `main` branch, which is what Vercel deploys.
2. Go to [https://vercel.com](https://vercel.com) and sign in with your GitHub account
3. Click **"Add New Project"**
4. Find and click **`PattonPest/pattonpestcontrol`**
5. Before clicking Deploy, click **"Environment Variables"** and add these two:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | `file:/tmp/prod.db` |
   | `ADMIN_TOKEN` | make up a secret password (write it down!) |

6. Click **Deploy** and wait ~2 minutes
7. Vercel gives you a free URL like `https://pattonpestcontrol.vercel.app`
8. Share that URL with customers — they go to `/scratch` to play!

---

## 🔐 Change Your Admin Password

1. Open the `.env` file in your project folder (it's a plain text file)
2. Find the line: `ADMIN_TOKEN="change-me-to-a-secret"`
3. Replace `change-me-to-a-secret` with your own secret password
4. Save the file and restart the app (`npm run dev`)

On Vercel: go to your project → **Settings → Environment Variables** → edit `ADMIN_TOKEN`.

---

## 🎁 How to Change Prizes (No Coding Needed)

1. Go to `/admin` in your browser
2. Log in with your admin password
3. You'll see a table showing all prizes. You can:
   - Click **Edit** next to any prize to change its name, description, or odds
   - Click **+ Add New Prize** to create a new prize
   - Click **Delete** to remove a prize
   - Click the green **✓ On** button to turn a prize off (it becomes gray and won't appear)
4. Click **Save Prize** to apply your changes — they take effect immediately

### Understanding Weights (How Odds Work)

Weights control how often each prize appears. Think of it like tickets in a raffle.

| Prize | Weight | Chance |
|-------|--------|--------|
| No prize | 70 | 70% |
| $5 off | 20 | 20% |
| $25 off | 9 | 9% |
| Free service | 1 | 1% |

The weights add up to 100, so they work like percentages here. But they don't *have* to add up to 100 — the app calculates the real percentage automatically. For example, if you only have two prizes with weight 1 and weight 1, each has a 50% chance.

> 💡 Prizes can be **any text you want** — for example:  
> "Free Inspection", "$10 off your next visit", "Call us for a surprise deal!", "Thank you for being a loyal customer!"

---

## 🎨 How to Change the Ticket Theme

The ticket automatically picks a seasonal theme based on today's date:
- 🐛 Default (Patton Pest Control)
- 🦟 Summer (June–August)
- 🐝 Spring (March–May)
- 🎄 Christmas (December 20–26)
- 🕷️ Halloween (October 25–31)
- 🦃 Thanksgiving (last week of November)
- 💝 Valentine's Day (February 10–14)
- 🎉 New Year (January 1–3)
- 🎆 4th of July (July 1–7)
- 🍀 St. Patrick's Day (March 14–17)
- 🐣 Easter (one week window around Easter Sunday)

**To manually set a theme:**
1. Go to `/admin` and log in
2. Scroll down to **"Theme Settings"**
3. Click on the theme you want
4. Click **Save Theme**

---

## 📊 Admin Panel Features

Go to `/admin` and log in with your admin password.

- **Stats at the top** — total tickets issued, unique players, and how many of each prize was won
- **Prize table** — add, edit, delete, or toggle prizes on/off
- **Theme picker** — choose a seasonal theme or let it auto-select

---

## ✨ Features

- 🎟 Realistic scratch-off card animation (scratch with your mouse or finger)
- 🔒 Customers must enter their phone number or email to play (one ticket per person per month)
- 🎲 Customizable prizes & odds — change them live from the admin panel
- 🎨 11 seasonal & holiday themes — auto-selects by date, or override in admin
- 🐛 Every ticket has Patton Pest Control branding
- 📊 Stats dashboard to see how many tickets were played and which prizes were won
- 🗄 SQLite database — no external database setup required
- 🚀 Deployable to Vercel for free

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Path to the database file. Default: `file:./dev.db` |
| `ADMIN_TOKEN` | ✅ | Your secret password for the `/admin` page |

---

## ⚠️ Limitations & Notes

- **Monthly limit** is checked by email/phone. Someone could bypass it by using a different email or phone number.
- SQLite works great for small and medium traffic. For very high traffic (1,000+ simultaneous users) you'd want to switch to PostgreSQL or MySQL.
- **Vercel free plan:** The SQLite database file may reset when you redeploy. For permanent storage on Vercel, use [Supabase](https://supabase.com) (free Postgres database) and update `prisma/schema.prisma` to use `postgresql` as the provider.

---

## 🛠 Developer Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the app locally at http://localhost:3000 |
| `npm run build` | Build for production |
| `npm start` | Run the production build |
| `npm run db:push` | Create or update the database |
| `npm run lint` | Check code for errors |
