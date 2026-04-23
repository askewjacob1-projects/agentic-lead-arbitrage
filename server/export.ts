import { orders } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Data export utilities for bulk operations and reporting
 */

export interface ExportOptions {
  format: "csv" | "json";
  dateRange?: {
    from: Date;
    to: Date;
  };
  includeHeaders?: boolean;
}

/**
 * Helper to parse amount value
 */
function parseAmount(amount: any): number {
  if (typeof amount === "string") {
    return parseInt(amount, 10);
  }
  return amount || 0;
}

/**
 * Export orders to CSV format
 */
export async function exportOrdersToCSV(options?: ExportOptions): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const orderRecords = await db.select().from(orders);

  // Prepare CSV header
  const headers = [
    "Order ID",
    "Buyer Email",
    "Buyer Name",
    "Amount",
    "Status",
    "Lead Count",
    "Created At",
    "Updated At",
  ];

  // Prepare CSV rows
  const rows = orderRecords.map((order) => {
    const amount = parseAmount(order.amount);
    return [
      order.id.toString(),
      escapeCSVField(order.buyerEmail || ""),
      escapeCSVField(order.buyerName || ""),
      `$${(amount / 100).toFixed(2)}`,
      order.status,
      "50",
      order.createdAt.toISOString(),
      order.updatedAt.toISOString(),
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Export orders to JSON format
 */
export async function exportOrdersToJSON(options?: ExportOptions): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const orderRecords = await db.select().from(orders);

  const totalRevenue = orderRecords.reduce((sum, order) => {
    return sum + parseAmount(order.amount);
  }, 0);

  const exportData = {
    exportDate: new Date().toISOString(),
    totalOrders: orderRecords.length,
    totalRevenue: totalRevenue,
    orders: orderRecords.map((order) => {
      const amount = parseAmount(order.amount);
      return {
        id: order.id,
        buyerEmail: order.buyerEmail,
        buyerName: order.buyerName,
        amount: amount,
        amountFormatted: `$${(amount / 100).toFixed(2)}`,
        status: order.status,
        leadListId: order.leadListId,
        stripePaymentIntentId: order.stripePaymentIntentId,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      };
    }),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate revenue summary report
 */
export async function generateRevenueSummary(): Promise<{
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  failedOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
  revenueByDay: Record<string, number>;
  revenueByWeek: Record<string, number>;
  revenueByMonth: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const orderRecords = await db.select().from(orders);

  const summary = {
    totalRevenue: 0,
    totalOrders: orderRecords.length,
    completedOrders: 0,
    failedOrders: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
    revenueByDay: {} as Record<string, number>,
    revenueByWeek: {} as Record<string, number>,
    revenueByMonth: {} as Record<string, number>,
  };

  orderRecords.forEach((order) => {
    const amount = parseAmount(order.amount);
    summary.totalRevenue += amount;

    if (order.status === "completed") {
      summary.completedOrders++;
    } else if (order.status === "failed") {
      summary.failedOrders++;
    } else if (order.status === "pending") {
      summary.pendingOrders++;
    }

    // Group by day
    const dayKey = order.createdAt.toISOString().split("T")[0];
    summary.revenueByDay[dayKey] = (summary.revenueByDay[dayKey] || 0) + amount;

    // Group by week
    const weekKey = getWeekKey(order.createdAt);
    summary.revenueByWeek[weekKey] = (summary.revenueByWeek[weekKey] || 0) + amount;

    // Group by month
    const monthKey = order.createdAt.toISOString().substring(0, 7);
    summary.revenueByMonth[monthKey] = (summary.revenueByMonth[monthKey] || 0) + amount;
  });

  summary.averageOrderValue =
    summary.totalOrders > 0 ? Math.round(summary.totalRevenue / summary.totalOrders) : 0;

  return summary;
}

/**
 * Generate profit goal progress report
 */
export async function generateProfitGoalProgress(
  day14Goal: number,
  day30Goal: number
): Promise<{
  day14: {
    goal: number;
    actual: number;
    percentage: number;
    achieved: boolean;
  };
  day30: {
    goal: number;
    actual: number;
    percentage: number;
    achieved: boolean;
  };
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const now = new Date();
  const day14Ago = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const day30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const orderRecords = await db.select().from(orders);

  // Calculate revenue for last 14 days
  const revenue14 = orderRecords
    .filter((order) => order.createdAt >= day14Ago && order.status === "completed")
    .reduce((sum, order) => sum + parseAmount(order.amount), 0);

  // Calculate revenue for last 30 days
  const revenue30 = orderRecords
    .filter((order) => order.createdAt >= day30Ago && order.status === "completed")
    .reduce((sum, order) => sum + parseAmount(order.amount), 0);

  const percentage14 = day14Goal > 0 ? Math.round((revenue14 / day14Goal) * 100) : 0;
  const percentage30 = day30Goal > 0 ? Math.round((revenue30 / day30Goal) * 100) : 0;

  return {
    day14: {
      goal: day14Goal,
      actual: revenue14,
      percentage: percentage14,
      achieved: revenue14 >= day14Goal,
    },
    day30: {
      goal: day30Goal,
      actual: revenue30,
      percentage: percentage30,
      achieved: revenue30 >= day30Goal,
    },
  };
}

/**
 * Escape CSV field values
 */
function escapeCSVField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Get week key for grouping (ISO week format)
 */
function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/**
 * Generate analytics dashboard data
 */
export async function generateAnalyticsDashboard(): Promise<{
  summary: Awaited<ReturnType<typeof generateRevenueSummary>>;
  topDays: Array<{ date: string; revenue: number; orders: number }>;
  statusDistribution: Record<string, number>;
  revenueGrowth: Array<{ period: string; revenue: number; growth: number }>;
}> {
  const summary = await generateRevenueSummary();

  // Top revenue days
  const topDays = Object.entries(summary.revenueByDay)
    .map(([date, revenue]) => ({
      date,
      revenue,
      orders: 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 7);

  // Status distribution
  const statusDistribution = {
    completed: summary.completedOrders,
    failed: summary.failedOrders,
    pending: summary.pendingOrders,
  };

  // Revenue growth by week
  const revenueGrowth = Object.entries(summary.revenueByWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, revenue], index, arr) => ({
      period,
      revenue,
      growth: index === 0 ? 0 : Math.round(((revenue - arr[index - 1][1]) / arr[index - 1][1]) * 100),
    }));

  return {
    summary,
    topDays,
    statusDistribution,
    revenueGrowth,
  };
}
