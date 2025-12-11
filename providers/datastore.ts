// Je vais ecrire le store en utilisant zustand avec persistance en sessionStorage
import { User } from "@/types/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface Store {
  user?: User;
  isHydrated: boolean;
  setIsHydrated: (v: boolean) => void;
  login: (data: User) => void;
  logout: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      user: undefined,
      isHydrated: false,
      setIsHydrated: (v: boolean) => set({ isHydrated: v }),
      login: (data: User) => set({ user: data }),
      logout: () => set({ user: undefined }),
    }),
    {
      name: "creapp-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ...state,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setIsHydrated(true);
      },
    }
  )
);
