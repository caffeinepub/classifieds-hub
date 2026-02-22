import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetActiveListings, useSearchListings, useGetListingsByCategory, useGetListingsByLocation } from '../hooks/useQueries';
import { useMobileAuth } from '../hooks/useMobileAuth';
import ListingGrid from '../components/listings/ListingGrid';
import SearchBar from '../components/search/SearchBar';
import CategoryFilter from '../components/filters/CategoryFilter';
import LocationFilter from '../components/filters/LocationFilter';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import type { Category } from '../backend';

export default function BrowsePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useMobileAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [locationFilter, setLocationFilter] = useState('');

  const { data: allListings, isLoading: allLoading } = useGetActiveListings();
  const { data: searchResults, isLoading: searchLoading } = useSearchListings(searchTerm);
  const { data: categoryListings, isLoading: categoryLoading } = useGetListingsByCategory(selectedCategory);
  const { data: locationListings, isLoading: locationLoading } = useGetListingsByLocation(locationFilter);

  const isLoading = allLoading || searchLoading || categoryLoading || locationLoading;

  // Determine which listings to display based on active filters
  let displayListings = allListings || [];
  if (searchTerm) {
    displayListings = searchResults || [];
  } else if (selectedCategory) {
    displayListings = categoryListings || [];
  } else if (locationFilter) {
    displayListings = locationListings || [];
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-chart-1/10 to-chart-4/10 py-16 md:py-24">
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/generated/hero-marketplace.dim_1200x400.png)' }}
        />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-chart-1 to-chart-4 bg-clip-text text-transparent">
              Welcome to OLS
            </h1>
            <p className="text-xl text-muted-foreground">
              India's premier marketplace for buying and selling. Find great deals or list your items today!
            </p>
            {isAuthenticated && (
              <Button
                size="lg"
                onClick={() => navigate({ to: '/create-listing' })}
                className="bg-gradient-to-r from-chart-1 to-chart-4 hover:opacity-90"
              >
                <Plus className="mr-2 h-5 w-5" />
                Post Your Ad
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
        <div className="container py-6 space-y-4">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
            </div>
            <div className="md:w-64">
              <LocationFilter value={locationFilter} onChange={setLocationFilter} />
            </div>
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className="container py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : displayListings.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">No Listings Found</h2>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedCategory || locationFilter
                ? 'Try adjusting your filters to see more results.'
                : 'Be the first to post a listing!'}
            </p>
            {isAuthenticated && (
              <Button onClick={() => navigate({ to: '/create-listing' })}>
                <Plus className="mr-2 h-4 w-4" />
                Create Listing
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {searchTerm
                  ? `Search Results for "${searchTerm}"`
                  : selectedCategory
                  ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Listings`
                  : locationFilter
                  ? `Listings in ${locationFilter}`
                  : 'All Listings'}
              </h2>
              <p className="text-muted-foreground">
                {displayListings.length} {displayListings.length === 1 ? 'listing' : 'listings'}
              </p>
            </div>
            <ListingGrid listings={displayListings} />
          </div>
        )}
      </section>
    </div>
  );
}
