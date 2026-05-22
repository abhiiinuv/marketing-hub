# Deploy Marketing Hub + manage admins

## Deploy to Vercel (public URL)

### Option A — Vercel website (easiest if CLI isn’t logged in)

1. Push `marketing-hub` to GitHub (see commands below).
2. Go to [vercel.com/new](https://vercel.com/new) → import the repo.
3. **Root Directory**: `marketing-hub` if the repo root is `creatorboard`.
4. **Environment Variables** — add all six (Production + Preview):

   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

   Copy values from `marketing-hub/.env.local`.

5. Click **Deploy**. Share the `*.vercel.app` URL with your team.

### Option B — Vercel CLI

```bash
cd marketing-hub
npx vercel login
npx vercel link
# Add env vars in Vercel dashboard → Project → Settings → Environment Variables
npx vercel --prod
```

## After deploy — Firebase Auth domains

1. [Firebase Console](https://console.firebase.google.com) → project **creatorboard-c3ae1**
2. **Authentication** → **Settings** → **Authorized domains**
3. Add your Vercel host, e.g. `marketing-hub-xxx.vercel.app` (and custom domain if you add one)

Without this, admin sign-in may fail on the live site.

## Add admin users (you do this in Firebase)

1. **Authentication** → **Sign-in method** → ensure **Email/Password** is **Enabled**
2. **Authentication** → **Users** → **Add user**
3. Enter each teammate’s **email** and a **temporary password**
4. Send them the login link; they use **Admin sign in** on the site with that email/password

Anyone with an account there can **edit** marketing data. Everyone else can **view only**.

Same users can sign into **Creatorboard** `/admin` if you use the same emails.

### Optional: reset password

**Users** → select user → **Reset password** or delete and recreate.

## Firestore rules (one-time)

If marketing saves fail in production:

```bash
cd ../creatorboard
firebase deploy --only firestore:rules
```
