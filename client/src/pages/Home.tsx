import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Grid background with geometric patterns */}
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

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-6xl font-black text-black mb-6 leading-tight">
              High-Intent Leads,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">Instantly Enriched</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Access verified, enriched lead lists of companies in urgent hiring mode. Every lead includes verified emails, intent scores, and hiring signals—ready to convert.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-black text-white hover:bg-gray-900"
                onClick={() => navigate("/purchase")}
              >
                Buy Lead Lists <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Geometric visualization */}
          <div className="relative h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-pink-50 rounded-lg border border-gray-200 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                {/* Wireframe shapes */}
                <g stroke="currentColor" strokeWidth="2" fill="none" className="text-cyan-400 opacity-20">
                  <polygon points="200,50 350,150 300,300 100,300 50,150" />
                  <circle cx="200" cy="200" r="80" />
                  <rect x="100" y="100" width="200" height="200" />
                </g>
                {/* Accent shapes */}
                <g stroke="currentColor" strokeWidth="1.5" fill="none" className="text-pink-400 opacity-30">
                  <path d="M 50 200 Q 150 100 350 200" />
                  <path d="M 200 50 L 200 350" />
                  <path d="M 50 200 L 350 200" />
                </g>
                {/* Data points */}
                <circle cx="200" cy="150" r="4" fill="currentColor" className="text-cyan-500" />
                <circle cx="150" cy="220" r="4" fill="currentColor" className="text-pink-500" />
                <circle cx="280" cy="240" r="4" fill="currentColor" className="text-cyan-500" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-20 border-t border-gray-100">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-black mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600">One price. Maximum value. No hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pricing card */}
          <div className="border border-gray-200 rounded-lg p-8 hover:border-cyan-400 transition-colors">
            <div className="text-sm font-mono text-gray-500 mb-4">STANDARD PACKAGE</div>
            <div className="mb-6">
              <div className="text-5xl font-black text-black">$60</div>
              <div className="text-gray-600 mt-2">per lead list</div>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                "50 verified leads",
                "Enriched emails & contact info",
                "Intent scoring (0.8+)",
                "Hiring signals included",
                "CSV download",
                "24-hour access"
              ].map((feature) => (
                <li key={feature} className="flex gap-3 items-start">
                  <CheckCircle className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-black text-white hover:bg-gray-900"
              onClick={() => navigate("/purchase")}
            >
              Purchase Now
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex gap-4">
                <TrendingUp className="w-6 h-6 text-pink-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-black mb-2">Real-Time Intent Signals</h3>
                  <p className="text-gray-600">Every lead is scored for hiring urgency. We only include companies actively recruiting.</p>
                </div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-cyan-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-black mb-2">Verified & Enriched</h3>
                  <p className="text-gray-600">Every email is verified. Every contact is current. Zero guesswork.</p>
                </div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex gap-4">
                <ArrowRight className="w-6 h-6 text-pink-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-black mb-2">Instant Delivery</h3>
                  <p className="text-gray-600">Download your CSV immediately after payment. Start outreach in minutes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-20 border-t border-gray-100">
        <div className="bg-gradient-to-r from-cyan-50 to-pink-50 rounded-lg border border-gray-200 p-12 text-center">
          <h2 className="text-3xl font-black text-black mb-4">Ready to Scale Your Recruiting?</h2>
          <p className="text-lg text-gray-600 mb-8">Get your first 50 high-intent leads for just $60. No commitment. No recurring fees.</p>
          <Button
            size="lg"
            className="bg-black text-white hover:bg-gray-900"
            onClick={() => navigate("/purchase")}
          >
            Purchase Lead List Now <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-100 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2026 Agentic Lead Arbitrage. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
