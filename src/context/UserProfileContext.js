import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../services/supabaseService';

const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if email is available
  useEffect(() => {
    const loadProfile = async () => {
      // Check if we have user email from auth context
      const userSession = localStorage.getItem('userSession');
      if (userSession) {
        try {
          const session = JSON.parse(userSession);
          if (session.phoneNumber) {
            // Fetch from Supabase using phone as identifier (you may need to adjust)
            // For now, we'll check local email first
            const localProfile = localStorage.getItem('userProfile');
            if (localProfile) {
              const profile = JSON.parse(localProfile);
              if (profile.email) {
                const supabaseProfile = await getUserProfile(profile.email);
                if (supabaseProfile) {
                  setUserProfile(supabaseProfile);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const refreshProfile = async (email) => {
    if (!email) return;
    setLoading(true);
    try {
      const profile = await getUserProfile(email);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const setProfile = (profile) => {
    setUserProfile(profile);
  };

  const clearProfile = () => {
    setUserProfile(null);
  };

  return (
    <UserProfileContext.Provider value={{ userProfile, loading, refreshProfile, setProfile, clearProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within UserProfileProvider');
  }
  return context;
};
