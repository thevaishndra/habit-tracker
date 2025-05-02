import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningup: false,
  isLoggingin: false,
  isCheckingAuth: true,
}))
//it helps to manage the authentication state of the user in the application.