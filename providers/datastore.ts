// Je vais ecrire le store en utilisant zustand avec persistance en sessionStorage
import { User } from "@/types/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface Store {
  user?: User;
  isHydrated: boolean;
  token?: string;
  setIsHydrated: (v: boolean) => void;
  login: ({ user, token }: { user: User; token: string }) => void;
  logout: () => void;
  update: ({ user }: { user: User }) => void;
  isSignataire: boolean;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      user: undefined,
      isHydrated: false,
      token: undefined,
      isSignataire: false,
      setIsHydrated: (v: boolean) => set({ isHydrated: v }),
      login: ({ user, token }) =>
        set({
          user: user,
          token: token,
          isSignataire: user.signatairs && user.signatairs.length > 0,
        }),
      logout: () =>
        set({ user: undefined, token: undefined, isSignataire: false }),
      update: ({ user }) => set({ user: user }),
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
    },
  ),
);
