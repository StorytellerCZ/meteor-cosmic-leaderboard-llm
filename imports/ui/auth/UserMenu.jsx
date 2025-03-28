import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

/**
 * UserMenu component displays the current user and logout button
 */
export const UserMenu = () => {
  // Track the current user
  const { user, isLoading } = useTracker(() => {
    const user = Meteor.user();
    const isLoading = Meteor.loggingIn();
    return { user, isLoading };
  });

  const handleLogout = () => {
    Meteor.logout((error) => {
      if (error) {
        console.error('Logout failed:', error);
      }
    });
  };

  if (isLoading) {
    return <div className="user-menu">Loading...</div>;
  }

  if (!user) {
    return null; // Don't render anything if no user is logged in
  }

  return (
    <div className="user-menu">
      <span className="username">Welcome, {user.username}!</span>
      <button 
        type="button" 
        className="logout-button"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};
