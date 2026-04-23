# Agentic Lead Arbitrage - Setup & Testing Guide

## Overview

This guide walks you through setting up the Agentic Lead Arbitrage platform for production use, including Stripe integration, S3 file storage, and end-to-end testing.

## Prerequisites

- Manus project initialized with database, server, and user features
- Stripe sandbox provisioned (claim at the link provided)
- S3 storage configured (automatic via Manus)
- Node.js and pnpm installed

## Step 1: Claim Your Stripe Sandbox

**Timeline:** Must be completed before June 19, 2026

1. Visit: https://dashboard.stripe.com/claim_sandbox/YWNjdF8xVE5XTkFJTzdieWlPd3dmLDE3NzcyOTIxNjAv100K19uxnVP
2. Complete the Stripe account setup process
3. Verify that `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` are automatically configured in your environment

**Verification:**
```bash
echo $STRIPE_SECRET_KEY
echo $VITE_STRIPE_PUBLISHABLE_KEY
```

If these are set, you're ready to proceed.

## Step 2: Initialize Lead Lists

### Option A: Use the Seed Script (Recommended)

The seed script creates three default lead lists in your database:

```bash
cd /home/ubuntu/agentic-lead-arbitrage
NODE_ENV=development node scripts/seed-lead-lists.mjs
```

**Output:**
```
✓ Created lead list: Tech Recruiters - Q1 2026
✓ Created lead list: Sales Leaders - Enterprise
✓ Created lead list: Product Managers - Startups
✓ Seed completed successfully!
```

### Option B: Upload Custom CSV Files

If you have your own lead list CSV files:

1. Place them in `/home/ubuntu/webdev-static-assets/`
2. Update the file paths in `scripts/upload-lead-lists.mjs`
3. Run the upload script:

```bash
NODE_ENV=development node scripts/upload-lead-lists.mjs
```

**CSV Format Requirements:**

Your CSV must include these columns (at minimum):
- `company_name` - Name of the company
- `contact_name` - Full name of the contact
- `email` - Email address (verified)
- `phone` - Phone number
- `title` - Job title
- `company_size` - Number of employees
- `hiring_intent` - High/Very High/Medium
- `location` - City and state
- `industry` - Industry classification
- `linkedin_url` - LinkedIn profile URL

Example row:
```
TechCorp Solutions,Sarah Chen,sarah.chen@techcorp.com,+1-415-555-0101,Senior Recruiting Manager,500-1000,High,San Francisco CA,Software,https://linkedin.com/in/sarahchen
```

## Step 3: Verify Database Setup

Check that lead lists were created successfully:

```bash
# Connect to your database and run:
SELECT id, title, leadCount, price FROM lead_lists;
```

Expected output:
```
| id | title                        | leadCount | price |
|----|------------------------------|-----------|-------|
| 1  | Tech Recruiters - Q1 2026    | 50        | 60.00 |
| 2  | Sales Leaders - Enterprise   | 50        | 60.00 |
| 3  | Product Managers - Startups  | 50        | 60.00 |
```

## Step 4: Test the Payment Flow

### 4.1 Start the Development Server

```bash
cd /home/ubuntu/agentic-lead-arbitrage
pnpm dev
```

The server should start at: `https://3000-[unique-id].manus.computer`

### 4.2 Test as a Buyer

1. **Navigate to the landing page** - You should see the hero section with "High-Intent Leads, Instantly Enriched"
2. **Click "Buy Lead Lists"** - This takes you to the purchase page
3. **Enter buyer information:**
   - Email: `test@example.com`
   - Name: `Test Buyer`
4. **Click "Proceed to Checkout"** - Redirects to Stripe Checkout
5. **Use Stripe test card:**
   - Card Number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - Postal Code: Any 5 digits (e.g., 12345)
6. **Complete payment** - You should be redirected to the delivery page

### 4.3 Verify Order Creation

Check that the order was created in your database:

```bash
SELECT id, buyerEmail, amount, status, createdAt FROM orders ORDER BY createdAt DESC LIMIT 1;
```

Expected output:
```
| id | buyerEmail       | amount | status    | createdAt           |
|----|------------------|--------|-----------|---------------------|
| 1  | test@example.com | 60.00  | completed | 2026-04-22 12:00:00 |
```

