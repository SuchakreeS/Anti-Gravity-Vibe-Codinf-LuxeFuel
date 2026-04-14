import React from 'react';
import Navbar from './Navbar';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-base-200 p-4 font-sans relative z-10">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}

export default Layout;
