# Patton Pest Control – Virtual Scratch-Off Ticket

A web app where customers can scratch a virtual ticket once per day to win prizes from Patton Pest Control.

## What It Does

- One free scratch-off ticket per day per device (tracked in localStorage)
- Server-side prize determination — odds can't be manipulated by users
- HTML Canvas scratch effect on the frontend
- Stores all tickets in a SQLite database via Prisma

## Prize Configuration (default)

Edit `config/prizes.json` to change prizes and odds:

| Prize        | Odds |
|-------------|------|
| No prize     | 70%  |
| $5 off       | 20%  |
| $25 off      |  9%  |
| Free service |  1%  |

Weights are relative — just make sure they add up to 100 for easy percentage math.

## How to Run Locally

**Prerequisites:** Node.js 18+ and npm installed.

```bash
# 1. Clone and enter directory
git clone <your-repo-url>
cd pattonpestcontrol

# 2. Install dependencies
npm install

# 3. Copy env file
cp .env.example .env
# Edit .env and set a real ADMIN_TOKEN value

# 4. Create the database
npm run db:push

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable       | Description                                  | Default                |
|----------------|----------------------------------------------|------------------------|
| `DATABASE_URL` | Path to the SQLite database file             | `file:./dev.db`        |
| `ADMIN_TOKEN`  | Secret token for the admin stats endpoint    | `change-me-to-a-secret`|

## Deploying to Vercel

1. Push your code to GitHub
2. Import the repository on [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard:
   - `DATABASE_URL` — for production, consider switching to Postgres (e.g., Vercel Postgres or Supabase) and updating `schema.prisma`
   - `ADMIN_TOKEN` — a long random secret
4. Deploy!

> **Note:** SQLite works for local dev but is not persistent on Vercel's serverless functions. For production use a hosted database like Vercel Postgres, PlanetScale, or Supabase and change the Prisma provider to `postgresql`.

## Admin Stats Endpoint

Get prize distribution data:

```bash
curl "https://your-domain.com/api/admin/stats?token=YOUR_ADMIN_TOKEN"
```

Or with a header:
```bash
curl -H "x-admin-token: YOUR_ADMIN_TOKEN" https://your-domain.com/api/admin/stats
```

Response:
```json
{
  "totalTickets": 42,
  "byPrize": [
    { "prize": "No prize", "count": 29 },
    { "prize": "$5 off", "count": 9 },
    { "prize": "$25 off", "count": 3 },
    { "prize": "Free service", "count": 1 }
  ]
}
```

## Limitations

- **One play per day** is enforced via `localStorage` — clearing browser storage allows replaying. For stricter enforcement, add IP-based rate limiting or user authentication.
- **SQLite** is not suitable for high-traffic production deployments. Migrate to PostgreSQL for production.
pest control
