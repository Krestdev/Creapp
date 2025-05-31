import { User } from "@/types/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface store {
    user?: User;
    isHydrated: boolean;
    login: (data: User) => void;
    logout: () => void;
}

const useStore = create<store>()(
    persist(
        (set, get)=> ({
            user: undefined,
            isHydrated: false,
            login: (data: User)=>set({user: data}),
            logout: ()=>set({user: undefined})
        }),
        {
            name: "creapp",
            storage: createJSONStorage(()=> sessionStorage),
            onRehydrateStorage: (state)=>{
                if (state) {
                    state.isHydrated = true;
                }
            }
        }
    )
)

export default useStore;;