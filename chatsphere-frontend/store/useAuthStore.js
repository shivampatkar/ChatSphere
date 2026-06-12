import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { socketService } from "../services/socket";
const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      setAuth: (token, user) => {
        set({ token, user, isAuthenticated: true });
      },

      logout: async () => {
        socketService.disconnect();
        await AsyncStorage.removeItem("chatsphere-auth");
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "chatsphere-auth",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      },
    },
  ),
);

export const waitForHydration = () => {
  return new Promise((resolve) => {
    const check = () => {
      const { hasHydrated } = useAuthStore.getState();
      if (hasHydrated) resolve();
      else setTimeout(check, 50);
    };
    check();
  });
};

export default useAuthStore;
