import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, BarChart3, Download, Package, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "14d" | "30d">("30d");

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const ordersQuery = trpc.orders.getAll.useQuery();
  const orders = ordersQuery.data || [];

  // Calculate metrics
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === "completed");
  const totalRevenue = completedOrders.reduce((sum, order) => {
    const amount = typeof order.amount === "string" ? parseFloat(order.amount) : order.amount;
    return sum + amount;
  }, 0);

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate period-based metrics
  const getPeriodOrders = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return orders.filter(o => new Date(o.createdAt) >= cutoffDate && o.status === "completed");
  };

  const period7d = getPeriodOrders(7);
  const period14d = getPeriodOrders(14);
  const period30d = getPeriodOrders(30);

  const getPeriodRevenue = (orderList: typeof orders) => {
    return orderList.reduce((sum, order) => {
      const amount = typeof order.amount === "string" ? parseFloat(order.amount) : order.amount;
      return sum + amount;
    }, 0);
  };

  const revenue7d = getPeriodRevenue(period7d);
  const revenue14d = getPeriodRevenue(period14d);
  const revenue30d = getPeriodRevenue(period30d);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You do not have permission to access the admin dashboard. Only administrators can view this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage lead lists, track orders, and monitor revenue</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">{completedOrders.length} completed orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {orders.filter(o => o.status === "pending").length} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalOrders > 0 ? ((completedOrders.length / totalOrders) * 100).toFixed(1) : "0"}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Completed vs total</p>
            </CardContent>
          </Card>
        </div>

        {/* Period Revenue */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue by Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Last 7 Days</p>
                <p className="text-2xl font-bold">${revenue7d.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{period7d.length} orders</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Last 14 Days</p>
                <p className="text-2xl font-bold">${revenue14d.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{period14d.length} orders</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Last 30 Days</p>
                <p className="text-2xl font-bold">${revenue30d.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{period30d.length} orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>All orders sorted by most recent first</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersQuery.isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No orders yet. Start selling lead lists!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Buyer Email</TableHead>
                      <TableHead>Buyer Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Downloaded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">#{order.id}</TableCell>
                        <TableCell>{order.buyerEmail}</TableCell>
                        <TableCell>{order.buyerName || "—"}</TableCell>
                        <TableCell className="font-semibold">
                          ${typeof order.amount === "string" ? order.amount : String(order.amount)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {order.downloadedAt ? (
                            <span className="text-xs text-muted-foreground">
                              {new Date(order.downloadedAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="mt-8 flex gap-4">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Orders (CSV)
          </Button>
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  );
}
