import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check localStorage and apply saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Save to localStorage for persistence
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-primary border-b shadow-sm">
      <div className="w-full px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary-foreground flex-1 text-center">
          AI Study Planner
        </h1>
        <div className="flex items-center gap-2">
          {!loading && user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              Sign Out
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="text-primary-foreground hover:bg-primary-foreground/10 text-xl"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </Button>
        </div>
      </div>
    </header>
  );
};
export default Header;