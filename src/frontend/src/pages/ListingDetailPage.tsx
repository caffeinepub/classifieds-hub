import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetListing } from '../hooks/useQueries';
import { useMobileAuth } from '../hooks/useMobileAuth';
import ImageGallery from '../components/listings/ImageGallery';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Calendar, Phone, Tag, Eye, EyeOff } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { sanitizeInput } from '../utils/security';

export default function ListingDetailPage() {
  const { id } = useParams({ from: '/listing/$id' });
  const navigate = useNavigate();
  const { data: listing, isLoading } = useGetListing(id);
  const { isAuthenticated } = useMobileAuth();
  const [showContact, setShowContact] = useState(false);

  if (isLoading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Listing Not Found</h2>
        <p className="text-muted-foreground mb-6">The listing you're looking for doesn't exist.</p>
        <Button onClick={() => navigate({ to: '/browse' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>
      </div>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const categoryLabels: Record<string, string> = {
    electronics: 'Electronics',
    vehicles: 'Vehicles',
    realEstate: 'Real Estate',
    furniture: 'Furniture',
    fashion: 'Fashion',
    services: 'Services',
  };

  // Sanitize description for safe display
  const safeDescription = sanitizeInput(listing.description);

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/browse' })} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Browse
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Images and Description */}
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery images={listing.images} />

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{sanitizeInput(listing.title)}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{sanitizeInput(listing.location)}</span>
                    <span>•</span>
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(listing.timestamp)}</span>
                  </div>
                </div>
                <Badge variant={listing.status === 'sold' ? 'secondary' : 'default'}>
                  {listing.status === 'sold' ? 'Sold' : 'Active'}
                </Badge>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{safeDescription}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{categoryLabels[listing.category]}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Price and Contact */}
        <div className="space-y-6">
          <Card className="sticky top-20">
            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <p className="text-4xl font-bold text-primary">{formatINR(listing.price)}</p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Seller Information</h3>
                
                {isAuthenticated ? (
                  <div className="space-y-3">
                    {showContact ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{sanitizeInput(listing.contactInfo)}</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowContact(true)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Show Contact Info
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                    <p className="font-medium mb-2">Login to view contact information</p>
                    <p className="text-xs">You need to be logged in to contact the seller</p>
                  </div>
                )}
              </div>

              {listing.status === 'active' && isAuthenticated && showContact && (
                <Button className="w-full bg-gradient-to-r from-chart-1 to-chart-4" size="lg">
                  Contact Seller
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
