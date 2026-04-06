"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [name, setName] = useState(user?.fullName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const profileMutation = useMutation({
    mutationFn: async () => {
      const firstName = name.split(" ")[0];
      const lastName = name.split(" ").slice(1).join(" ") || "";
      await user?.update({ firstName, lastName });
      // Also sync to backend
      await apiClient.patch("/auth/profile", { name });
    },
    onSuccess: () => toast.success("Profile updated."),
    onError: () => toast.error("Failed to update profile."),
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      apiClient.post("/auth/change-password", { currentPassword, newPassword }),
    onSuccess: () => {
      toast.success("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to change password.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete("/auth/account");
      await user?.delete();
    },
    onSuccess: () => {
      toast.success("Account deleted.");
      signOut({ redirectUrl: "/" });
    },
    onError: () => toast.error("Failed to delete account."),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-[20px] font-bold text-zinc-900 tracking-tight">Settings</h1>
        <p className="text-[13px] text-zinc-400 mt-0.5">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-zinc-200 rounded-2xl p-6"
      >
        <h2 className="text-[14px] font-semibold text-zinc-900 mb-5">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-zinc-700 mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-[14px] text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-zinc-700 mb-1.5">Email address</label>
            <input
              type="email"
              value={user?.primaryEmailAddress?.emailAddress || ""}
              disabled
              className="w-full border border-zinc-100 rounded-xl px-4 py-3 text-[14px] text-zinc-400 bg-zinc-50 cursor-not-allowed"
            />
            <p className="text-[11px] text-zinc-400 mt-1.5">Email cannot be changed.</p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => profileMutation.mutate()}
              disabled={profileMutation.isPending || name === user?.fullName}
              className="flex items-center gap-2 bg-zinc-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              {profileMutation.isPending && <Loader2 size={12} className="animate-spin" />}
              Save changes
            </button>
          </div>
        </div>
      </motion.div>

      {/* Password */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-zinc-200 rounded-2xl p-6"
      >
        <h2 className="text-[14px] font-semibold text-zinc-900 mb-5">Change password</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-zinc-700 mb-1.5">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-[14px] text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-zinc-700 mb-1.5">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-[14px] text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => passwordMutation.mutate()}
              disabled={passwordMutation.isPending || !currentPassword || !newPassword}
              className="flex items-center gap-2 bg-zinc-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              {passwordMutation.isPending && <Loader2 size={12} className="animate-spin" />}
              Update password
            </button>
          </div>
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-red-100 rounded-2xl p-6"
      >
        <h2 className="text-[14px] font-semibold text-zinc-900 mb-2">Danger zone</h2>
        <p className="text-[13px] text-zinc-500 mb-4">
          Permanently delete your account and all generated websites. This cannot be undone.
        </p>
        <button
          onClick={() => {
            if (confirm("Are you sure? This will permanently delete your account and all websites.")) {
              deleteMutation.mutate();
            }
          }}
          disabled={deleteMutation.isPending}
          className="text-[13px] font-medium text-red-500 border border-red-100 px-4 py-2 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all"
        >
          {deleteMutation.isPending ? "Deleting..." : "Delete account"}
        </button>
      </motion.div>
    </div>
  );
}
