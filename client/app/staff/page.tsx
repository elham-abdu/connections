"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { 
  Calendar, 
  User, 
  Loader2, 
  Save, 
  Star, 
  CheckCircle, 
  Bell, 
  Briefcase,
  Crown,
  Menu,
  X,
  LogOut,
  Sparkles,
  Heart,
  Clock,
  Check
} from "lucide-react";
import Link from "next/link";

export default function StaffProfile() {
  const { user, session, profile: authProfile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [myDates, setMyDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      if (!session || !user) return;
      try {
        const headers = { "Authorization": `Bearer ${session?.access_token}` };
        
        const [staffRes, shiftsRes, notifRes] = await Promise.all([
          fetch(`${API_URL}/api/staff`, { headers }),
          fetch(`${API_URL}/api/staff/${user.id}/shifts`, { headers }),
          fetch(`${API_URL}/api/staff/${user.id}/notifications`, { headers })
        ]);

        const allStaff = await staffRes.json();
        const me = allStaff.find((s: any) => s.email === user?.email);
        
        if (me) {
          setProfile(me);
          setMyDates(me.availability || []);
          setShifts(await shiftsRes.json());
          setNotifications(await notifRes.json());
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
      setLoading(false);
    };
    if (session) loadData();
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0806] flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-400" size={40} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0806] font-serif">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0806] via-[#14110e] to-[#0a0806] -z-10" />
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/subtle-grey.png')] opacity-20 -z-10" />

      {/* Fixed Glass Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-black/30 backdrop-blur-xl border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 lg:h-20">
              <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                <Crown className="text-amber-400" size={22} />
                <div>
                  <h1 className="text-lg font-light tracking-[0.15em] uppercase">
                    <span className="font-serif italic text-amber-400 font-normal">Pulse</span>
                    <span className="text-stone-400 text-[8px] font-sans ml-1 tracking-[0.2em]">HOSPITALITY</span>
                  </h1>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                <span className="text-amber-400 text-xs font-sans tracking-[0.15em] uppercase">
                  Staff Portal
                </span>
              </nav>

              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full">
                  <Sparkles className="text-amber-400" size={12} />
                  <span className="text-amber-400 text-[10px] font-sans tracking-wider uppercase">
                    {profile?.role || "Staff"}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-xs font-sans tracking-[0.1em] uppercase text-stone-300 hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              </div>

              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-amber-400"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-black/80 backdrop-blur-xl border-b border-amber-500/20">
            <div className="px-6 py-6 flex flex-col gap-4">
              <button onClick={() => signOut()} className="text-stone-300 hover:text-amber-400 text-sm flex items-center gap-2">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/20 mb-4">
              <Sparkles size={10} className="text-amber-400" />
              <span className="text-amber-400 text-[10px] tracking-[0.3em] font-sans uppercase">Staff Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-light text-white">
              Welcome back, <span className="text-amber-400 italic">{profile?.full_name?.split(" ")[0] || "Staff"}</span>
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT COLUMN: Profile & Performance */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-black/40 backdrop-blur-xl border border-amber-500/20 rounded-sm p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 flex items-center justify-center">
                    <User className="text-black" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif text-white">{profile?.full_name}</h2>
                    <p className="text-stone-400 text-sm capitalize">{profile?.role}</p>
                  </div>
                </div>
                <div className="text-stone-400 text-sm space-y-2">
                  <p><span className="text-stone-500">Bio:</span> {profile?.bio || "No bio added yet."}</p>
                  <p><span className="text-stone-500">Experience:</span> {profile?.experience || "No experience listed."}</p>
                </div>
              </div>

              {/* Performance Card */}
              <div className="bg-black/40 backdrop-blur-xl border border-amber-500/20 rounded-sm p-6">
                <h3 className="font-serif text-white mb-4 flex items-center gap-2">
                  <Star className="text-amber-400" size={18} /> Performance
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile?.vibe_tags?.map((t: string) => (
                    <span key={t} className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-sans tracking-wide">
                      {t}
                    </span>
                  )) || <span className="text-stone-500 text-xs">No vibe grades yet</span>}
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-400">Loyalty Score</span>
                    <span className="text-amber-400">{profile?.loyalty_score || 0}%</span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full" style={{ width: `${profile?.loyalty_score || 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Notifications, Shifts, Availability */}
            <div className="md:col-span-2 space-y-6">
              {/* Notifications */}
              <div className="bg-black/40 backdrop-blur-xl border border-amber-500/20 rounded-sm p-6">
                <h3 className="font-serif text-white mb-4 flex items-center gap-2">
                  <Bell className="text-amber-400" size={18} /> Notifications
                </h3>
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} className="bg-black/40 border border-amber-500/10 rounded-sm p-3 mb-2">
                      <p className="text-white text-sm font-medium">{n.title}</p>
                      <p className="text-stone-400 text-xs mt-1">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-500 text-sm italic">No new notifications</p>
                )}
              </div>

              {/* Shifts */}
              <div className="bg-black/40 backdrop-blur-xl border border-amber-500/20 rounded-sm p-6">
                <h3 className="font-serif text-white mb-4 flex items-center gap-2">
                  <Briefcase className="text-amber-400" size={18} /> Upcoming Shifts
                </h3>
                {shifts.length > 0 ? (
                  shifts.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-3 border-b border-amber-500/10 last:border-0">
                      <div>
                        <p className="text-white text-sm font-medium">{s.date}</p>
                        <p className="text-stone-500 text-xs">{s.start_time} - {s.end_time}</p>
                      </div>
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-sans uppercase tracking-wide">
                        {s.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-500 text-sm italic">No upcoming shifts</p>
                )}
              </div>

              {/* Availability */}
              <div className="bg-black/40 backdrop-blur-xl border border-amber-500/20 rounded-sm p-6">
                <h3 className="font-serif text-white mb-4 flex items-center gap-2">
                  <Calendar className="text-amber-400" size={18} /> Availability
                </h3>
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {weekDays.map(day => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`py-2 rounded-sm text-xs font-sans tracking-wide transition-all ${
                        myDates.includes(day) 
                          ? "bg-amber-500 text-black font-bold" 
                          : "bg-stone-900/50 border border-amber-500/20 text-stone-400 hover:border-amber-500/50"
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={saveSchedule}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-black py-3 rounded-sm font-sans font-bold text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/20 transition-all"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : saveSuccess ? (
                    <><Check size={14} /> Saved</>
                  ) : (
                    <><Save size={14} /> Sync My Schedule</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-black/80 backdrop-blur-md border-t border-amber-500/10">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Crown className="text-amber-400" size={14} />
              <p className="text-stone-500 text-[9px] font-sans tracking-[0.2em] uppercase">
                © 2026 Pulse Intelligence Systems — Staff Portal
              </p>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-stone-500 hover:text-amber-400 text-[9px] tracking-[0.15em] uppercase transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-stone-500 hover:text-amber-400 text-[9px] tracking-[0.15em] uppercase transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}