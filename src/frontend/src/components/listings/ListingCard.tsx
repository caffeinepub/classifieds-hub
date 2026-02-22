import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar } from 'lucide-react';
import type { Listing } from '../../backend';
import { formatINR } from '../../utils/currency';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const thumbnailUrl =
    listing.images.length > 0
      ? listing.images[0].getDirectURL()
      : '/assets/generated/placeholder-listing.dim_300x300.png';

  return (
    <Link to="/listing/$id" params={{ id: listing.id.toString() }}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={thumbnailUrl}
            alt={listing.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
            {listing.status === 'sold' && (
              <Badge variant="secondary" className="ml-2 shrink-0">
                Sold
              </Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-primary mb-3">{formatINR(listing.price)}</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{listing.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(listing.timestamp)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
