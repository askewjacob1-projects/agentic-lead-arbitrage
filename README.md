# Agentic Lead Arbitrage

A production-ready lead list marketplace platform that sells enriched lead data to recruiters with automated delivery, payment processing, and comprehensive analytics.

## Overview

Agentic Lead Arbitrage is a sophisticated SaaS application that enables you to monetize enriched lead lists. The platform handles the complete lifecycle from lead list management through secure delivery with full visibility into orders and revenue metrics.

**Key Features:**
- Public landing page with blueprint-inspired design
- Secure Stripe payment integration ($60 per 50-lead CSV)
- Owner dashboard with KPI tracking and profit goals
- Advanced analytics with charts and reporting
- Buyer order tracking and secure downloads
- Lead list management interface
- Automated owner notifications
- Time-limited download links (24-hour expiration)
- Role-based access control

## Tech Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- Wouter for routing
- Recharts for data visualization
- Shadcn/ui components
- Vite for bundling

**Backend:**
- Express.js for API
- tRPC for type-safe procedures
- Drizzle ORM for database
- MySQL/TiDB for data storage
- Stripe for payments
- AWS S3 for file storage
- Manus OAuth for authentication

**Testing:**
- Vitest for unit tests
- 12 comprehensive test cases

## Project Structure

```
agentic-lead-arbitrage/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # Utilities and hooks
│   │   └── App.tsx           # Main app component
│   └── public/               # Static assets
├── server/                    # Express backend
│   ├── routers.ts            # tRPC procedures
│   ├── db.ts                 # Database helpers
│   ├── stripe-webhook.ts     # Webhook handler
│   └── _core/                # Framework code
├── drizzle/                   # Database schema
│   └── schema.ts             # Table definitions
├── scripts/                   # Utility scripts
│   ├── seed-lead-lists.mjs   # Initialize lead lists
│   └── upload-lead-lists.mjs # Upload CSV files
├── SETUP_GUIDE.md            # Detailed setup instructions
├── QUICK_START.md            # 5-minute quick start
├── DEPLOYMENT.md             # Production deployment guide
├── FEATURES.md               # Complete features list
└── package.json              # Dependencies

```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MySQL/TiDB database
- Stripe account (sandbox for testing)
- AWS S3 bucket (for file storage)

### Quick Start (5 minutes)

1. **Claim Stripe Sandbox** (Required)
   ```
   https://dashboard.stripe.com/claim_sandbox/YWNjdF8xVE5XTkFJTzdieWlPd3dmLDE3NzcyOTIxNjAv100K19uxnVP
   ```

2. **Start Development Server**
   ```bash
   cd /home/ubuntu/agentic-lead-arbitrage
   pnpm dev
   ```

3. **Seed Lead Lists**
   ```bash
   NODE_ENV=development node scripts/seed-lead-lists.mjs
   ```

4. **Test Payment Flow**
   - Visit landing page at `https://3000-[unique-id].manus.computer`
   - Click "Buy Lead Lists"
   - Use test card: `4242 4242 4242 4242`
   - Verify order appears in dashboard

For detailed instructions, see [QUICK_START.md](QUICK_START.md)

## Key Pages

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` | Public homepage with hero section |
| Purchase | `/purchase` | Lead list checkout |
| My Orders | `/orders` | Buyer order history |
| Delivery | `/delivery` | Download CSV files |
| Dashboard | `/dashboard` | Owner KPI tracking |
| Admin | `/admin` | Order analytics |
| Analytics | `/analytics` | Advanced reporting |
| Manage Leads | `/manage-leads` | Lead list inventory |

## Configuration

### Environment Variables

The following environment variables are automatically configured:

- `DATABASE_URL` - MySQL connection string
- `STRIPE_SECRET_KEY` - Stripe API key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_WEBHOOK_SECRET` - Webhook verification key
- `JWT_SECRET` - Session signing secret
- `OAUTH_SERVER_URL` - Manus OAuth endpoint
- `VITE_OAUTH_PORTAL_URL` - Manus login portal

### Database Schema

**Users Table**
- Stores user information and roles
- Admin role for owner access
- User role for buyers

**Lead Lists Table**
- Inventory of available lead lists
- Price per list ($60 default)
- Lead count and CSV file reference

**Orders Table**
- Purchase records with buyer info
- Payment status tracking
- Stripe payment intent ID
- Order creation and update timestamps

**Order Downloads Table**
- Download tracking
- Link expiration management
- Access logging

## Features

### Public Features
- Landing page with blueprint aesthetic
- Lead list showcase with pricing
- Secure Stripe checkout
- Order confirmation
- CSV file download with time-limited links

### Buyer Features
- Order history and tracking
- Download management
- Order details and receipts
- Account information

### Owner Features
- Dashboard with KPI cards
- Revenue tracking
- Day 14 and Day 30 profit goals
- Order analytics and charts
- Lead list management
- Advanced reporting
- Data export

## Testing

Run all tests:
```bash
pnpm test
```

Test coverage includes:
- Order creation and retrieval
- Stripe webhook handling
- Payment status transitions
- Notification content
- Authentication and authorization

## Deployment

For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md)

**Quick Deployment Checklist:**
1. Claim Stripe sandbox
2. Configure environment variables
3. Run database migrations
4. Seed initial lead lists
5. Build and start server
6. Verify payment flow
7. Monitor logs and metrics

## Documentation

- **[QUICK_START.md](QUICK_START.md)** - 5-minute rapid start guide
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[FEATURES.md](FEATURES.md)** - Complete features documentation
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide

## Security

- HTTPS encryption for all communications
- Secure Stripe webhook verification
- Time-limited download links (24-hour expiration)
- Role-based access control
- Session-based authentication
- SQL injection prevention via ORM
- XSS protection via React escaping

## Performance

- Optimized database queries
- Caching for frequently accessed data
- Lazy loading of components
- CSS and JavaScript minification
- CDN-ready static assets
- Responsive design for all devices

## Support & Troubleshooting

### Common Issues

**Payment not processing:**
- Verify Stripe keys are configured
- Check webhook endpoint is accessible
- Review Stripe Dashboard for errors

**Orders not appearing:**
- Verify webhook is receiving events
- Check database connection
- Review application logs

**Download links not working:**
- Verify S3 credentials
- Check file permissions
- Verify link hasn't expired

For more help, see [SETUP_GUIDE.md](SETUP_GUIDE.md) troubleshooting section.

## Contributing

To contribute to this project:
1. Create a feature branch
2. Make your changes
3. Run tests: `pnpm test`
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions:
1. Check the documentation files
2. Review the troubleshooting section
3. Check application logs in `.manus-logs/`
4. Contact support at support@agentic-lead-arbitrage.com

---

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** April 22, 2026

**Next Steps:**
1. Claim your Stripe sandbox
2. Run the quick start guide
3. Test the payment flow
4. Deploy to production

**Questions?** See [SETUP_GUIDE.md](SETUP_GUIDE.md) or [QUICK_START.md](QUICK_START.md)
