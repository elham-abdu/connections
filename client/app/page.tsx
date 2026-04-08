"use client";
import { useState } from "react";
import { Sparkles, Users, Crown, Loader2, Send, CheckCircle2, ClipboardList } from "lucide-react";
import Link from "next/link";

export default function ManagerDashboard() {
  const [requirement, setRequirement] = useState("");
  const [role, setRole] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // PRODUCTION FIX: Use environment variable or fallback to local
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const handleRecruit = async () => {
    if (!requirement.trim()) {
      setResult("Please describe what staff you need.");
      return;
    }

    setLoading(true);
    setResult("");
    
    try {
      const requestBody = {
        requirement: requirement,
        ...(role && { role: role })
      };
      
      const response = await fetch(`${API_URL}/api/recruit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data.recommendation);
    } catch (err) {
      console.error("Fetch error:", err);
      setResult("The AI engine is waking up. Please try again in 30 seconds.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-stone-50">
      {/* Navigation Bar */}
      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-serif font-bold text-stone-800">
          <Crown className="w-5 h-5 text-amber-600" /> Pulse AI
        </div>
        <Link 
          href="/staff" 
          className="flex items-center gap-2 text-sm font-semibold bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm hover:shadow-md transition"
        >
          <ClipboardList className="w-4 h-4" /> Open Staff Registry
        </Link>
      </nav>

      <div className="relative max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-3 rounded-2xl shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-stone-800 via-amber-800 to-stone-800 bg-clip-text text-transparent mb-4 font-serif">
            Pulse Staffing AI
          </h1>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            Experience the future of luxury hospitality staffing
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400" />
            <Sparkles className="w-4 h-4 text-amber-500" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400" />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-amber-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Role Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Filter by Role (Optional)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full md:w-64 p-3 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-800 bg-white"
              >
                <option value="">All Staff</option>
                <option value="waiter">Waiters</option>
                <option value="host">Hosts</option>
                <option value="bartender">Bartenders</option>
                <option value="manager">Managers</option>
              </select>
            </div>

            {/* Staffing Requirement Input */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
                  Staffing Requirement
                </label>
                <textarea
                  className="w-full p-5 border-2 border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-stone-800 bg-white/90 placeholder:text-stone-400 resize-none font-medium"
                  placeholder="Example: I need an energetic and funny host for a casual dining experience..."
                  rows={4}
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleRecruit}
                disabled={loading || !requirement.trim()}
                className="relative w-full group overflow-hidden rounded-2xl bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 text-white font-semibold py-4 px-6 transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      AI is analyzing candidates...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Find Matching Staff
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Results Section */}
            {result && (
              <div className="mt-8 animate-fadeIn">
                <div className="bg-gradient-to-br from-amber-50 to-stone-50 rounded-2xl border border-amber-200 overflow-hidden shadow-lg">
                  <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                      <h2 className="font-serif font-bold text-white text-lg">
                        AI Recommendation
                      </h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="whitespace-pre-wrap text-stone-700 leading-relaxed">
                      {result}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}