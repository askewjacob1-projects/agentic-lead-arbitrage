import { invokeLLM } from "./_core/llm";

/**
 * Email notification service for buyer confirmations and owner alerts
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Generate buyer order confirmation email
 */
export async function generateBuyerConfirmationEmail(
  buyerEmail: string,
  buyerName: string,
  orderId: number,
  leadCount: number,
  amount: number,
  downloadUrl: string,
  expiresIn: string = "24 hours"
): Promise<EmailTemplate> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00d4ff 0%, #d946ef 100%); color: white; padding: 20px; border-radius: 8px; }
          .content { padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-top: 20px; }
          .button { display: inline-block; background: #000; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
          .highlight { background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #00d4ff; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Your lead list purchase has been processed successfully.</p>
          </div>
          
          <div class="content">
            <p>Hi ${escapeHtml(buyerName)},</p>
            
            <p>Thank you for purchasing from Agentic Lead Arbitrage. Your enriched lead list is ready to download.</p>
            
            <div class="highlight">
              <strong>Order Details:</strong><br/>
              Order ID: #${orderId}<br/>
              Leads Included: ${leadCount}<br/>
              Amount Paid: $${(amount / 100).toFixed(2)}<br/>
              Download Link Expires: ${expiresIn}
            </div>
            
            <p><strong>Your Download Link:</strong></p>
            <a href="${downloadUrl}" class="button">Download Lead List (CSV)</a>
            
            <p style="margin-top: 20px; color: #666; font-size: 14px;">
              ⚠️ <strong>Important:</strong> This download link will expire in ${expiresIn}. 
              Please download your file before the link expires. If you need a new link, 
              visit your order history page.
            </p>
            
            <p style="margin-top: 20px;">
              <strong>What's Included:</strong><br/>
              ✓ Verified email addresses<br/>
              ✓ Intent scores (0-100)<br/>
              ✓ Hiring signals<br/>
              ✓ Company information<br/>
              ✓ Decision maker contacts
            </p>
          </div>
          
          <div class="footer">
            <p>© 2026 Agentic Lead Arbitrage. All rights reserved.</p>
            <p>Questions? Visit our support page or reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Order Confirmed!

Hi ${buyerName},

Thank you for purchasing from Agentic Lead Arbitrage. Your enriched lead list is ready to download.

Order Details:
- Order ID: #${orderId}
- Leads Included: ${leadCount}
- Amount Paid: $${(amount / 100).toFixed(2)}
- Download Link Expires: ${expiresIn}

Download your lead list here:
${downloadUrl}

Important: This download link will expire in ${expiresIn}. Please download your file before the link expires.

What's Included:
✓ Verified email addresses
✓ Intent scores (0-100)
✓ Hiring signals
✓ Company information
✓ Decision maker contacts

© 2026 Agentic Lead Arbitrage. All rights reserved.
  `;

  return {
    subject: `Your Agentic Lead Arbitrage Order #${orderId} is Ready`,
    html: htmlContent,
    text: textContent,
  };
}

/**
 * Generate download link expiration reminder email
 */
export async function generateExpirationReminderEmail(
  buyerEmail: string,
  buyerName: string,
  orderId: number,
  downloadUrl: string,
  hoursRemaining: number
): Promise<EmailTemplate> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .warning { background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; color: #92400e; }
          .button { display: inline-block; background: #000; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>⏰ Your Download Link Expires Soon</h2>
          
          <div class="warning">
            <strong>Attention:</strong> Your download link for order #${orderId} will expire in ${hoursRemaining} hours.
          </div>
          
          <p>Hi ${escapeHtml(buyerName)},</p>
          <p>This is a reminder that your lead list download link will expire soon. Please download your file before it's no longer available.</p>
          
          <a href="${downloadUrl}" class="button">Download Lead List Now</a>
          
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            If you need a new download link after expiration, visit your order history page to request a fresh link.
          </p>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Your Download Link Expires Soon

Hi ${buyerName},

Your download link for order #${orderId} will expire in ${hoursRemaining} hours. Please download your file before it's no longer available.

Download your lead list here:
${downloadUrl}

If you need a new download link after expiration, visit your order history page.
  `;

  return {
    subject: `⏰ Your Agentic Lead Arbitrage Order #${orderId} Download Expires in ${hoursRemaining} Hours`,
    html: htmlContent,
    text: textContent,
  };
}

/**
 * Generate owner summary email for new order
 */
export async function generateOwnerSummaryEmail(
  orderId: number,
  buyerEmail: string,
  buyerName: string,
  leadCount: number,
  amount: number,
  totalRevenue: number,
  totalOrders: number
): Promise<EmailTemplate> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-card { background: #f3f4f6; padding: 15px; border-radius: 6px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #000; }
          .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>💰 New Order Received</h2>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">$${(amount / 100).toFixed(2)}</div>
              <div class="stat-label">Order Amount</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${leadCount}</div>
              <div class="stat-label">Leads Included</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">$${(totalRevenue / 100).toFixed(2)}</div>
              <div class="stat-label">Total Revenue</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalOrders}</div>
              <div class="stat-label">Total Orders</div>
            </div>
          </div>
          
          <p><strong>Order Details:</strong></p>
          <ul>
            <li>Order ID: #${orderId}</li>
            <li>Buyer: ${escapeHtml(buyerName)} (${escapeHtml(buyerEmail)})</li>
            <li>Leads: ${leadCount}</li>
            <li>Amount: $${(amount / 100).toFixed(2)}</li>
          </ul>
          
          <p>Visit your dashboard to view all orders and analytics.</p>
        </div>
      </body>
    </html>
  `;

  const textContent = `
New Order Received

Order Amount: $${(amount / 100).toFixed(2)}
Leads Included: ${leadCount}
Total Revenue: $${(totalRevenue / 100).toFixed(2)}
Total Orders: ${totalOrders}

Order Details:
- Order ID: #${orderId}
- Buyer: ${buyerName} (${buyerEmail})
- Leads: ${leadCount}
- Amount: $${(amount / 100).toFixed(2)}

Visit your dashboard to view all orders and analytics.
  `;

  return {
    subject: `💰 New Order #${orderId} - $${(amount / 100).toFixed(2)} Revenue`,
    html: htmlContent,
    text: textContent,
  };
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

/**
 * Send email using built-in notification system
 * In production, this would integrate with SendGrid, AWS SES, or similar
 */
export async function sendEmail(
  to: string,
  template: EmailTemplate
): Promise<boolean> {
  try {
    // For now, log the email that would be sent
    console.log(`[Email] Sending to ${to}`);
    console.log(`[Email] Subject: ${template.subject}`);
    console.log(`[Email] Preview: ${template.text.substring(0, 100)}...`);

    // In production, integrate with email service:
    // const result = await sendgrid.send({
    //   to,
    //   from: 'noreply@agentic-lead-arbitrage.com',
    //   subject: template.subject,
    //   html: template.html,
    //   text: template.text,
    // });

    return true;
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error);
    return false;
  }
}
