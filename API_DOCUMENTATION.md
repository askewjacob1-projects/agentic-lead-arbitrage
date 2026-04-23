# Agentic Lead Arbitrage - API Documentation

## Overview

The Agentic Lead Arbitrage API is built with tRPC, providing type-safe, end-to-end typed APIs. All communication happens through the `/api/trpc` endpoint with automatic serialization/deserialization.

## Authentication

All API calls require authentication via Manus OAuth. The session is maintained through secure HTTP-only cookies set during the OAuth callback.

**Public Procedures:** Available without authentication  
**Protected Procedures:** Require authenticated user  
**Admin Procedures:** Require admin role

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| Webhook | 1000 req/min | 1 minute |
| Checkout | 50 req/min | 1 minute |
| General API | 100 req/15min | 15 minutes |
| Auth | 10 req/min | 1 minute |
| Download | 20 req/min | 1 minute |

Rate limit information is returned in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## tRPC Procedures

### Authentication Procedures

#### `auth.me`
Get current authenticated user information.

**Type:** Public Query  
**Parameters:** None  
**Returns:**
```typescript
{
  id: number;
  openId: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  lastSignedIn: Date;
}
```

**Example:**
```typescript
const user = await trpc.auth.me.useQuery();
```

#### `auth.logout`
Log out the current user and clear session.

**Type:** Public Mutation  
**Parameters:** None  
**Returns:**
```typescript
{ success: true }
```

**Example:**
```typescript
const { mutate } = trpc.auth.logout.useMutation();
mutate();
```

### Order Procedures

#### `orders.createCheckoutSession`
Create a Stripe Checkout session for lead list purchase.

**Type:** Protected Mutation  
**Parameters:**
```typescript
{
  leadListId: number;
  returnUrl?: string; // Defaults to current origin
}
```

**Returns:**
```typescript
{
  checkoutUrl: string; // Stripe Checkout URL
  sessionId: string;   // Stripe session ID
}
```

**Example:**
```typescript
const { mutate } = trpc.orders.createCheckoutSession.useMutation();
mutate({ leadListId: 1 });
```

**Errors:**
- `NOT_FOUND`: Lead list not found
- `UNAUTHORIZED`: User not authenticated
- `INTERNAL_SERVER_ERROR`: Stripe API error

#### `orders.getAll`
Retrieve all orders (admin only) or user's orders (authenticated users).

**Type:** Protected Query  
**Parameters:** None  
**Returns:**
```typescript
[
  {
    id: number;
    buyerEmail: string;
    buyerName: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    leadListId: number;
    stripePaymentIntentId: string;
    createdAt: Date;
    updatedAt: Date;
  }
]
```

**Example:**
```typescript
const { data: orders } = trpc.orders.getAll.useQuery();
```

**Notes:**
- Admins see all orders
- Regular users see only their own orders
- Results are ordered by creation date (newest first)

#### `orders.getById`
Retrieve a specific order by ID.

**Type:** Protected Query  
**Parameters:**
```typescript
{
  id: number;
}
```

