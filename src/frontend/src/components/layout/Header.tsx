import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingBag, Plus, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginButton from '../auth/LoginButton';
import { useMobileAuth } from '../../hooks/useMobileAuth';

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated } = useMobileAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
          <img 
            src="/assets/generated/ols-logo.dim_200x200.png" 
            alt="OLS Logo" 
            className="h-8 w-8"
          />
          <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
            OLS
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/browse">Browse</Link>
          </Button>

          {isAuthenticated && (
            <>
              <Button variant="ghost" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  My Listings
                </Link>
              </Button>
              <Button variant="default" asChild>
                <Link to="/create-listing">
                  <Plus className="mr-2 h-4 w-4" />
                  Post Ad
                </Link>
              </Button>
            </>
          )}

          <LoginButton />
        </nav>
      </div>
    </header>
  );
}
