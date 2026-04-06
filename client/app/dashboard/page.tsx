"use client";
import { useState } from "react";
import { Sparkles, Users, Crown, Loader2, Send, CheckCircle2 } from "lucide-react";

export default function ManagerDashboard() {
  const [requirement, setRequirement] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const handleRecruit = async () => {
    setLoading(true);
    setIsThinking(true);
    try {
      const response = await fetch("http://localhost:8080/api/recruit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement }),
      });
      const data = await response.json();
      setResult(data.recommendation);
    } catch (err) {
      setResult("Error connecting to the backend.");
    }
    setLoading(false);
    setIsThinking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-stone-50">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-stone-200 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-3 rounded-2xl shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-stone-800 via-amber-800 to-stone-800 bg-clip-text text-transparent mb-4 font-serif">
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
          <div className="p-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
                  Staffing Requirement
                </label>
                <textarea
                  className="w-full p-5 border-2 border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-stone-800 bg-white/90 placeholder:text-stone-400 resize-none font-medium"
                  placeholder="Example: I need a sophisticated waiter for an exclusive VIP dinner service who embodies elegance, professionalism, and attention to detail..."
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
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  {isThinking ? (
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

            {/* Loading Animation */}
            {loading && !result && (
              <div className="mt-8 p-8 bg-gradient-to-r from-amber-50 to-stone-50 rounded-2xl border border-amber-200">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span className="text-stone-600 font-medium">Consulting our AI sommelier...</span>
                </div>
              </div>
            )}

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
                    <div className="prose prose-stone max-w-none">
                      <div className="whitespace-pre-wrap text-stone-700 leading-relaxed">
                        {result}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !result && requirement.length === 0 && (
              <div className="mt-8 text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
                  <Sparkles className="w-8 h-8 text-amber-600" />
                </div>
                <p className="text-stone-500">
                  Describe your ideal candidate and let AI do the magic
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-stone-400 text-sm">
            Powered by Google Gemini AI • Luxury Hospitality Edition
          </p>
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