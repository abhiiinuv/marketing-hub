# Marketing Hub

Internal marketing planning dashboard for your team. Track collabs, content, campaigns, and website traffic—with marketing events pinned on traffic charts.

## Stack

- **Next.js 15** (App Router, TypeScript, Tailwind)
- **Firebase Firestore** — real-time shared data
- **Recharts** — interactive traffic chart with event pins
- **Vercel** — free hosting

## Features

| Area | What you get |
|------|----------------|
| **Dashboard** | Upcoming events and quick stats |
| **Calendar** | Month view + timeline of all marketing by date |
| **YouTuber Collabs** | Creator, channel, type, cost, status, links, notes |
| **Collab Backlog** | Archive with performance notes |
| **Content Planner** | Tweets, video releases, in-house videos, campaigns |
| **Traffic** | CSV upload, metric picker, pins from all dated marketing events |

## Quick start (shared with Creatorboard)

Uses Firebase project **creatorboard-c3ae1** — same database, separate collections.

### 1. Environment

`.env.local` should mirror `creatorboard/.env` with `NEXT_PUBLIC_` prefixes (see `.env.local.example`).

### 2. Authentication

- **View**: no login required (calendar, collabs, traffic charts).
- **Edit**: Firebase **Email/Password** — same admin accounts as Creatorboard `/admin`.
- Enable: Firebase Console → **Authentication** → **Sign-in method** → **Email/Password** → Enable.
- Create users: **Authentication** → **Users** → Add user.

### 3. Firestore rules (deploy from Creatorboard folder)

Merged rules live in `creatorboard/firestore.rules` (Creatorboard + Marketing collections).

```bash
cd creatorboard
firebase deploy --only firestore:rules
```

Do **not** deploy open rules that omit Creatorboard paths.

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy to Vercel (free)

1. Push `marketing-hub` to GitHub.
2. Import the repo at [vercel.com](https://vercel.com).
3. Set root directory to `marketing-hub` if the repo contains multiple folders.
4. Add the same `NEXT_PUBLIC_FIREBASE_*` env vars in Vercel → Settings → Environment Variables.
5. Deploy.

## CSV format

Traffic uploads need a **date** column and one or more numeric metrics. Example:

```csv
date,sessions,users,pageviews
2025-01-01,1200,980,3400
```

See `sample-traffic.csv` for a test file. Marketing events appear as colored pins when their scheduled date matches a row in the CSV.

## Security

- Marketing data: **public read**, **write only when signed in** (`request.auth != null`).
- Creatorboard rules unchanged (`creators`, `weeklyStats`, `winners`).
- To limit marketing writes to specific emails, edit `isMarketingAdmin()` in `creatorboard/firestore.rules` with an email allowlist.

## Project structure

```
src/
  app/           # Pages (dashboard, calendar, collabs, backlog, content, traffic)
  components/    # UI by feature
  hooks/         # Real-time Firestore subscriptions
  lib/           # Firebase, types, CSV parser, calendar helpers
```
