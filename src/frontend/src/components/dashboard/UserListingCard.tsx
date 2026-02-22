import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMarkListingAsSold } from '../../hooks/useQueries';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, CheckCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import EditListingForm from '../listings/EditListingForm';
import type { Listing } from '../../backend';
import { formatINR } from '../../utils/currency';

interface UserListingCardProps {
  listing: Listing;
}

export default function UserListingCard({ listing }: UserListingCardProps) {
  const navigate = useNavigate();
  const markAsSold = useMarkListingAsSold();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSoldDialog, setShowSoldDialog] = useState(false);

  const thumbnailUrl =
    listing.images.length > 0
      ? listing.images[0].getDirectURL()
      : '/assets/generated/placeholder-listing.dim_300x300.png';

  const handleMarkAsSold = async () => {
    try {
      await markAsSold.mutateAsync(listing.id);
      toast.success('Listing marked as sold!');
      setShowSoldDialog(false);
    } catch (error) {
      console.error('Error marking as sold:', error);
      toast.error('Failed to mark listing as sold. Please try again.');
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="aspect-square overflow-hidden bg-muted">
          <img src={thumbnailUrl} alt={listing.title} className="h-full w-full object-cover" />
        </div>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
            <Badge variant={listing.status === 'sold' ? 'secondary' : 'default'}>
              {listing.status === 'sold' ? 'Sold' : 'Active'}
            </Badge>
          </div>
          <p className="text-xl font-bold text-primary mb-2">{formatINR(listing.price)}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: '/listing/$id', params: { id: listing.id.toString() } })} className="flex-1">
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          {listing.status === 'active' && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)} className="flex-1">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSoldDialog(true)} className="flex-1">
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Sold
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          <EditListingForm
            listing={listing}
            onSuccess={() => setShowEditDialog(false)}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSoldDialog} onOpenChange={setShowSoldDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Sold?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark your listing as sold. You can still view it in your dashboard, but it won't appear in
              active listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsSold} disabled={markAsSold.isPending}>
              {markAsSold.isPending ? 'Marking...' : 'Mark as Sold'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