**Returns:**
```typescript
{
  id: number;
  buyerEmail: string;
  buyerName: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  leadListId: number;
  stripePaymentIntentId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example:**
```typescript
const { data: order } = trpc.orders.getById.useQuery({ id: 123 });
```

**Errors:**
- `NOT_FOUND`: Order not found
- `FORBIDDEN`: User doesn't have access to this order

#### `orders.getDownloadUrl`
Generate a time-limited download URL for a completed order.

**Type:** Protected Query  
**Parameters:**
```typescript
{
  orderId: number;
  expiresIn?: number; // Seconds, default 86400 (24 hours)
}
```

**Returns:**
```typescript
{
  downloadUrl: string; // Presigned S3 URL
  expiresAt: Date;
  leadCount: number;
  fileName: string;
}
```

**Example:**
```typescript
const { data } = trpc.orders.getDownloadUrl.useQuery({ orderId: 123 });
window.location.href = data.downloadUrl; // Trigger download
```

**Errors:**
- `NOT_FOUND`: Order not found
- `FORBIDDEN`: User doesn't have access
- `BAD_REQUEST`: Order not completed

### Lead List Procedures

#### `leadLists.getAll`
Retrieve all available lead lists.

**Type:** Public Query  
**Parameters:** None  
**Returns:**
```typescript
[
  {
    id: number;
    title: string;
    description: string;
    leadCount: number;
    price: number; // In cents
    fileKey: string;
    createdAt: Date;
    updatedAt: Date;
  }
]
```

**Example:**
```typescript
const { data: lists } = trpc.leadLists.getAll.useQuery();
```

#### `leadLists.create`
Create a new lead list (admin only).

**Type:** Admin Mutation  
**Parameters:**
```typescript
{
  title: string;
  description: string;
  leadCount: number;
  price: number;
  fileKey: string;
}
```

**Returns:**
```typescript
{
  id: number;
  title: string;
  leadCount: number;
  price: number;
  createdAt: Date;
}
```

**Example:**
```typescript
const { mutate } = trpc.leadLists.create.useMutation();
mutate({
  title: "Tech Recruiters Q2 2026",
  description: "High-intent tech hiring managers",
  leadCount: 50,
  price: 6000, // $60.00
  fileKey: "leads/tech-q2-2026.csv"
});
```

#### `leadLists.update`
Update an existing lead list (admin only).

**Type:** Admin Mutation  
**Parameters:**
```typescript
{
  id: number;
  title?: string;
  description?: string;
  leadCount?: number;
  price?: number;
}
```

**Returns:**
```typescript
{
  id: number;
  title: string;
  leadCount: number;
  price: number;
  updatedAt: Date;
}
```

#### `leadLists.delete`
Delete a lead list (admin only).

**Type:** Admin Mutation  
**Parameters:**
```typescript
{
  id: number;
}
```

**Returns:**
```typescript
{ success: true }
```

### System Procedures

#### `system.notifyOwner`
Send a notification to the owner (admin only).

**Type:** Admin Mutation  
**Parameters:**
```typescript
{
  title: string;
  content: string;
}
```

**Returns:**
```typescript
{ success: true }
```

**Example:**
```typescript
const { mutate } = trpc.system.notifyOwner.useMutation();
mutate({
  title: "New Order",
  content: "Order #123 for $60 from john@example.com"
});
```

## Webhooks

### Stripe Webhook Endpoint

**URL:** `/api/stripe/webhook`  
**Method:** POST  
**Content-Type:** application/json

The webhook handler processes Stripe events and creates orders automatically.

#### Supported Events

**`checkout.session.completed`**
Triggered when a customer completes checkout payment.

**Payload:**
```json
{
  "id": "evt_...",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_...",
      "payment_intent": "pi_...",
      "customer_email": "buyer@example.com",
      "metadata": {
        "client_reference_id": "1",
        "user_id": "1",
        "customer_email": "buyer@example.com",
        "customer_name": "John Doe"
      }
    }
  }
}
```

**Processing:**
1. Verifies webhook signature
2. Extracts order metadata
3. Creates order record in database
4. Sends owner notification
5. Returns 200 OK

**Response:**
```json
{ "verified": true }
```

**Error Responses:**
```json
{ "error": "Invalid signature" }
```

#### Testing Webhooks

Use Stripe CLI to test webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed
```

## Error Handling

All API errors follow a consistent format:

```typescript
{
  code: string; // Error code (e.g., 'NOT_FOUND', 'UNAUTHORIZED')
  message: string; // Human-readable error message
  data?: any; // Additional error data
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `PARSE_ERROR` | 400 | Request parsing failed |
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | User not authenticated |
| `FORBIDDEN` | 403 | User lacks permission |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

## Client Usage Examples

### React with tRPC

```typescript
import { trpc } from '@/lib/trpc';

function OrderList() {
  const { data: orders, isLoading } = trpc.orders.getAll.useQuery();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {orders?.map(order => (
        <div key={order.id}>
          <h3>{order.buyerName}</h3>
          <p>${(order.amount / 100).toFixed(2)}</p>
          <p>Status: {order.status}</p>
        </div>
      ))}
    </div>
  );
}
```

### Creating a Checkout Session

```typescript
function PurchaseButton({ leadListId }) {
  const { mutate, isPending } = trpc.orders.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      window.open(data.checkoutUrl, '_blank');
    },
  });
  
  return (
    <button 
      onClick={() => mutate({ leadListId })}
      disabled={isPending}
    >
      {isPending ? 'Processing...' : 'Buy Now'}
    </button>
  );
}
```

### Downloading an Order

```typescript
function DownloadButton({ orderId }) {
  const { mutate, isPending } = trpc.orders.getDownloadUrl.useMutation({
    onSuccess: (data) => {
      window.location.href = data.downloadUrl;
    },
  });
  
  return (
    <button 
      onClick={() => mutate({ orderId })}
      disabled={isPending}
    >
      {isPending ? 'Preparing...' : 'Download CSV'}
    </button>
  );
}
```

## Best Practices

### Security
- Always validate user permissions on the server
- Use HTTPS for all API calls
- Never expose sensitive data in responses
- Implement rate limiting for all endpoints
- Validate all input parameters

### Performance
- Use query caching when appropriate
- Implement pagination for large datasets
- Optimize database queries
- Cache frequently accessed data
- Monitor API response times

### Error Handling
- Always handle errors in client code
- Provide user-friendly error messages
- Log errors for debugging
- Implement retry logic for transient failures
- Use proper HTTP status codes

## Support

For API issues or questions:
1. Check this documentation
2. Review error messages and logs
3. Check the troubleshooting guide
4. Contact support

---

**API Version:** 1.0.0  
**Last Updated:** April 22, 2026  
**Status:** Production Ready
