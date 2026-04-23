# Agentic Lead Arbitrage - Production Deployment Guide

## Pre-Deployment Checklist

### Stripe Integration
- [ ] Claim Stripe sandbox at: https://dashboard.stripe.com/claim_sandbox/YWNjdF8xVE5XTkFJTzdieWlPd3dmLDE3NzcyOTIxNjAv100K19uxnVP
- [ ] Verify `STRIPE_SECRET_KEY` is set in environment
- [ ] Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set in environment
- [ ] Verify `STRIPE_WEBHOOK_SECRET` is set in environment
- [ ] Test payment flow with test card: `4242 4242 4242 4242`
- [ ] Verify webhook events are being received and processed
- [ ] Test failed payment scenarios with test card: `4000 0000 0000 0002`

### Database
- [ ] Verify MySQL/TiDB database connection is stable
- [ ] Run all migrations: `pnpm drizzle-kit migrate`
- [ ] Verify all tables are created correctly
- [ ] Test database backups are working
- [ ] Verify connection pooling is configured
- [ ] Test failover scenarios

### Lead Lists
- [ ] Seed initial lead lists: `NODE_ENV=production node scripts/seed-lead-lists.mjs`
- [ ] Verify lead list CSV files are uploaded to S3
- [ ] Test CSV file download links work correctly
- [ ] Verify download link expiration (24 hours)
- [ ] Test file access logging

### Security
- [ ] Enable HTTPS for all connections
- [ ] Configure CORS properly for your domain
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)
- [ ] Enable rate limiting on API endpoints
- [ ] Configure firewall rules
- [ ] Enable DDoS protection
- [ ] Set up security headers (CSP, X-Frame-Options, etc.)
- [ ] Verify no sensitive data in logs
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention

### Performance
- [ ] Enable caching headers for static assets
- [ ] Configure CDN for static file delivery
- [ ] Optimize database queries
- [ ] Enable database query caching
- [ ] Test page load times
- [ ] Verify bundle sizes are optimized
- [ ] Test under load (100+ concurrent users)
- [ ] Monitor memory usage
- [ ] Monitor CPU usage
- [ ] Set up auto-scaling if needed

### Monitoring & Logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure application logging
- [ ] Set up performance monitoring
- [ ] Configure uptime monitoring
- [ ] Set up alerting for critical errors
- [ ] Enable transaction logging for orders
- [ ] Configure log retention policies
- [ ] Test log aggregation

### Testing
- [ ] Run all unit tests: `pnpm test`
- [ ] Run integration tests
- [ ] Test complete payment flow end-to-end
- [ ] Test order creation and delivery
- [ ] Test email notifications
- [ ] Test dashboard functionality
- [ ] Test admin features
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test with accessibility tools

### Documentation
- [ ] Update README with production URLs
- [ ] Document environment variables
- [ ] Document deployment process
- [ ] Document rollback procedures
- [ ] Document incident response procedures
- [ ] Create runbook for common issues
- [ ] Document backup and recovery procedures

### Backups & Recovery
- [ ] Set up automated database backups
- [ ] Test backup restoration
- [ ] Document backup retention policy
- [ ] Set up file storage backups
- [ ] Test disaster recovery plan
- [ ] Document RTO and RPO

## Deployment Steps

### 1. Environment Setup

```bash
# Set production environment variables
export NODE_ENV=production
export DATABASE_URL=<production-database-url>
export STRIPE_SECRET_KEY=<production-stripe-key>
export VITE_STRIPE_PUBLISHABLE_KEY=<production-stripe-key>
export STRIPE_WEBHOOK_SECRET=<production-webhook-secret>
export JWT_SECRET=<strong-random-secret>
export OAUTH_SERVER_URL=<oauth-url>
export VITE_OAUTH_PORTAL_URL=<oauth-portal-url>
```

### 2. Build Application

```bash
cd /home/ubuntu/agentic-lead-arbitrage
pnpm install
pnpm build
```

### 3. Run Migrations

```bash
pnpm drizzle-kit migrate
```

### 4. Seed Initial Data

```bash
NODE_ENV=production node scripts/seed-lead-lists.mjs
```

### 5. Start Server

```bash
NODE_ENV=production node dist/index.js
```

### 6. Verify Deployment

- [ ] Landing page loads correctly
- [ ] Purchase flow works end-to-end
- [ ] Stripe payments process successfully
- [ ] Orders appear in dashboard
- [ ] Download links work
- [ ] Notifications are sent
- [ ] Admin pages are accessible

## Post-Deployment

### Monitoring
- Monitor error rates and response times
- Check database performance
- Verify Stripe webhook delivery
- Monitor S3 file access
- Check email delivery rates

### Optimization
- Analyze user behavior with analytics
- Identify slow pages
- Optimize database queries
- Cache frequently accessed data
- Compress assets

### Maintenance
- Regular security updates
- Database maintenance (VACUUM, ANALYZE)
- Log rotation and cleanup
- Backup verification
- Disaster recovery drills

## Rollback Procedure

If issues occur after deployment:

```bash
# Stop current deployment
systemctl stop agentic-lead-arbitrage

# Restore previous version
git checkout <previous-version>

# Rebuild and restart
pnpm build
NODE_ENV=production node dist/index.js

# Verify services are running
curl https://your-domain.com/health
```

## Scaling Considerations

### Horizontal Scaling
- Stateless API design allows multiple instances
- Use load balancer to distribute traffic
- Configure database connection pooling
- Use Redis for session storage if needed

### Database Scaling
- Monitor query performance
- Add indexes for frequently queried columns
- Consider read replicas for reporting
- Archive old orders to separate storage

### File Storage Scaling
- S3 automatically scales
- Monitor storage costs
- Implement lifecycle policies for old files
- Consider CloudFront for CDN

## Disaster Recovery

### Recovery Time Objectives (RTO)
- Critical systems: < 1 hour
- Non-critical systems: < 4 hours

### Recovery Point Objectives (RPO)
- Database: < 15 minutes
- Files: < 1 hour

### Backup Strategy
- Daily automated backups
- Weekly full backups
- Monthly archive backups
- Test restoration monthly

## Security Hardening

### Application Security
- Keep dependencies updated
- Run security audits regularly
- Implement rate limiting
- Use Web Application Firewall (WAF)
- Enable DDoS protection

### Data Security
- Encrypt data in transit (HTTPS)
- Encrypt data at rest
- Implement access controls
- Audit user access
- Implement data retention policies

### Operational Security
- Restrict SSH access
- Use VPN for admin access
- Implement 2FA for admin accounts
- Audit all admin actions
- Rotate credentials regularly

## Performance Targets

| Metric | Target |
|--------|--------|
| Page Load Time | < 2 seconds |
| API Response Time | < 200ms |
| Database Query Time | < 100ms |
| Uptime | 99.9% |
| Error Rate | < 0.1% |

## Support & Troubleshooting

### Common Issues

**Payment not processing:**
- Check Stripe API keys
- Verify webhook endpoint is accessible
- Check database connection
- Review Stripe Dashboard for errors

**Orders not appearing in dashboard:**
- Verify webhook is receiving events
- Check database for order records
- Review application logs
- Verify user role is admin

**Download links not working:**
- Verify S3 credentials
- Check file permissions
- Verify link hasn't expired
- Check browser console for errors

**Performance degradation:**
- Check database query performance
- Monitor server resource usage
- Check for memory leaks
- Review recent code changes

---

**Last Updated:** April 22, 2026  
**Status:** Ready for Production Deployment
