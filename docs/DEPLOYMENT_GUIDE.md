# SkillBridge Deployment, Infrastructure & Cost Modeling Guide

## 1. Hosting Architecture Options

SkillBridge is built on Next.js 16 (App Router) and can be deployed via two primary production architectures:

### Option A: Serverless & Managed PaaS (Recommended for rapid launch & minimal DevOps)
- **Frontend & API Runtime**: Vercel Enterprise / Pro (Fluid Compute, automatic edge scaling, zero idle costs).
- **Relational Database**: Supabase Pro or Neon Postgres with integrated Supavisor connection pooling.
- **Cache & Rate Limiting**: Upstash Redis (Serverless Redis, per-command pricing).
- **Object Storage**: Cloudflare R2 (Zero egress fees, S3 API compatible).
- **Monitoring & Error Tracking**: Sentry SaaS + BetterStack (Uptime & log drain).

### Option B: Cloud Native Containerized (AWS ECS / Kubernetes / Google Cloud Run)
- **Frontend & API Runtime**: AWS ECS Fargate or EKS (Dockerized Next.js standalone output).
- **Relational Database**: AWS Aurora Serverless v2 PostgreSQL (Multi-AZ, auto-scaling ACUs).
- **Cache**: AWS ElastiCache for Redis (m6g.large clustered).
- **Object Storage**: AWS S3 + CloudFront CDN.

---

## 2. Infrastructure Cost Modeling (100 vs 1,000 vs 5,000 Concurrent Users)

The following tables provide realistic, evidence-based monthly infrastructure cost estimates across varying scale milestones.

### Tier 1: 100 Concurrent Active Users (~2,000 Registered Students)
*Off-peak or early campus onboarding stage.*

| Component | Provider & Tier | Specifications | Monthly Cost (USD) |
|---|---|---|---|
| **Web / App Layer** | Vercel Pro | Serverless invocations + Edge CDN | $20 |
| **PostgreSQL Database** | Supabase Pro | 2 Core, 8 GB RAM, 100 GB storage | $25 |
| **Redis Cache** | Upstash Serverless | Pay-per-request (~2M requests/mo) | $5 |
| **Object Storage** | Cloudflare R2 | 50 GB storage, zero egress fees | $1 |
| **Monitoring & Sentry** | Sentry Developer / Free | 10k error events | $0 |
| **DNS & Edge WAF** | Cloudflare Free | Global CDN & DDoS protection | $0 |
| **Total Estimated Cost**| | | **~$51 / month** |

---

### Tier 2: 1,000 Concurrent Active Users (~5,000 Registered Students)
*Mid-tier traffic during active university placement weeks.*

| Component | Provider & Tier | Specifications | Monthly Cost (USD) |
|---|---|---|---|
| **Web / App Layer** | Vercel Pro + Team seats | 4 Team seats + Fluid Compute band | $100 |
| **PostgreSQL Database** | Supabase Pro + Compute Add-on | 4 Core, 16 GB RAM, 250 GB storage | $80 |
| **Redis Cache** | Upstash Pro / AWS ElastiCache | Dedicated single-node Redis | $30 |
| **Object Storage** | Cloudflare R2 | 250 GB storage, 500k read/writes | $5 |
| **Monitoring & Telemetry**| Sentry Team Tier | 100k error events + Performance APM | $26 |
| **DNS & Edge WAF** | Cloudflare Pro | Enhanced WAF rules & image optimization| $20 |
| **Total Estimated Cost**| | | **~$261 / month** |

---

### Tier 3: 4,000 – 5,000 Concurrent Active Users (10,000+ Registered Students)
*Target peak enterprise scale during simultaneous state-wide capstone submissions and campus hiring drives.*

| Component | Provider & Tier | Specifications | Monthly Cost (USD) |
|---|---|---|---|
| **Web / App Layer** | Vercel Enterprise or AWS ECS (6-10 pods) | 8x 2 vCPU / 4 GB RAM container replicas | $320 – $450 |
| **PostgreSQL Database** | AWS Aurora Serverless v2 or Supabase XL | 8–16 ACU PostgreSQL, Multi-AZ Read Replica | $250 – $380 |
| **Connection Pooling** | PgBouncer / Supavisor | Transaction mode, 5,000 client slots | Included ($0) |
| **Redis Cache** | AWS ElastiCache / Redis Enterprise | Clustered Redis (m6g.large), sub-ms latency | $75 – $120 |
| **Object Storage** | Cloudflare R2 / AWS S3 | 1 TB storage, 5 TB bandwidth (R2 zero egress) | $15 – $30 |
| **Monitoring & APM** | Sentry Business + Datadog APM | Full distributed tracing, real-time alerts | $90 – $150 |
| **DNS, WAF & DDoS** | Cloudflare Business Tier | Advanced DDoS shield, custom WAF rate limits | $200 |
| **Transactional Email** | Resend / AWS SES | 100,000 notifications / invites | $20 |
| **Total Estimated Cost**| | | **~$970 – $1,350 / month** |

*Cost per active student at 10,000 student scale: **$0.10 to $0.13 per student per month**.*

---

## 3. Step-by-Step Deployment Runbook

### Step 1: Database Provisioning
1. Provision a PostgreSQL 16 instance on Supabase or AWS Aurora.
2. Retrieve the pooled connection URL (`DATABASE_URL`) and direct migration URL (`DIRECT_URL`).
3. Apply schema:
   ```bash
   DATABASE_URL="postgres://..." npx prisma db push
   ```

### Step 2: Data Migration from JSON
Execute the migration ingestion script:
```bash
DATABASE_URL="postgres://..." node scripts/migrate_json_to_postgres.mjs
```

### Step 3: Environment Configuration
Populate production environment variables:
```env
NODE_ENV="production"
DATABASE_URL="postgresql://user:password@pooler.domain.com:6543/skillbridge?pgbouncer=true"
DIRECT_URL="postgresql://user:password@db.domain.com:5432/skillbridge"
REDIS_URL="rediss://default:token@cluster.upstash.io:6379"
CLOUDFLARE_R2_BUCKET="skillbridge-production-assets"
CLOUDFLARE_R2_ACCESS_KEY="<access_key>"
CLOUDFLARE_R2_SECRET_KEY="<secret_key>"
NEXT_PUBLIC_APP_URL="https://skillbridge.edu"
SENTRY_DSN="https://...@sentry.io/..."
```

### Step 4: Next.js Production Build Verification
```bash
npm run build
```
Verify zero build errors and optimized output bundles.

### Step 5: Smoke Testing & Traffic Cutover
1. Query `/api/health` to verify database latency (< 20ms) and health status.
2. Execute automated Playwright E2E verification (`node scripts/verify_full_system_audit.mjs`).
3. Route DNS traffic to the new production cluster.
