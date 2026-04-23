import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, DollarSign, Target } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { data: orders, isLoading } = trpc.orders.getAll.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">You do not have permission to view this dashboard.</p>
          <Button onClick={() => navigate("/")} className="bg-black text-white hover:bg-gray-900">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const completedOrders = orders?.filter(o => o.status === "completed") || [];
  const totalRevenue = completedOrders.reduce((sum, order) => sum + parseFloat(order.amount.toString()), 0);
  const day14Revenue = completedOrders
    .filter(o => {
      const createdDate = new Date(o.createdAt);
      const daysDiff = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 14;
    })
    .reduce((sum, order) => sum + parseFloat(order.amount.toString()), 0);

  const day30Revenue = completedOrders
    .filter(o => {
      const createdDate = new Date(o.createdAt);
      const daysDiff = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 30;
    })
    .reduce((sum, order) => sum + parseFloat(order.amount.toString()), 0);

  const day14Goal = 100;
  const day30Goal = 300;
  const day14Progress = Math.min((day14Revenue / day14Goal) * 100, 100);
  const day30Progress = Math.min((day30Revenue / day30Goal) * 100, 100);

  return (
    <div className="min-h-screen bg-white">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="text-2xl font-bold text-black">Owner Dashboard</div>
          <div className="w-20" />
        </div>
      </nav>

      {/* Main Content */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Total Revenue</h3>
              <DollarSign className="w-5 h-5 text-cyan-500" />
            </div>
            <div className="text-3xl font-black text-black">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-2">{completedOrders.length} orders</p>
          </Card>

          <Card className="p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Day 14 Goal</h3>
              <Target className="w-5 h-5 text-pink-500" />
            </div>
            <div className="text-3xl font-black text-black">${day14Revenue.toFixed(2)}</div>
            <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-pink-400 h-full transition-all"
                style={{ width: `${day14Progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{day14Progress.toFixed(0)}% of ${day14Goal} goal</p>
          </Card>

          <Card className="p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Day 30 Goal</h3>
              <TrendingUp className="w-5 h-5 text-cyan-500" />
            </div>
            <div className="text-3xl font-black text-black">${day30Revenue.toFixed(2)}</div>
            <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-pink-400 h-full transition-all"
                style={{ width: `${day30Progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{day30Progress.toFixed(0)}% of ${day30Goal} goal</p>
          </Card>

          <Card className="p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Avg Order Value</h3>
              <DollarSign className="w-5 h-5 text-pink-500" />
            </div>
            <div className="text-3xl font-black text-black">
              ${completedOrders.length > 0 ? (totalRevenue / completedOrders.length).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-gray-500 mt-2">Per transaction</p>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-black">Recent Orders</h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-black mx-auto" />
            </div>
          ) : completedOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              <p>No orders yet. Check back soon!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Buyer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Downloaded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {completedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.buyerName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.buyerEmail}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-black">
                        ${parseFloat(order.amount.toString()).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.downloadedAt ? new Date(order.downloadedAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
