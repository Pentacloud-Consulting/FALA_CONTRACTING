"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Building2,
  X,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function LoginModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { login } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAutofill = () => {
    setUsername("Pentacloud");
    setPassword("Pentacloud@2026");
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      setLoading(false);
      if (success) {
        onClose();
      } else {
        setErrorMsg(
          "Invalid credentials. Please enter Username: Pentacloud and Password: Pentacloud@2026"
        );
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl border border-[#E5EAF2] bg-white p-6 sm:p-8 shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#667085] hover:text-[#101828] rounded-lg p-1.5 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Branding Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#155EEF] to-[#123B82] text-white shadow-md shadow-[#155EEF]/25">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#101828] tracking-tight">
              Fala Enterprise Portal
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Authorized CRM + ERP Operations Login
            </p>
          </div>
        </div>

        {/* Autofill Demo Chip */}
        <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#155EEF]/20 flex items-center justify-between gap-2 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#155EEF] flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Demo Credentials
            </span>
            <p className="text-[11px] text-[#667085]">
              <strong className="text-[#101828] font-mono">Pentacloud</strong> /{" "}
              <strong className="text-[#101828] font-mono">Pentacloud@2026</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={handleAutofill}
            className="shrink-0 bg-[#155EEF] hover:bg-[#123B82] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition shadow-xs"
          >
            ⚡ Auto-Fill
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#101828] mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Pentacloud"
                className="w-full rounded-xl border border-[#E5EAF2] bg-[#F7F9FC] pl-10 pr-4 py-2.5 text-xs text-[#101828] focus:bg-white focus:border-[#155EEF] focus:outline-none focus:ring-2 focus:ring-[#155EEF]/20 transition font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#101828] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Pentacloud@2026"
                className="w-full rounded-xl border border-[#E5EAF2] bg-[#F7F9FC] pl-10 pr-10 py-2.5 text-xs text-[#101828] focus:bg-white focus:border-[#155EEF] focus:outline-none focus:ring-2 focus:ring-[#155EEF]/20 transition font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#155EEF] hover:bg-[#123B82] py-3 text-xs font-bold text-white shadow-md shadow-[#155EEF]/25 disabled:opacity-50 transition active:scale-[0.99]"
          >
            {loading ? (
              <span>Verifying credentials...</span>
            ) : (
              <>
                <span>Sign In to ERP Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#E5EAF2] flex items-center justify-center gap-1.5 text-[11px] text-[#667085]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#155EEF]" />
          <span>Encrypted Enterprise Conglomerate Gateway</span>
        </div>
      </div>
    </div>
  );
}
