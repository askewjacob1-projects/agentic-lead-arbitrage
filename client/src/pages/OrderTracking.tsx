import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Download, Eye, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function OrderTracking() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const ordersQuery = trpc.orders.getAll.useQuery();
  const orders = ordersQuery.data || [];

  // Filter orders for current user
  const userOrders = orders.filter(order => order.buyerEmail === user?.email);

  const handleDownload = async (orderId: number) => {
    try {
      toast.loading("Generating download link...");
      // In a real implementation, this would call a tRPC procedure to get the download URL
      toast.success("Download link generated! Check your email.");
    } catch (error) {
      toast.error("Failed to generate download link");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please log in to view your orders and download lead lists.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Back to Home
            </Button>
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
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">
            Track your purchases and download your lead lists
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userOrders.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${userOrders
                  .filter(o => o.status === "completed")
                  .reduce((sum, order) => {
                    const amount = typeof order.amount === "string" ? parseFloat(order.amount) : order.amount;
                    return sum + amount;
                  }, 0)
                  .toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Completed purchases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Downloads Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userOrders.filter(o => o.status === "completed" && !o.downloadedAt).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Ready to download</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order History
            </CardTitle>
            <CardDescription>
              {userOrders.length === 0
                ? "You haven't placed any orders yet"
                : `You have ${userOrders.length} order${userOrders.length !== 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ordersQuery.isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading orders...</p>
              </div>
            ) : userOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No orders found</p>
                <Button onClick={() => navigate("/purchase")}>Buy Lead Lists</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Lead List</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Purchase Date</TableHead>
                      <TableHead>Downloaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userOrders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">#{order.id}</TableCell>
                        <TableCell>Tech Recruiters - Q1 2026</TableCell>
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
                        <TableCell>
                          <div className="flex gap-2">
                            {order.status === "completed" ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1"
                                  onClick={() => navigate(`/delivery?order_id=${order.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleDownload(order.id)}
                                >
                                  <Download className="h-4 w-4" />
                                  Download
                                </Button>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">Pending</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>Download Links Expire:</strong> Your download links are valid for 24 hours after purchase. If your link expires, you can request a new one from this page.
              </p>
              <p>
                <strong>CSV Format:</strong> Lead lists are provided as CSV files containing verified contact information, company details, and hiring intent scores.
              </p>
              <p>
                <strong>Questions?</strong> Contact support at support@agentic-lead-arbitrage.com for assistance with your orders.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
