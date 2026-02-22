import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import CreateListingForm from '../components/listings/CreateListingForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  if (!identity) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-muted-foreground mb-6">Please log in to create a listing.</p>
        <Button onClick={() => navigate({ to: '/browse' })}>Go to Browse</Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl">
      <Button variant="ghost" onClick={() => navigate({ to: '/browse' })} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Post a New Listing</h1>
        <p className="text-muted-foreground">Fill in the details below to create your listing.</p>
      </div>

      <CreateListingForm />
    </div>
  );
}
