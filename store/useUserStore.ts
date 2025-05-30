import { User } from "@/types/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface store {
    user?: User;
    login: (data: User) => void;
    logout: () => void;
}

const useStore = create<store>()(
    persist(
        (set, get)=> ({
            user: undefined,
            login: (data: User)=>set({user: data}),
            logout: ()=>set({user: undefined})
        }),
        {
            name: "creapp",
            storage: createJSONStorage(()=> sessionStorage),
        }
    )
)

export default useStore;;