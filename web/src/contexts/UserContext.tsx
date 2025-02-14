import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '../api/hooks';
import { User } from '../api/client';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  setCurrentUserId: (id: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    // Try to get the user ID from localStorage on initial load
    return localStorage.getItem('currentUserId');
  });

  const { data: user, isLoading, error } = useUser(currentUserId || undefined);

  // Update localStorage when currentUserId changes
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('currentUserId', currentUserId);
    } else {
      localStorage.removeItem('currentUserId');
    }
  }, [currentUserId]);

  return (
    <UserContext.Provider 
      value={{ 
        user: user || null, 
        isLoading, 
        error: error instanceof Error ? error : null,
        setCurrentUserId 
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within a UserProvider');
  }
  return context;
} 