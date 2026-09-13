import { create } from "zustand";

import * as authService from "@/services/auth.service";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    const user = authService.getCurrentUser();

    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
  },

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      const user = await authService.login(email, password);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  registerCustomer: async (formData) => {
    set({ isLoading: true });

    try {
      const user = await authService.registerCustomer(formData);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  registerWorker: async (formData) => {
    set({ isLoading: true });

    try {
      const user = await authService.registerWorker(formData);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return user;
    } catch (error) {
      set({ isLoading: false });

      throw error;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true });

    try {
      const response = await authService.forgotPassword(email);

      set({ isLoading: false });

      return response;
    } catch (error) {
      set({ isLoading: false });

      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    await authService.logout();

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
