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
  Bell, 
  Briefcase,
  Crown,
  Menu,
  X,
  LogOut,
  Sparkles,
  Check,
  Edit2,
  XCircle,
  Plus,
  Tag,
  Phone,
  Mail,
  MapPin,
  Globe,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function StaffProfile() {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [myDates, setMyDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Edit mode states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  
  // Profile edit states
  const [editBio, setEditBio] = useState("");
  const [editExp, setEditExp] = useState("");
  const [editVibeTags, setEditVibeTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  // Contact info states
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editEmergencyContact, setEditEmergencyContact] = useState("");
  
  // Availability temp state (only saved when clicking Save)
  const [tempDates, setTempDates] = useState<string[]>([]);

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
        
        const staffRes = await fetch(`${API_URL}/api/staff`, { headers });
        const allStaff = await staffRes.json();
        const me = allStaff.find((s: any) => s.email === user?.email);
        
        if (me) {
          setProfile(me);
          const availability = me.availability || [];
          setMyDates(availability);
          setTempDates(availability);
          setEditBio(me.bio || "");
          setEditExp(me.experience || "");
          setEditVibeTags(me.vibe_tags || []);
          setEditPhone(me.phone || "");
          setEditAddress(me.address || "");
          setEditCity(me.city || "");
          setEditEmergencyContact(me.emergency_contact || "");
        }
        
        try {
          const shiftsRes = await fetch(`${API_URL}/api/staff/${user.id}/shifts`, { headers });
          if (shiftsRes.ok) {
            const shiftsData = await shiftsRes.json();
            setShifts(Array.isArray(shiftsData) ? shiftsData : []);
          }
        } catch (err) {
          setShifts([]);
        }
        
        try {
          const notifRes = await fetch(`${API_URL}/api/staff/${user.id}/notifications`, { headers });
          if (notifRes.ok) {
            const notifData = await notifRes.json();
            setNotifications(Array.isArray(notifData) ? notifData : []);
          }
        } catch (err) {
          setNotifications([]);
        }
        
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
      setLoading(false);
    };
    if (session) loadData();
  }, [session, user]);

  // Toggle availability in temp state (doesn't save yet)
  const toggleTempDay = (day: string) => {
    setTempDates(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  // Save availability to database
  const saveAvailability = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/staff/${profile.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify({ availability: tempDates }),
      });
      if (response.ok) {
        const updated = await response.json();
        setMyDates(tempDates);
        setProfile(updated);
        setSaveSuccess(true);
        setIsEditingAvailability(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  // Cancel availability edit (revert to saved dates)
  const cancelAvailabilityEdit = () => {
    setTempDates(myDates);
    setIsEditingAvailability(false);
  };

  const addVibeTag = () => {
    if (newTag.trim() && !editVibeTags.includes(newTag.trim())) {
      setEditVibeTags([...editVibeTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeVibeTag = (tag: string) => {
    setEditVibeTags(editVibeTags.filter(t => t !== tag));
  };

  const saveProfile = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/staff/${profile.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify({ 
          bio: editBio,
          experience: editExp,
          vibe_tags: editVibeTags,
          phone: editPhone,
          address: editAddress,
          city: editCity,
          emergency_contact: editEmergencyContact
        }),
      });
      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setSaveSuccess(true);
        setIsEditingProfile(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const cancelProfileEdit = () => {
    setIsEditingProfile(false);
    setEditBio(profile?.bio || "");
    setEditExp(profile?.experience || "");
    setEditVibeTags(profile?.vibe_tags || []);
    setEditPhone(profile?.phone || "");
    setEditAddress(profile?.address || "");
    setEditCity(profile?.city || "");
    setEditEmergencyContact(profile?.emergency_contact || "");
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
            {/* LEFT COLUMN: Profile & Contact */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-black/40 backdrop-blur-xl border border-amber-500/20 rounded-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 flex items-center justify-center">
                      <User className="text-black" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-serif text-white">{profile?.full_name}</h2>
                      <p className="text-stone-400 text-sm capitalize">{profile?.role}</p>
                    </div>
                  </div>
                  
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs transition-all"
                    >
                      <Edit2 size={12} />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={cancelProfileEdit}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-all"
                      >
                        <XCircle size={12} />
                        Cancel
                      </button>
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs transition-all"
                      >
                        {saving ? <Loader2 className="animate-spin" size={12} /> : <><Save size={12} /> Save</>}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="text-stone-400 text-sm space-y-4">
                  {isEditingProfile ? (
                    <>
                      {/* Bio */}
                      <div className="flex flex-col gap-1">
                        <label className="text-stone-500 text-[10px] uppercase tracking-wider">Bio</label>
                        <textarea 
                          className="w-full bg-black/50 border border-amber-500/30 p-2 text-white rounded-sm text-sm focus:outline-none focus:border-amber-500/60 transition-all resize-none"
                          rows={2}
                          value={editBio} 
                          onChange={(e) => setEditBio(e.target.value)}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      
                      {/* Experience */}
                      <div className="flex flex-col gap-1">
                        <label className="text-stone-500 text-[10px] uppercase tracking-wider">Experience</label>
                        <textarea 
                          className="w-full bg-black/50 border border-amber-500/30 p-2 text-white rounded-sm text-sm focus:outline-none focus:border-amber-500/60 transition-all resize-none"
                          rows={2}
                          value={editExp} 
                          onChange={(e) => setEditExp(e.target.value)}
                          placeholder="Your previous experience..."
                        />
                      </div>
                      
                      {/* Vibe Tags */}
                      <div className="flex flex-col gap-1">
                        <label className="text-stone-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <Tag size={10} /> Vibe Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {editVibeTags.map((tag) => (
                            <span key={tag} className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                              {tag}
                              <button onClick={() => removeVibeTag(tag)} className="hover:text-red-400">
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addVibeTag()}
                            placeholder="Add a tag (e.g., Friendly, Professional)"
                            className="flex-1 bg-black/50 border border-amber-500/30 p-2 text-white rounded-sm text-sm focus:outline-none focus:border-amber-500/60"
                          />
                          <button
                            onClick={addVibeTag}
                            className="px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-sm transition-all"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p><span className="text-stone-500">Bio:</span> {profile?.bio || "No bio added yet."}</p>
                      <p><span className="text-stone-500">Experience:</span> {profile?.experience || "No experience listed."}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="bg-black/40 backdrop-blur-xl border border-amber-500/20 rounded-sm p-6">
                <h3 className="font-serif text-white mb-4 flex items-center gap-2">
                  <Phone className="text-amber-400" size={18} /> Contact Information
                </h3>
                {isEditingProfile ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone size={14} className="text-stone-500" />
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="flex-1 bg-black/50 border border-amber-500/30 p-2 text-white rounded-sm text-sm focus:outline-none focus:border-amber-500/60"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={14} className="text-stone-500" />
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="Street Address"
                        className="flex-1 bg-black/50 border border-amber-500/30 p-2 text-white rounded-sm text-sm focus:outline-none focus:border-amber-500/60"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe size={14} className="text-stone-500" />
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        placeholder="City / State"
                        className="flex-1 bg-black/50 border border-amber-500/30 p-2 text-white rounded-sm text-sm focus:outline-none focus:border-amber-500/60"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Bell size={14} className="text-stone-500" />
                      <input
                        type="text"
                        value={editEmergencyContact}
                        onChange={(e) => setEditEmergencyContact(e.target.value)}
                        placeholder="Emergency Contact (Name & Phone)"
                        className="flex-1 bg-black/50 border border-amber-500/30 p-2 text-white rounded-sm text-sm focus:outline-none focus:border-amber-500/60"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-stone-400 text-sm">
                    <div className="flex items-center gap-3"><Phone size={14} className="text-stone-500" />{profile?.phone || "No phone added"}</div>
                    <div className="flex items-center gap-3"><MapPin size={14} className="text-stone-500" />{profile?.address || "No address added"}</div>
                    <div className="flex items-center gap-3"><Globe size={14} className="text-stone-500" />{profile?.city || "No city added"}</div>
                    <div className="flex items-center gap-3"><Bell size={14} className="text-stone-500" />{profile?.emergency_contact || "No emergency contact"}</div>
                  </div>
                )}
              </div>

              {/* Performance Card */}
              <div className="bg-black/40 backdrop-blur-xl border border-amber-500/20 rounded-sm p-6">
                <h3 className="font-serif text-white mb-4 flex items-center gap-2">
                  <Star className="text-amber-400" size={18} /> Performance
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile?.vibe_tags?.length > 0 ? (
                    profile.vibe_tags.map((t: string) => (
                      <span key={t} className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-sans tracking-wide">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-stone-500 text-xs">No vibe tags yet</span>
                  )}
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
                  notifications.map((n, idx) => (
                    <div key={idx} className="bg-black/40 border border-amber-500/10 rounded-sm p-3 mb-2 hover:border-amber-500/30 transition-all">
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
                  <div className="space-y-2">
                    {shifts.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-black/30 border border-amber-500/10 rounded-sm hover:border-amber-500/30 transition-all">
                        <div>
                          <p className="text-white text-sm font-medium">{s.date}</p>
                          <p className="text-stone-500 text-xs flex items-center gap-1 mt-1">
                            <Clock size={10} /> {s.start_time} - {s.end_time}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-sans uppercase tracking-wide ${
                          s.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          s.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-stone-500/20 text-stone-400'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-500 text-sm italic">No upcoming shifts</p>
                )}
              </div>

              {/* Availability */}
              <div className="bg-black/40 backdrop-blur-xl border border-amber-500/20 rounded-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-white flex items-center gap-2">
                    <Calendar className="text-amber-400" size={18} /> My Availability
                  </h3>
                  
                  {!isEditingAvailability ? (
                    <button
                      onClick={() => setIsEditingAvailability(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs transition-all"
                    >
                      <Edit2 size={12} />
                      Edit Availability
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={cancelAvailabilityEdit}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-all"
                      >
                        <XCircle size={12} />
                        Cancel
                      </button>
                      <button
                        onClick={saveAvailability}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs transition-all"
                      >
                        {saving ? <Loader2 className="animate-spin" size={12} /> : <><Save size={12} /> Save</>}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {weekDays.map(day => (
                    <button
                      key={day}
                      onClick={() => isEditingAvailability && toggleTempDay(day)}
                      className={`py-2 text-xs font-sans tracking-wide transition-all rounded-sm ${
                        (isEditingAvailability ? tempDates : myDates).includes(day) 
                          ? "bg-amber-500 text-black font-bold" 
                          : "bg-stone-900/50 border border-amber-500/20 text-stone-400 hover:border-amber-500/50"
                      } ${!isEditingAvailability && "cursor-default opacity-80"}`}
                      disabled={!isEditingAvailability}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
                
                {saveSuccess && (
                  <div className="mt-3 text-center text-green-400 text-xs animate-fadeIn">
                    <Check size={14} className="inline mr-1" /> Availability saved successfully!
                  </div>
                )}
                
                {!isEditingAvailability && myDates.length > 0 && (
                  <div className="mt-4 text-center">
                    <span className="text-stone-500 text-xs">Available on: {myDates.join(", ")}</span>
                  </div>
                )}
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

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}