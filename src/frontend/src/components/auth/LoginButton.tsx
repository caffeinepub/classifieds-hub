import { useState } from 'react';
import { useMobileAuth } from '../../hooks/useMobileAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import MobileAuthModal from './MobileAuthModal';

export default function LoginButton() {
  const { isAuthenticated, logout, isLoading } = useMobileAuth();
  const queryClient = useQueryClient();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await logout();
      queryClient.clear();
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <Button
        onClick={handleAuth}
        disabled={isLoading}
        variant={isAuthenticated ? 'outline' : 'default'}
        className="flex items-center gap-2"
      >
        {isAuthenticated ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
        {isLoading ? 'Loading...' : isAuthenticated ? 'Logout' : 'Login'}
      </Button>

      <MobileAuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
}
