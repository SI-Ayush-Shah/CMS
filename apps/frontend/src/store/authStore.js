import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check dummy admin credentials
          if (
            email === "ayush.shah@sportzinteractive.net" &&
            password === "sportz@123"
          ) {
            const user = {
              id: "1",
              email: "ayush.shah@sportzinteractive.net",
              name: "Admin User",
              role: "admin",
            };

            set({
              isAuthenticated: true,
              user,
              isLoading: false,
              error: null,
            });

            return { success: true, user };
          } else {
            throw new Error("Invalid credentials");
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message || "Login failed",
          });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      // Getters
      getUser: () => get().user,
      getIsAuthenticated: () => get().isAuthenticated,
      getIsLoading: () => get().isLoading,
      getError: () => get().error,
    }),
    {
      name: "auth-storage", // unique name for localStorage key
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }), // only persist these fields
    }
  )
);

export default useAuthStore;
