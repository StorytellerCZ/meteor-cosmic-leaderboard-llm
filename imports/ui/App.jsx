import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Leaderboard } from './Leaderboard.jsx';
import { AuthPage } from './auth';
import { UserMenu } from './auth';

export const App = () => {
  // Track if user is logged in
  const { user, isLoading } = useTracker(() => {
    const user = Meteor.user();
    const isLoading = Meteor.loggingIn();
    return { user, isLoading };
  });
  
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Cosmic Leaderboard</h1>
        {user && <UserMenu />}
      </header>
      
      {isLoading ? (
        <div className="loading">Initializing Starmap...</div>
      ) : user ? (
        <Leaderboard />
      ) : (
        <AuthPage />
      )}
    </div>
  );
};
