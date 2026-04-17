"use client";
import { useState, useEffect } from "react";
import { Calendar, User, Loader2, Save, Star, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function StaffProfile() {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [myDates, setMyDates] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    const loadProfile = async () => {
      if (!session) return;
      try {
        const res = await fetch(`${API_URL}/api/staff`, {
          headers: { "Authorization": `Bearer ${session?.access_token}` }
        });
        const data = await res.json();
        const me = data.find((s: any) => s.email === user?.email);
        if (me) {
          setProfile(me);
          setMyDates(me.availability || []);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    if (session) loadProfile();
  }, [session, user]);

  const toggleDay = (day: string) => {
    setMyDates(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    setSaveSuccess(false);
  };

  const saveSchedule = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/staff/${profile.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify({ availability: myDates }),
      });
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-amber-600" /></div>;

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-amber-100 p-4 rounded-full"><User className="text-amber-600" /></div>
            <div>
              <h1 className="text-2xl font-serif font-bold">{profile?.full_name}</h1>
              <p className="text-stone-500 capitalize">{profile?.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-2xl">
              <span className="text-[10px] font-bold text-stone-400 uppercase">🎭 My Vibe Grades</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {profile?.vibe_tags?.map((t: string) => (
                  <span key={t} className="bg-white border border-amber-200 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">{t}</span>
                )) || <span className="text-stone-300 italic text-xs">No grades yet</span>}
              </div>
            </div>
            <div className="p-4 bg-stone-50 rounded-2xl">
              <span className="text-[10px] font-bold text-stone-400 uppercase">🏆 Loyalty Score</span>
              <div className="flex items-center gap-2 mt-1 text-amber-600">
                <Star size={16} fill="currentColor"/>
                <span className="text-2xl font-serif font-bold">{profile?.loyalty_score || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
          <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-amber-600"/> My Weekly Availability
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {weekDays.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`py-3 rounded-xl border-2 font-bold transition ${
                  myDates.includes(day) ? "bg-amber-500 border-amber-600 text-white" : "bg-white text-stone-400 border-stone-100"
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>
          <button 
            onClick={saveSchedule}
            disabled={saving}
            className="w-full mt-8 bg-stone-800 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" /> : saveSuccess ? <><CheckCircle size={20}/> Saved Successfully</> : <><Save size={20}/> Sync My Schedule</>}
          </button>
        </div>
      </div>
    </div>
  );
}