"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DEMO_USERS, DemoUser, UserRole } from "@/lib/types";
import { BUSINESS_ENTITIES, BusinessEntityConfig } from "@/lib/business-entities";

interface AppContextType {
  currentUser: DemoUser;
  setCurrentUser: (user: DemoUser) => void;
  selectedEntityCode: string; // "ALL" or specific entity code like "ROAD_INFRA"
  setSelectedEntityCode: (code: string) => void;
  selectedEntityConfig?: BusinessEntityConfig;
  allEntities: BusinessEntityConfig[];
  toast: { message: string; type: "success" | "error" | "info" } | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  isAuthenticated: boolean;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<DemoUser>(DEMO_USERS[0]);
  const [selectedEntityCode, setSelectedEntityCodeState] = useState<string>("ALL");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Read auth & preferences from localStorage on mount
    const savedAuth = localStorage.getItem("fala_authenticated");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
    const savedUserRole = localStorage.getItem("fala_active_role");
    if (savedUserRole) {
      const found = DEMO_USERS.find((u) => u.role === savedUserRole);
      if (found) setCurrentUserState(found);
    }
    const savedEntity = localStorage.getItem("fala_active_entity");
    if (savedEntity) {
      setSelectedEntityCodeState(savedEntity);
    }
  }, []);

  const login = (username: string, pass: string): boolean => {
    const cleanUser = username.trim();
    if (cleanUser === "Pentacloud" && pass === "Pentacloud@2026") {
      setIsAuthenticated(true);
      localStorage.setItem("fala_authenticated", "true");
      document.cookie = "fala_authenticated=true; path=/; max-age=604800";
      showToast("Access Granted: Welcome to Fala Road ERP Platform!", "success");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("fala_authenticated");
    document.cookie = "fala_authenticated=; path=/; max-age=0";
    showToast("Signed out of ERP platform.", "info");
  };

  const setCurrentUser = (user: DemoUser) => {
    setCurrentUserState(user);
    localStorage.setItem("fala_active_role", user.role);
    document.cookie = `fala_active_role=${user.role}; path=/; max-age=604800`;
    document.cookie = `fala_active_user_name=${encodeURIComponent(user.name)}; path=/; max-age=604800`;
  };

  const setSelectedEntityCode = (code: string) => {
    setSelectedEntityCodeState(code);
    localStorage.setItem("fala_active_entity", code);
    document.cookie = `fala_active_entity=${code}; path=/; max-age=604800`;
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const selectedEntityConfig = BUSINESS_ENTITIES.find((e) => e.code === selectedEntityCode);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        selectedEntityCode,
        setSelectedEntityCode,
        selectedEntityConfig,
        allEntities: BUSINESS_ENTITIES,
        toast,
        showToast,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border bg-white animate-in slide-in-from-bottom-2 duration-200">
          <div
            className={`w-3 h-3 rounded-full ${
              toast.type === "success" ? "bg-emerald-500" : toast.type === "error" ? "bg-rose-500" : "bg-blue-500"
            }`}
          />
          <p className="text-sm font-medium text-slate-800">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
