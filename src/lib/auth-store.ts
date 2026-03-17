import { create } from "zustand";
import { pb } from "./pocketbase";
import type { RecordModel } from "pocketbase";
import type { UserRole } from "@/types";

interface AuthState {
  user: RecordModel | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  refresh: () => void;
  isTeacher: () => boolean;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: pb.authStore.record,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      await pb.collection("users").authWithPassword(email, password);
      set({ user: pb.authStore.record });
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (email, password, name, role) => {
    set({ isLoading: true });
    try {
      await pb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
        name,
        role,
      });
      await pb.collection("users").authWithPassword(email, password);
      set({ user: pb.authStore.record });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    pb.authStore.clear();
    set({ user: null });
  },

  refresh: () => {
    set({ user: pb.authStore.record });
  },

  isTeacher: () => get().user?.role === "teacher",
}));
