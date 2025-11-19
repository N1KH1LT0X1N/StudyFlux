# StudyFlux Deployment Guide

This guide will help you deploy StudyFlux to production.

## 🚀 Quick Deploy to Vercel (Recommended)

### Prerequisites
1. GitHub account with StudyFlux repository
2. Vercel account (free tier works)
3. Supabase account (free tier works)
4. Google Cloud account (for Gemini API)

### Step 1: Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize (~2 minutes)
3. Go to **Settings** → **Database** and copy the **Connection String** (URI format)
4. Go to **Settings** → **API** and copy:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_ANON_KEY` (anon/public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role key - keep secret!)
5. Go to **Storage** and create two buckets:
   - `documents` (public)
   - `avatars` (public)

### Step 2: Setup Database Schema

On your local machine:

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your Supabase DATABASE_URL to .env.local
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Push Prisma schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed achievements
npx ts-node prisma/seed-achievements.ts
```

### Step 3: Setup Google Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key (starts with `AIza...`)

### Step 4: Setup Google OAuth (for Login)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.vercel.app/api/auth/callback/google` (production)
7. Copy **Client ID** and **Client Secret**

### Step 5: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Import Project** → **Import Git Repository**
3. Select your StudyFlux repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add **Environment Variables**:

```bash
# Database
DATABASE_URL="your-supabase-connection-string"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google AI (Gemini)
GOOGLE_AI_API_KEY="your-gemini-api-key"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-key"
```

6. Click **Deploy**
7. Wait 2-3 minutes for build to complete
8. Your app is live! 🎉

### Step 6: Post-Deployment Setup

1. Visit your deployed app
2. Create an account and test:
   - Sign up with email/password
   - Upload a document
   - Generate summary
   - Generate flashcards
   - Review flashcards
   - Check achievements
3. Monitor logs in Vercel dashboard for any errors

---

## 🐳 Docker Deployment (Alternative)

### Prerequisites
- Docker and Docker Compose installed
- PostgreSQL database (or use Docker Compose)

### Step 1: Create Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: studyflux
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/studyflux
      NEXTAUTH_SECRET: your-secret-here
      NEXTAUTH_URL: http://localhost:3000
      GOOGLE_CLIENT_ID: your-client-id
      GOOGLE_CLIENT_SECRET: your-client-secret
      GOOGLE_AI_API_KEY: your-gemini-key
      NEXT_PUBLIC_SUPABASE_URL: your-supabase-url
      NEXT_PUBLIC_SUPABASE_ANON_KEY: your-supabase-key
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### Step 3: Deploy

```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma db push

# Seed achievements
docker-compose exec app npx ts-node prisma/seed-achievements.ts

# View logs
docker-compose logs -f app
```

---

## 🔧 Manual Server Deployment

### Prerequisites
- Ubuntu 20.04+ server
- Node.js 20+
- PostgreSQL 15+
- Nginx
- PM2

### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### Step 2: Setup Database

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE studyflux;
CREATE USER studyflux_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE studyflux TO studyflux_user;
\q
```

### Step 3: Clone & Setup Application

```bash
# Clone repository
cd /var/www
git clone https://github.com/N1KH1LT0X1N/StudyFlux.git
cd StudyFlux

# Install dependencies
npm install

# Create .env.local
nano .env.local
# Add all environment variables (see Vercel example)

# Run migrations
npx prisma db push
npx prisma generate

# Seed achievements
npx ts-node prisma/seed-achievements.ts

# Build application
npm run build
```

### Step 4: Setup PM2

```bash
# Start with PM2
pm2 start npm --name "studyflux" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 5: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/studyflux
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/studyflux /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Setup SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 📊 Post-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Database migrations applied
- [ ] Achievements seeded
- [ ] Google OAuth callback URLs configured
- [ ] Supabase storage buckets created
- [ ] SSL certificate installed (production)
- [ ] Error monitoring setup (Sentry optional)
- [ ] Analytics configured (Vercel Analytics)
- [ ] Backup strategy for database
- [ ] Test user signup and login
- [ ] Test document upload
- [ ] Test flashcard generation
- [ ] Test quiz generation
- [ ] Monitor error logs

---

## 🔍 Troubleshooting

### Build Fails
- Check all environment variables are set
- Ensure DATABASE_URL is accessible from build environment
- Check Node.js version (requires 18+)

### Database Connection Errors
- Verify DATABASE_URL format is correct
- Check database is accessible from deployment environment
- Ensure Prisma schema is pushed: `npx prisma db push`

### OAuth Login Fails
- Verify NEXTAUTH_URL matches your domain
- Check Google OAuth redirect URIs include your domain
- Ensure NEXTAUTH_SECRET is set (generate with `openssl rand -base64 32`)

### File Upload Fails
- Check Supabase storage buckets exist
- Verify bucket policies allow public uploads
- Ensure SUPABASE_SERVICE_ROLE_KEY is correct

### AI Features Not Working
- Verify GOOGLE_AI_API_KEY is valid
- Check API quota limits in Google Cloud Console
- Ensure API key has Gemini AI enabled

---

## 📈 Monitoring & Maintenance

### Logs
```bash
# Vercel: Check deployment logs in dashboard
# PM2: pm2 logs studyflux
# Docker: docker-compose logs -f app
```

### Database Backups
```bash
# PostgreSQL backup
pg_dump -U studyflux_user studyflux > backup.sql

# Restore
psql -U studyflux_user studyflux < backup.sql
```

### Updates
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Run migrations
npx prisma db push

# Rebuild
npm run build

# Restart (PM2)
pm2 restart studyflux

# Restart (Docker)
docker-compose up -d --build
```

---

## 🎉 Success!

Your StudyFlux application is now deployed and ready for users! Share the URL and start helping students learn better.

For support, visit: https://github.com/N1KH1LT0X1N/StudyFlux/issues
