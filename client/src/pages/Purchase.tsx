import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Purchase() {
  const [, navigate] = useLocation();
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createCheckoutSession = trpc.orders.createCheckoutSession.useMutation({
    onSuccess: (data: any) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecting to checkout...");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create checkout session");
      setIsLoading(false);
    },
  });

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!buyerEmail || !buyerName) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    createCheckoutSession.mutate({
      buyerEmail,
      buyerName,
      leadListId: 1, // Default lead list ID
    });
  };

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
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center">
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
          <h1 className="text-4xl font-black text-black mb-4">Purchase Lead List</h1>
          <p className="text-lg text-gray-600">Get 50 verified, enriched leads for $60</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2">
            <Card className="p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-black mb-6">Order Details</h2>

              <form onSubmit={handlePurchase} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-black font-semibold">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-black font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>

                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    After payment, you'll receive an email with a download link to your CSV file. The link expires in 24 hours.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-900 h-12 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Price Summary */}
          <div>
            <Card className="p-6 border border-gray-200 sticky top-20">
              <h3 className="font-bold text-black mb-4">Summary</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Lead List (50 leads)</span>
                  <span className="font-semibold text-black">$60.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold text-black">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-bold text-black">Total</span>
                <span className="text-2xl font-black text-black">$60</span>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex gap-2">
                  <span className="text-cyan-500">✓</span>
                  <span>Instant delivery</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-cyan-500">✓</span>
                  <span>24-hour download access</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-cyan-500">✓</span>
                  <span>Verified emails included</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-cyan-500">✓</span>
                  <span>Intent scoring (0.8+)</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
