# 🚀 Deployment Guide: Netlify

This guide outlines the steps to deploy the **Stylr SA** frontend to Netlify and migrate your domain.

## 1. Prerequisites
- [x] **Netlify Account**: Create one at [netlify.com](https://www.netlify.com/).
- [x] **Git Repository**: Your code must be pushed to GitHub/GitLab.

## 2. Netlify Setup

1.  Log in to the **Netlify Dashboard**.
2.  Click **"Add new site"** > **"Import from an existing project"**.
3.  Select **GitHub** (or your Git provider).
4.  Pick your repository (`hairprosdirectory` or `thesalonhub-monorepo`).

## 3. Build Configuration

Netlify should detect the settings automatically from the `netlify.toml` file. Verify them:

| Setting | Value |
| :--- | :--- |
| **Base directory** | `frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `.next` |

## 4. Environment Variables

Go to **Site configuration > Environment variables** and add these. **These are critical for the site to function correctly.**

| Variable | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | `https://www.stylrsa.co.za` | Your custom domain (or Netlify URL initially) |
| `NEXT_PUBLIC_API_URL` | `https://stylrsa.onrender.com` | Backend URL for server-side fetching |
| `NEXT_PUBLIC_API_ORIGIN` | `https://stylrsa.onrender.com` | Backend URL for client-side proxying |
| `NEXT_PUBLIC_WS_URL` | `https://stylrsa.onrender.com` | **Critical:** WebSocket URL for chat/notifications |
| `NEXTAUTH_URL` | `https://www.stylrsa.co.za` | URL where the site is hosted (update this after adding domain) |
| `NEXTAUTH_SECRET` | `(generate a random string)` | **Critical:** Run `openssl rand -base64 32` to generate |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `(your cloud name)` | Required for images |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | `(your api key)` | Required for uploads |
| `GOOGLE_ID` | `(your google client id)` | Required for Google Login |
| `GOOGLE_SECRET` | `(your google client secret)` | Required for Google Login |

## 5. Deploy

1.  Click **Deploy**.
2.  Netlify will build your site. It usually takes 2-3 minutes.

## 6. Domain Migration (Vercel to Netlify)

Since your domain is currently on Vercel, follow these steps to move it to Netlify without downtime.

### Step 1: Remove from Vercel (Recommended)
1.  Log in to **Vercel**.
2.  Go to your project **Settings > Domains**.
3.  Find `stylrsa.co.za` and click **Remove**.
    *   *Note: This stops Vercel from trying to serve the domain, preventing conflicts.*

### Step 2: Add to Netlify
1.  Log in to **Netlify**.
2.  Go to **Site configuration > Domain management**.
3.  Click **Add a domain**.
4.  Enter `www.stylrsa.co.za` and click **Verify**.
5.  Click **Add domain**.

### Step 3: Update DNS
You have two options depending on how you manage your DNS.

**Option A: Netlify DNS (Easiest)**
1.  In Netlify Domain Management, click **"Set up Netlify DNS"**.
2.  Netlify will give you 4 nameservers (e.g., `dns1.p01.nsone.net`).
3.  Go to your **Domain Registrar** (where you bought the domain, e.g., GoDaddy, Namecheap).
4.  Replace your current nameservers with the 4 Netlify nameservers.
5.  *Propagation takes 1-24 hours.*

**Option B: External DNS (Keep current registrar)**
1.  Go to your **Domain Registrar** (or Cloudflare if you use it).
2.  Find your DNS records.
3.  Update the **CNAME** record for `www`:
    *   **Type**: `CNAME`
    *   **Name**: `www`
    *   **Value**: `[your-site-name].netlify.app` (e.g., `astounding-muffin-ab68e1.netlify.app`)
4.  Update/Add an **A Record** for the root (`@` or `stylrsa.co.za`):
    *   **Type**: `A`
    *   **Name**: `@`
    *   **Value**: `75.2.60.5` (Netlify Load Balancer)

### Step 4: Update Environment Variables
Once the domain is active:
1.  Go back to **Netlify > Site configuration > Environment variables**.
2.  Update `NEXT_PUBLIC_SITE_URL` to `https://www.stylrsa.co.za`.
3.  Update `NEXTAUTH_URL` to `https://www.stylrsa.co.za`.
4.  **Redeploy** the site for changes to take effect.
