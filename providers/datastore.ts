// Je vais ecrire le store en utilisant zustand avec persistance en sessionStorage
import { storedUser, User } from "@/types/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface Store {
  user?: storedUser;
  isHydrated: boolean;
  token?: string;
  setIsHydrated: (v: boolean) => void;
  login: ({user, token}: {user:storedUser, token:string}) => void;
  logout: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      user: undefined,
      isHydrated: false,
      token: undefined,
      setIsHydrated: (v: boolean) => set({ isHydrated: v }),
      login: ({user, token}) => set({ user: user, token:token }),
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
