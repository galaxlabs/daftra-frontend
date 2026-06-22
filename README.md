# Daftra Frontend

Standalone React/Vite operations frontend for the Daftra Frappe v15 app.

## Local

```bash
npm install
npm run dev
```

Local Vite does not execute the Vercel function. Use `vercel dev` for full API proxy testing, or deploy to Vercel.

## Vercel

Set `DAFTRA_BACKEND_URL=https://daftra.galaxylabs.online`. The application asks each user for their Frappe API key and secret; credentials remain in browser local storage and are forwarded through the allowlisted serverless proxy.
