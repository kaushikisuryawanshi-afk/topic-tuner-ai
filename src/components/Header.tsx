import React from 'react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-primary border-b shadow-sm">
      <div className="w-full px-6 py-4">
        <h1 className="text-xl font-bold text-primary-foreground text-center">
          AI Study Planner
        </h1>
      </div>
    </header>
  );
};

export default Header;