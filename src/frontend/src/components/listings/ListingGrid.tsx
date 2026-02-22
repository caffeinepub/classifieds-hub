import ListingCard from './ListingCard';
import type { Listing } from '../../backend';

interface ListingGridProps {
  listings: Listing[];
}

export default function ListingGrid({ listings }: ListingGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id.toString()} listing={listing} />
      ))}
    </div>
  );
}
