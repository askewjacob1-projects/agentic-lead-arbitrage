import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Download, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Delivery() {
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    const oid = params.get("order_id");
    setSessionId(sid);
    if (oid) setOrderId(parseInt(oid));
  }, []);

  const { data: order, isLoading, error } = trpc.orders.getById.useQuery(
    { orderId: orderId || 0 },
    { enabled: orderId !== null && orderId !== 0 }
  );

  const { data: downloadUrl, isLoading: isGeneratingUrl } = trpc.orders.getDownloadUrl.useQuery(
    { orderId: orderId || 0 },
    { enabled: orderId !== null && orderId !== 0 && order?.status === "completed" }
  );

  const handleDownload = async () => {
    if (downloadUrl?.url) {
      window.location.href = downloadUrl.url;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="relative z-10 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        </nav>

        <section className="relative z-10 max-w-2xl mx-auto px-4 py-20">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-black mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-8">We couldn't find your order. Please check your email for the download link.</p>
            <Button onClick={() => navigate("/")} className="bg-black text-white hover:bg-gray-900">
              Back to Home
            </Button>
          </div>
        </section>
      </div>
    );
  }

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
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <section className="relative z-10 max-w-2xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full blur-xl opacity-30" />
              <CheckCircle className="w-20 h-20 text-green-500 relative" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-black mb-4">Payment Confirmed!</h1>
          <p className="text-lg text-gray-600">Your lead list is ready to download.</p>
        </div>

        <Card className="p-8 border border-gray-200 mb-8">
          <div className="space-y-6">
            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="font-bold text-black mb-4">Order Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono font-semibold text-black">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Buyer:</span>
                  <span className="font-semibold text-black">{order.buyerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-black">{order.buyerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-black">${parseFloat(order.amount.toString()).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Download Section */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
              <h3 className="font-bold text-black mb-4">Download Your Lead List</h3>
              <p className="text-sm text-gray-700 mb-4">
                Your CSV file contains 50 verified leads with emails, intent scores, and hiring signals.
              </p>
              <Button
                size="lg"
                className="w-full bg-black text-white hover:bg-gray-900 h-12 text-lg"
                onClick={handleDownload}
                disabled={isGeneratingUrl || !downloadUrl}
              >
                {isGeneratingUrl ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Download Link...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download CSV File
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-3">
                Download link expires in 24 hours. Save your file locally for permanent access.
              </p>
            </div>

            {/* What's Included */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-bold text-black mb-4">What's Included:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-cyan-500">✓</span>
                  <span>50 verified leads with high hiring intent</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">✓</span>
                  <span>Verified email addresses for each contact</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">✓</span>
                  <span>Intent scoring (0.8+) indicating urgency</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">✓</span>
                  <span>Company information and hiring signals</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">✓</span>
                  <span>Ready-to-use CSV format</span>
                </li>
              </ul>
            </div>

            {/* Pro Tip */}
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-semibold text-black mb-2">💡 Pro Tip:</p>
              <p>These leads are actively recruiting. Personalize your outreach message and mention specific hiring signals from the data for best results.</p>
            </div>
          </div>
        </Card>

        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">Need help? Check your email for support information.</p>
          <p>Your download link has been sent to <span className="font-semibold text-black">{order.buyerEmail}</span></p>
        </div>
      </section>
    </div>
  );
}
