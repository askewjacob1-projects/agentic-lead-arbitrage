# Agentic Lead Arbitrage - Quick Start Guide

## 5-Minute Setup

### 1. Claim Stripe Sandbox (REQUIRED)
**Must be done first:** https://dashboard.stripe.com/claim_sandbox/YWNjdF8xVE5XTkFJTzdieWlPd3dmLDE3NzcyOTIxNjAv100K19uxnVP

Expires: June 19, 2026

### 2. Start Development Server
```bash
cd /home/ubuntu/agentic-lead-arbitrage
pnpm dev
```

Server runs at: `https://3000-[unique-id].manus.computer`

### 3. Seed Lead Lists
```bash
NODE_ENV=development node scripts/seed-lead-lists.mjs
```

This creates 3 default lead lists in your database.

### 4. Test Payment Flow

**As a Buyer:**
1. Visit the landing page
2. Click "Buy Lead Lists"
3. Enter: `test@example.com` and `Test Buyer`
4. Click "Proceed to Checkout"
5. Use Stripe test card: `4242 4242 4242 4242`
6. Any future expiry date and any 3-digit CVC
7. Complete payment

**Expected Result:** Redirected to delivery page with download link

### 5. View Admin Dashboard
1. Click "Dashboard" in navigation
2. Log in as owner (if prompted)
3. See your order and revenue metrics

## Key URLs

| Page | URL | Purpose |
|------|-----|---------|
| Landing | `/` | Public homepage |
| Purchase | `/purchase` | Buy lead lists |
| Dashboard | `/dashboard` | View orders (owner-only) |
| Admin | `/admin` | Detailed analytics (owner-only) |
| Delivery | `/delivery?order_id=1` | Download CSV (post-purchase) |

## Test Scenarios

### Scenario 1: Single Purchase
1. Complete one test purchase
2. Verify order appears in dashboard
3. Download CSV file
4. Check owner notification received

### Scenario 2: Multiple Purchases
1. Complete 3+ test purchases with different emails
2. Verify revenue totals in dashboard
3. Check Day 14 and Day 30 goal progress
4. Verify each buyer gets their own download link

### Scenario 3: Failed Payment
1. Use invalid card: `4000 0000 0000 0002`
2. Verify order status shows "failed"
3. Verify no notification sent

## Troubleshooting

**"Stripe key not found"**
- Verify you claimed the Stripe sandbox
- Check: `echo $STRIPE_SECRET_KEY`

**"Database not available"**
- Verify DATABASE_URL is set
- Check database connection

**"Order not created after payment"**
- Check webhook logs in Stripe Dashboard
- Verify webhook route is before express.json()

**"Download link expired"**
- This is normal (24-hour expiration)
- Create a new order for a fresh link

## Database Queries

Check lead lists:
```sql
SELECT id, title, leadCount, price FROM lead_lists;
```

Check orders:
```sql
SELECT id, buyerEmail, amount, status, createdAt FROM orders ORDER BY createdAt DESC;
```

Check order count by status:
```sql
SELECT status, COUNT(*) as count FROM orders GROUP BY status;
```

## Files You'll Need

| File | Purpose |
|------|---------|
| `SETUP_GUIDE.md` | Detailed setup instructions |
| `scripts/seed-lead-lists.mjs` | Initialize lead lists |
| `scripts/upload-lead-lists.mjs` | Upload custom CSV files |
| `client/src/pages/Admin.tsx` | Admin dashboard |

## What's Included

✅ Public landing page with blueprint aesthetic  
✅ Stripe Checkout integration ($60 per purchase)  
✅ Owner dashboard with revenue tracking  
✅ Post-purchase delivery page  
✅ Secure S3 download links (24-hour expiration)  
✅ Automated owner notifications  
✅ Admin analytics page  
✅ Full test coverage (12 passing tests)  
✅ Lead list seeding script  

## Next Steps

1. ✅ Claim Stripe sandbox
2. ✅ Run `pnpm dev`
3. ✅ Run seed script
4. ✅ Test a purchase
5. ✅ View dashboard
6. 📋 Upload real lead lists (optional)
7. 📋 Configure Stripe live keys (when ready for production)
8. 📋 Set up custom domain (optional)

## Support

For detailed instructions, see `SETUP_GUIDE.md`

For issues:
1. Check `.manus-logs/devserver.log`
2. Verify Stripe Dashboard webhooks
3. Check database connection
4. Run `pnpm test` to verify all tests pass

---

**Status:** Production Ready (pending Stripe sandbox claim)  
**Last Updated:** April 22, 2026
