"use client";
import { useState, useEffect } from "react";
import { Users, UserPlus, Star, ArrowLeft, X, CheckCircle2, Loader2, Mail } from "lucide-react";
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

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/staff");
      const data = await res.json();
      const staffData = Array.isArray(data) ? data : data.value || [];
      setStaff(staffData);
    } catch (err) {
      console.error("Failed to fetch staff", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleHire = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const tagsArray = newStaff.vibe_tags.split(",").map(t => t.trim()).filter(t => t !== "");
    
    try {
      const response = await fetch("http://localhost:8080/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          full_name: newStaff.full_name,
          email: newStaff.email,
          role: newStaff.role, 
          vibe_tags: tagsArray,
          loyalty_score: 100
        }),
      });
      
      if (response.ok) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-stone-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <Link href="/dashboard" className="text-amber-700 flex items-center gap-2 mb-4 hover:gap-3 transition-all font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to AI Recruitment
            </Link>
            <h1 className="text-4xl font-serif font-bold text-stone-800">
              Staff Registry
            </h1>
            <p className="text-stone-600 mt-1">Onboard and manage your luxury service team</p>
          </div>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg font-semibold ${
              showForm 
                ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' 
                : 'bg-stone-800 text-white hover:bg-stone-700'
            }`}
          >
            {showForm ? <X className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            {showForm ? "Cancel" : "Hire New Staff"}
          </button>
        </div>

        {showForm && (
          <div className="mb-10 bg-white p-8 rounded-3xl border-2 border-amber-200 shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-stone-800">
              <CheckCircle2 className="w-5 h-5 text-amber-600" /> New Staff Details
            </h2>
            <form onSubmit={handleHire} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Full Name *
                </label>
                <input 
                  required
                  className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800 placeholder:text-stone-400"
                  placeholder="e.g., Abebe Bikila"
                  value={newStaff.full_name}
                  onChange={(e) => setNewStaff({...newStaff, full_name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email *
                </label>
                <input 
                  required
                  type="email"
                  className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800 placeholder:text-stone-400"
                  placeholder="e.g., abebe@example.com"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700">Role *</label>
                <select 
                  className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                >
                  <option value="waiter">Waiter</option>
                  <option value="bartender">Bartender</option>
                  <option value="host">Host</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700">Vibe Tags * (comma separated)</label>
                <input 
                  required
                  className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800 placeholder:text-stone-400"
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

        <div className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-800 text-white">
                <tr>
                  <th className="px-8 py-5 font-serif font-medium">Name</th>
                  <th className="px-8 py-5 font-serif font-medium">Email</th>
                  <th className="px-8 py-5 font-serif font-medium">Role</th>
                  <th className="px-8 py-5 font-serif font-medium text-center">Loyalty</th>
                  <th className="px-8 py-5 font-serif font-medium">Personal Vibes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-amber-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-stone-800">{member.full_name}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-stone-600 text-sm">{member.email}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="capitalize px-3 py-1 bg-stone-100 text-stone-700 rounded-lg text-xs font-bold border border-stone-200">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-1.5 bg-amber-100 w-16 mx-auto py-1 rounded-full border border-amber-200">
                        <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                        <span className="font-black text-amber-900 text-sm">{member.loyalty_score}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2">
                        {member.vibe_tags.map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-stone-50 text-stone-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-stone-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading && (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
              <p className="text-stone-600">Loading staff registry...</p>
            </div>
          )}
          {!loading && staff.length === 0 && (
            <div className="p-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
                <Users className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-stone-600">No staff members found. Start by hiring your first candidate!</p>
            </div>
          )}
        </div>
        
        {!loading && staff.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-stone-500 text-sm">
              Total Team Members: <span className="font-bold text-amber-600">{staff.length}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}