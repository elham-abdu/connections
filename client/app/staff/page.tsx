"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Users, UserPlus, Star, ArrowLeft, X, CheckCircle2, Loader2, Mail, Crown, Trash2, LogOut } from "lucide-react";
import Link from "next/link";

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  loyalty_score: number;
  vibe_tags: string[];
}

export default function StaffDirectory() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newStaff, setNewStaff] = useState({
    full_name: "",
    email: "",
    role: "waiter",
    vibe_tags: ""
  });

  const { user, session, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Redirect if not logged in
  useEffect(() => {
    if (!session && !loading) {
      router.push('/login');
    }
  }, [session, router]);

  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session?.access_token || ''}`
    };
  };

  const fetchStaff = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/staff`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      const staffData = Array.isArray(data) ? data : data.value || [];
      setStaff(staffData);
    } catch (err) {
      console.error("Failed to fetch staff", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      fetchStaff();
    }
  }, [session]);

  const handleHire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Admin access required to hire staff");
      return;
    }
    
    setSubmitting(true);
    const tagsArray = newStaff.vibe_tags.split(",").map(t => t.trim()).filter(t => t !== "");
    
    try {
      const response = await fetch(`${API_URL}/api/staff`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          full_name: newStaff.full_name,
          email: newStaff.email,
          role: newStaff.role, 
          vibe_tags: tagsArray,
          loyalty_score: 100
        }),
      });
      
      if (response.status === 403) {
        alert("Admin access required to hire staff");
      } else if (response.ok) {
        setNewStaff({ full_name: "", email: "", role: "waiter", vibe_tags: "" });
        setShowForm(false);
        fetchStaff();
      } else {
        const error = await response.json();
        alert(`Failed to hire: ${error.error}`);
      }
    } catch (err) {
      alert("Failed to connect to server");
      console.error(err);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      alert("Admin access required to delete staff");
      return;
    }
    
    if (!confirm("Are you sure you want to remove this staff member?")) return;

    try {
      const response = await fetch(`${API_URL}/api/staff/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.status === 403) {
        alert("Admin access required to delete staff");
      } else if (response.ok) {
        setStaff(staff.filter((member) => member.id !== id));
        alert("Staff member removed successfully");
      } else {
        alert("Failed to delete staff member");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error connecting to server");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-stone-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Header Section with User Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link href="/" className="text-amber-700 hover:text-amber-800 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-amber-600" />
              <div>
                <h1 className="text-2xl md:text-4xl font-serif font-bold text-stone-800">
                  Staff Registry
                </h1>
                <p className="text-stone-500 text-sm hidden md:block">Onboard and manage your luxury service team</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <p className="text-sm font-medium text-stone-700">{user?.user_metadata?.full_name || user?.email}</p>
              <p className="text-xs text-stone-400 capitalize">{isAdmin ? 'Admin' : 'Staff'}</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 text-stone-600" />
            </button>
            <button 
              onClick={() => setShowForm(!showForm)}
              disabled={!isAdmin}
              className={`px-4 md:px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg font-semibold text-sm md:text-base ${
                showForm 
                  ? 'bg-stone-200 text-stone-700' 
                  : isAdmin 
                    ? 'bg-stone-800 text-white hover:bg-stone-700' 
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              {showForm ? <X className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              <span className="hidden md:inline">{showForm ? "Cancel" : "Hire New Staff"}</span>
            </button>
          </div>
        </div>

        {/* Mobile subtitle */}
        <p className="text-stone-500 text-sm mb-6 md:hidden">Onboard and manage your luxury service team</p>

        {/* Hiring Form */}
        {showForm && (
          <div className="mb-8 bg-white p-6 rounded-2xl border-2 border-amber-100 shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-stone-800">
              <CheckCircle2 className="w-5 h-5 text-amber-600" /> New Staff Details
            </h2>
            <form onSubmit={handleHire} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-stone-700 block mb-2">Full Name *</label>
                <input 
                  required
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
                  placeholder="e.g., Abebe Bikila"
                  value={newStaff.full_name}
                  onChange={(e) => setNewStaff({...newStaff, full_name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-semibold text-stone-700 block mb-2">Email *</label>
                <input 
                  required
                  type="email"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
                  placeholder="e.g., abebe@example.com"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-semibold text-stone-700 block mb-2">Role *</label>
                <select 
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                >
                  <option value="waiter">Waiter</option>
                  <option value="bartender">Bartender</option>
                  <option value="host">Host</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-stone-700 block mb-2">Vibe Tags * (comma separated)</label>
                <input 
                  required
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
                  placeholder="e.g., energetic, polite, fast"
                  value={newStaff.vibe_tags}
                  onChange={(e) => setNewStaff({...newStaff, vibe_tags: e.target.value})}
                />
              </div>
              
              <div className="md:col-span-2">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Official Hire"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Staff Table - Mobile Optimized */}
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-800 text-white">
                <tr>
                  <th className="px-6 py-4 font-serif font-medium">Name</th>
                  <th className="px-6 py-4 font-serif font-medium">Email</th>
                  <th className="px-6 py-4 font-serif font-medium">Role</th>
                  <th className="px-6 py-4 font-serif font-medium text-center">Loyalty</th>
                  <th className="px-6 py-4 font-serif font-medium">Personal Vibes</th>
                  <th className="px-6 py-4 font-serif font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-amber-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-stone-800">{member.full_name}</td>
                    <td className="px-6 py-4 text-stone-600 text-sm">{member.email}</td>
                    <td className="px-6 py-4">
                      <span className="capitalize px-3 py-1 bg-stone-100 text-stone-700 rounded-lg text-xs font-bold">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5 bg-amber-100 w-16 mx-auto py-1 rounded-full">
                        <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                        <span className="font-black text-amber-900 text-sm">{member.loyalty_score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {member.vibe_tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-stone-50 text-stone-500 rounded-full text-[9px] font-bold uppercase border border-stone-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(member.id)}
                          className="text-stone-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-stone-100">
            {staff.map((member) => (
              <div key={member.id} className="p-4 hover:bg-amber-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-stone-800 text-lg">{member.full_name}</h3>
                    <p className="text-stone-500 text-sm">{member.email}</p>
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(member.id)}
                      className="text-stone-400 hover:text-red-600 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="capitalize px-3 py-1 bg-stone-100 text-stone-700 rounded-lg text-xs font-bold">
                    {member.role}
                  </span>
                  <span className="flex items-center gap-1.5 bg-amber-100 px-3 py-1 rounded-full">
                    <Star className="w-3 h-3 text-amber-600 fill-amber-600" />
                    <span className="font-black text-amber-900 text-xs">{member.loyalty_score}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {member.vibe_tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
              <p className="text-stone-500">Loading staff registry...</p>
            </div>
          )}
          {!loading && staff.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
                <Users className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-stone-500">No staff members found. Start by hiring your first candidate!</p>
            </div>
          )}
        </div>
        
        {!loading && staff.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-stone-400 text-sm">
              Total Team Members: <span className="font-bold text-amber-600">{staff.length}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}