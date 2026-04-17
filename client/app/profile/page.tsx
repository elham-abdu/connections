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
        const staffData = Array.isArray(data) ? data : data.value || [];
        const me = staffData.find((s: any) => s.email === user?.email);
        if (me) {
          setProfile(me);
          setMyDates(me.availability || []);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
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
    setSaveSuccess(false);
    
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
      } else {
        const error = await response.json();
        alert(`Failed to save: ${error.error}`);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error connecting to server");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-stone-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header: Vibe Grade (Set by Manager) */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-amber-100 p-4 rounded-full">
              <User className="w-6 h-6 md:w-8 md:h-8 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-800">My Professional Profile</h1>
              <p className="text-stone-500 text-sm">{profile.full_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-2xl">
              <span className="text-xs font-bold text-stone-400 uppercase">🎭 Current Vibe Grade</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.vibe_tags?.length > 0 ? (
                  profile.vibe_tags.map((tag: string) => (
                    <span key={tag} className="bg-white border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-stone-400 text-sm">No vibe grades assigned yet</span>
                )}
              </div>
            </div>
            <div className="p-4 bg-stone-50 rounded-2xl">
              <span className="text-xs font-bold text-stone-400 uppercase">🏆 Loyalty Score</span>
              <div className="flex items-center gap-2 mt-2">
                <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
                <p className="text-2xl font-serif font-bold text-amber-600">{profile.loyalty_score}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule: Set by Staff */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-serif font-bold text-stone-800">My Availability</h2>
          </div>
          
          <p className="text-sm text-stone-500 mb-6">
            Select the days you are available to work. Click a day to toggle your availability.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {weekDays.map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`py-3 md:py-4 rounded-xl font-semibold transition-all active:scale-95 ${
                  myDates.includes(day) 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>

          {myDates.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-xl">
              <p className="text-sm text-amber-800">
                ✅ You're available on: <span className="font-bold">{myDates.join(", ")}</span>
              </p>
            </div>
          )}

          <button 
            onClick={saveSchedule}
            disabled={saving}
            className="w-full mt-6 bg-stone-800 hover:bg-stone-700 text-white py-4 rounded-xl font-bold transition flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saveSuccess ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>
                <Save size={20}/>
                Sync My Schedule
              </>
            )}
          </button>
        </div>

        {/* Role Info */}
        <div className="bg-amber-50 p-4 rounded-xl text-center">
          <p className="text-sm text-amber-800">
            Role: <span className="font-bold capitalize">{profile.role}</span>
          </p>
        </div>
      </div>
    </div>
  );
}