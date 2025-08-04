import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '@/lib/types';
import bcrypt from 'bcryptjs';

// This is a simple authentication store for demo purposes
// In a real application, you would validate against your backend API
const HASHED_PASSWORD = '$2b$10$61gmfnkRZD0DCLbALKCatutiEwb2XwPrF1Mr6kbsMOrYx51gsU0YW'; // Replace with actual hash

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (username: string, password: string) => {
        // Use email for login
        if (username === "rajaratafire@gmail.com" && bcrypt.compareSync(password, HASHED_PASSWORD)) {
          const user: User = { 
            username: "rajaratafire@gmail.com", 
            password: "",  // Don't store password in state
            isAdmin: true 
          };
          
          set({ user, isAuthenticated: true });
          return true;
        }
        
        return false;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage', // name of the item in localStorage
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore;