import React from 'react';
import AuthGuard from './AuthGuard';

interface ProtectedScreenProps {
  children: React.ReactNode;
  fallbackMessage?: string;
  redirectTo?: string;
  showLoginPrompt?: boolean;
}

/**
 * Higher-order component that wraps screens requiring authentication
 * Usage: <ProtectedScreen>{YourScreenContent}</ProtectedScreen>
 */
const ProtectedScreen: React.FC<ProtectedScreenProps> = ({
  children,
  fallbackMessage,
  redirectTo,
  showLoginPrompt,
}) => {
  return (
    <AuthGuard
      fallbackMessage={fallbackMessage}
      redirectTo={redirectTo}
      showLoginPrompt={showLoginPrompt}
    >
      {children}
    </AuthGuard>
  );
};

export default ProtectedScreen;