# FitForge AI - Production Deployment Guide

This document outlines the necessary configuration and steps to deploy the FitForge AI SaaS platform to a production environment (e.g., AWS, Heroku, Vercel/DigitalOcean).

## 1. Environment Variables (.env)

Ensure the following variables are set in your production backend environment:

### Core Configuration
- `NODE_ENV`: `production`
- `PORT`: `5000`
- `MONGO_URI`: Your production MongoDB connection string.
- `JWT_SECRET`: A long, random string for token signing.

### AI Engine (Gemini)
- `GEMINI_API_KEY`: Your Google Generative AI API key.

### Monetization (Stripe)
- `STRIPE_SECRET_KEY`: Your Stripe secret key (sk_live_...).
- `STRIPE_WEBHOOK_SECRET`: The secret provided by Stripe CLI or Dashboard for verifying webhooks.
- `FRONTEND_URL`: `https://your-frontend-domain.com`

### Email Service (SMTP)
- `SMTP_HOST`: e.g., `smtp.gmail.com`
- `SMTP_PORT`: `465` or `587`
- `SMTP_USER`: Your email address.
- `SMTP_PASS`: Your app-specific password.
- `EMAIL_FROM`: `noreply@fitforge.ai`

## 2. Backend Deployment

1. **Install Dependencies**: `npm install --production`
2. **Database Migration**: Ensure any existing user records are compatible with the new schema (defaults will be applied automatically by Mongoose).
3. **Start Server**: `npm start` (mapped to `node server.js`)

## 3. Frontend Deployment

1. **Build Project**: `npm run build` (generates the `dist/` folder).
2. **Hosting**: Deploy the `dist/` folder to a static hosting provider (Vercel, Netlify, or AWS S3).
3. **PWA Support**: Ensure the HTTPS protocol is used, otherwise the Service Worker will not register.

## 4. Post-Deployment Checklist
- [ ] Verify Stripe webhooks are pointing to `https://api.yourdomain.com/api/payments/webhook`.
- [ ] Test the AI Coach generation with a PRO user account.
- [ ] Verify `node-cron` jobs are running (see logs at 20:00 server time).
- [ ] Install the PWA on a mobile device to verify the Manifest and Service Worker.