### 4.4 Test the Delivery Page

After successful payment, you should see:
- Order confirmation with all details
- "Download Your Lead List" button
- CSV file download link (time-limited, 24-hour expiration)

Click the download button to verify the CSV file downloads correctly.

## Step 5: Test the Owner Dashboard

### 5.1 Access the Dashboard

1. Navigate to the application
2. Click "Dashboard" in the top navigation
3. You should see a login prompt (if not already authenticated as owner)

### 5.2 Verify Dashboard Displays

The dashboard should show:
- **Total Revenue:** $60.00 (from your test purchase)
- **Day 14 Goal:** Progress toward your 14-day profit target
- **Day 30 Goal:** Progress toward your 30-day profit target
- **Orders Table:** Your test order with all details (buyer email, amount, date, status)

### 5.3 Test Owner Notifications

When a purchase is completed, you should receive an owner notification containing:
- Buyer name and email
- Purchase amount ($60.00)
- Purchase date and time
- Lead list purchased

Check the Manus notification center for this message.

## Step 6: Run All Tests

Verify that all unit and integration tests pass:

```bash
cd /home/ubuntu/agentic-lead-arbitrage
pnpm test
```

Expected output:
```
✓ server/auth.logout.test.ts (1 test)
✓ server/orders.test.ts (3 tests)
✓ server/stripe-integration.test.ts (8 tests)

Test Files  3 passed (3)
     Tests  12 passed (12)
```

## Step 7: Test Multiple Purchases

Repeat the payment flow 2-3 more times with different test emails to verify:

1. Multiple orders appear in the dashboard
2. Revenue totals accumulate correctly
3. Day 14 and Day 30 goals update based on purchase dates
4. Each buyer receives their own secure download link

## Troubleshooting

### Stripe Webhook Not Receiving Events

**Problem:** Orders not being created after payment

**Solution:**
1. Check that the webhook route is registered before `express.json()` in `server/_core/index.ts`
2. Verify webhook signature verification is enabled
3. Check Stripe Dashboard → Developers → Webhooks for event delivery logs

### CSV Download Link Expired

**Problem:** "Link expired" error when trying to download

**Expected Behavior:** Download links expire after 24 hours. This is intentional for security.

**Solution:** Create a new order to get a fresh download link.

### Orders Not Appearing in Dashboard

**Problem:** Payment completed but order not visible in dashboard

**Solution:**
1. Verify you're logged in as the owner (admin role)
2. Check database: `SELECT * FROM orders;`
3. Verify webhook was triggered: Check Stripe Dashboard webhooks
4. Restart the server: `pnpm dev`

### S3 Storage Issues

**Problem:** "Storage not available" error

**Solution:**
1. Verify `BUILT_IN_FORGE_API_KEY` and `BUILT_IN_FORGE_API_URL` are set
2. Check that lead list records have valid `csvFileKey` values
3. Restart the server

## Production Deployment

Once you've tested everything successfully:

1. **Create a final checkpoint** - Save the current state
2. **Update lead lists** - Replace test data with real lead lists
3. **Configure Stripe live keys** - After Stripe KYC verification
4. **Set up custom domain** - Use Manus domain management
5. **Enable analytics** - Track visitor and conversion metrics
6. **Monitor orders** - Set up alerts for new purchases

## Key Files Reference

| File | Purpose |
|------|---------|
| `client/src/pages/Home.tsx` | Landing page with hero section |
| `client/src/pages/Purchase.tsx` | Lead list purchase form |
| `client/src/pages/Dashboard.tsx` | Owner dashboard with analytics |
| `client/src/pages/Delivery.tsx` | Post-purchase delivery page |
| `server/routers.ts` | tRPC procedures for orders and checkout |
| `server/stripe-webhook.ts` | Stripe webhook handler |
| `drizzle/schema.ts` | Database schema |
| `scripts/seed-lead-lists.mjs` | Initialize default lead lists |
| `scripts/upload-lead-lists.mjs` | Upload custom CSV files to S3 |

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Stripe Dashboard for webhook events
3. Check application logs: `.manus-logs/devserver.log`
4. Verify database connection: `SELECT 1;`

---

**Last Updated:** April 22, 2026
**Status:** Production Ready (pending Stripe sandbox claim)
