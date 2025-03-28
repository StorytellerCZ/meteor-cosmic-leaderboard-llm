import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

/**
 * AuthPage component manages authentication forms and switching between them
 */
export const AuthPage = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="auth-page">
      {showLogin ? (
        <LoginForm onSwitchToRegister={() => setShowLogin(false)} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setShowLogin(true)} />
      )}
    </div>
  );
};
