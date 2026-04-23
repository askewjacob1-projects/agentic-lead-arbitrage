import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Download, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function Success() {
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionId(params.get("session_id"));
  }, []);

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
          <h1 className="text-4xl font-black text-black mb-4">Payment Successful!</h1>
          <p className="text-lg text-gray-600">Your lead list is ready to download.</p>
        </div>

        <Card className="p-8 border border-gray-200 mb-8">
          <div className="space-y-6">
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
              <h2 className="font-bold text-black mb-4">What's Next?</h2>
              <ol className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="font-bold text-cyan-500 flex-shrink-0">1.</span>
                  <span>Check your email for the download link (valid for 24 hours)</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-cyan-500 flex-shrink-0">2.</span>
                  <span>Download the CSV file containing 50 verified leads</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-cyan-500 flex-shrink-0">3.</span>
                  <span>Import into your CRM or outreach tool and start connecting</span>
                </li>
              </ol>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-bold text-black mb-4">Your Lead List Includes:</h3>
              <ul className="space-y-2 text-gray-700">
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

            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-semibold text-black mb-2">💡 Pro Tip:</p>
              <p>These leads are actively recruiting. Personalize your outreach message and mention specific hiring signals from the data for best results.</p>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Button
            size="lg"
            className="bg-black text-white hover:bg-gray-900 h-12 text-lg"
            onClick={() => navigate("/")}
          >
            <Download className="w-5 h-5 mr-2" />
            Download Your Leads
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-gray-300 h-12 text-lg"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center text-sm text-gray-600">
          <p className="mb-2">Order ID: <span className="font-mono font-semibold text-black">{sessionId || "—"}</span></p>
          <p>Check your email for download link and receipt</p>
        </div>
      </section>
    </div>
  );
}
