import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

/**
 * LoginForm component provides a form for users to log in
 * @param {Object} props - Component props
 * @param {Function} props.onSwitchToRegister - Callback to switch to registration form
 */
export const LoginForm = ({ onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoggingIn(true);
    
    try {
      Meteor.loginWithPassword(username, password, (err) => {
        if (err) {
          // Handle different error types safely
          setError(
            err.message || 
            (Object.prototype.hasOwnProperty.call(err, 'reason') ? err.reason : 'Login failed. Please check your credentials.')
          );
          setIsLoggingIn(false);
        }
      });
      // Login successful - no need to do anything as Meteor will update the UI
    } catch (err) {
      // Handle different error types safely
      setError(
        err.message || 
        (Object.prototype.hasOwnProperty.call(err, 'reason') ? err.reason : 'Login failed. Please check your credentials.')
      );
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login</h2>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            disabled={isLoggingIn}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={isLoggingIn}
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="auth-switch">
        Don't have an account?{' '}
        <button 
          type="button"
          className="text-button"
          onClick={() => onSwitchToRegister()}
          disabled={isLoggingIn}
        >
          Register
        </button>
      </div>
    </div>
  );
};
