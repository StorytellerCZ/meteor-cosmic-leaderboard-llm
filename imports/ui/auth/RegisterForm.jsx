import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

/**
 * RegisterForm component provides a form for new users to register
 * @param {Object} props - Component props
 * @param {Function} props.onSwitchToLogin - Callback to switch to login form
 */
export const RegisterForm = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsRegistering(true);
    
    Accounts.createUser({ username, password }, (err) => {
      if (err) {
        // Handle different error types safely
        setError(
          err.message || 
          (Object.prototype.hasOwnProperty.call(err, 'reason') ? err.reason : 'Registration failed. Please try again.')
        );
      }
      // If successful, user will be automatically logged in
      setIsRegistering(false);
    });
  };

  return (
    <div className="auth-form-container">
      <h2>Register</h2>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            disabled={isRegistering}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
            disabled={isRegistering}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            disabled={isRegistering}
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={isRegistering}
        >
          {isRegistering ? 'Creating account...' : 'Register'}
        </button>
      </form>
      
      <div className="auth-switch">
        Already have an account?{' '}
        <button 
          type="button"
          className="text-button"
          onClick={() => onSwitchToLogin()}
          disabled={isRegistering}
        >
          Login
        </button>
      </div>
    </div>
  );
};
