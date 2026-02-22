import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserListings } from '../hooks/useQueries';
import UserListingCard from '../components/dashboard/UserListingCard';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: listings = [], isLoading } = useGetUserListings();

  if (!identity) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-muted-foreground mb-6">Please log in to view your dashboard.</p>
        <Button onClick={() => navigate({ to: '/browse' })}>Go to Browse</Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Listings</h1>
          <p className="text-muted-foreground">Manage your posted items</p>
        </div>
        <Button
          onClick={() => navigate({ to: '/create-listing' })}
          className="bg-gradient-to-r from-chart-1 to-chart-4"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Listing
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground mb-6">You haven't posted any listings yet.</p>
          <Button onClick={() => navigate({ to: '/create-listing' })}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Listing
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <UserListingCard key={listing.id.toString()} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
