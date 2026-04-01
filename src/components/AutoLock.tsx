import React, { useState, useEffect, useRef } from 'react';
import { UserRole } from '../types';
import AuthScreen from './AuthScreen';
import { AnimatePresence } from 'motion/react';

interface AutoLockProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  userRole: UserRole;
  onReAuthenticate: (role: UserRole) => void;
  lockTimeSeconds?: number;
}

export default function AutoLock({ 
  children, 
  isAuthenticated, 
  userRole, 
  onReAuthenticate, 
  lockTimeSeconds = 60 
}: AutoLockProps) {
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isLocked && isAuthenticated) {
      timerRef.current = setTimeout(() => {
        setIsLocked(true);
      }, lockTimeSeconds * 1000);
    }
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimer();
    };

    if (isAuthenticated && !isLocked) {
      events.forEach(event => document.addEventListener(event, handleActivity));
      resetTimer();
    }

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated, isLocked]);

  const handleAuthenticated = (role: UserRole) => {
    // Only unlock if the role matches or is admin
    if (role === 'admin' || role === userRole) {
      setIsLocked(false);
      onReAuthenticate(role);
    }
  };

  return (
    <>
      {children}
      <AnimatePresence>
        {isLocked && (
          <AuthScreen 
            onAuthenticated={handleAuthenticated} 
            isLocked={true} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
