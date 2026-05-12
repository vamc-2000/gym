"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { dashboardService } from "@/lib/services/dashboardService";
import { triggerToast } from "@/components/NotificationManager";
import InputField from "@/components/ui/InputField";
import SubmitButton from "@/components/ui/SubmitButton";

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Record<string, any> | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getSuperAdminAdmins();
      if (res.success) {
        setAdmins(res.data as Record<string, any>[]);

      }
    } catch (_err) {
      triggerToast("Error", "Failed to fetch admins", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdmins();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!form.name || !form.email || (!editingAdmin && !form.password)) {
      triggerToast("Validation", "Please fill all required fields", "info");
      return;
    }

    setActionLoading("form");
    try {
      let res;
      if (editingAdmin) {
        res = await dashboardService.updateAdmin(editingAdmin.id, { name: form.name, email: form.email });
      } else {
        res = await dashboardService.createAdmin(form);
      }

      if (res.success) {
        triggerToast("Success", editingAdmin ? "Admin updated" : "Admin created successfully", "success");
        setIsModalOpen(false);
        setEditingAdmin(null);
        setForm({ name: "", email: "", password: "" });
        fetchAdmins();
      } else {
        triggerToast("Error", res.error || "Operation failed", "error");
      }
    } catch {
      triggerToast("Error", "Something went wrong", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this administrator? This action cannot be undone.")) return;
    
    setActionLoading(id);
    try {
      const res = await dashboardService.deleteAdmin(id);
      if (res.success) {
        triggerToast("Deleted", "Administrator removed", "success");
        fetchAdmins();
      }
    } catch {
      triggerToast("Error", "Failed to delete admin", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (admin: any) => {
    setEditingAdmin(admin);
    setForm({ name: admin.name, email: admin.email, password: "" });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dash-text mb-1">👮 Manage Administrators</h1>
          <p className="text-dash-text-dim text-sm">Control platform staff and system permissions</p>
        </div>
        <button 
          onClick={() => {
            setEditingAdmin(null);
            setForm({ name: "", email: "", password: "" });
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-neon-blue text-dash-bg rounded-xl text-sm font-bold shadow-lg shadow-neon-blue/20 hover:scale-[1.02] transition-all cursor-pointer"
        >
          + Add New Admin
        </button>
      </div>

      <div className="glass-panel rounded-3xl border border-dash-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dash-text/5 text-dash-text-dim opacity-30 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Admin Identity</th>
                <th className="px-8 py-5">Last Activity</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dash-border-subtle">
              {loading ? (
                <tr><td colSpan={3} className="px-8 py-20 text-center text-dash-text-dim opacity-10 animate-pulse font-bold tracking-widest uppercase">Loading Secure Data...</td></tr>
              ) : admins.length > 0 ? (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-dash-text/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                          {admin.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-dash-text font-bold text-sm">{admin.name}</p>
                          <p className="text-dash-text-dim opacity-30 text-xs">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-dash-text-dim opacity-40 text-xs">
                        {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : "Never logged in"}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          disabled={!!actionLoading}
                          onClick={() => openEditModal(admin)}
                          className="px-4 py-2 bg-dash-text/5 border border-dash-border-subtle text-dash-text-dim opacity-60 hover:text-dash-text hover:border-dash-text-dim/20 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button 
                          disabled={!!actionLoading}
                          onClick={() => handleDelete(admin.id)}
                          className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {actionLoading === admin.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="px-8 py-20 text-center text-dash-text-dim opacity-20">No administrators found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-dash-card border border-dash-border-subtle rounded-3xl p-8 shadow-2xl"
              >
                <h2 className="text-2xl font-bold text-dash-text mb-6">
                  {editingAdmin ? "Edit Administrator" : "Add New Administrator"}
                </h2>
              
              <div className="space-y-4 mb-8">
                <InputField 
                  label="Full Name"
                  variant="dark"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder="e.g. John Doe"
                />
                <InputField 
                  label="Email Address"
                  type="email"
                  variant="dark"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  placeholder="admin@gymstreak.com"
                />
                {!editingAdmin && (
                  <InputField 
                    label="Initial Password"
                    type="password"
                    variant="dark"
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                    placeholder="Min 8 characters"
                  />
                )}
              </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-dash-text/5 text-dash-text-dim opacity-40 font-bold rounded-xl border border-dash-border-subtle hover:bg-dash-text/10 transition-all"
                  >
                    Cancel
                  </button>
                <SubmitButton 
                  onClick={handleCreateOrUpdate}
                  loading={actionLoading === "form"}
                  variant="neon"
                >
                  {editingAdmin ? "Save Changes" : "Create Account"}
                </SubmitButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
