import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Listing, UserProfile, Category } from '../backend';
import { ExternalBlob } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Listing Queries
export function useGetActiveListings() {
  const { actor, isFetching } = useActor();

  return useQuery<Listing[]>({
    queryKey: ['listings', 'active'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetListing(listingId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Listing | null>({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      if (!actor || !listingId) return null;
      try {
        return await actor.getListing(BigInt(listingId));
      } catch (error) {
        console.error('Error fetching listing:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!listingId,
  });
}

export function useGetListingsByCategory(category: Category | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Listing[]>({
    queryKey: ['listings', 'category', category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.getListingsByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

export function useSearchListings(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Listing[]>({
    queryKey: ['listings', 'search', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      return actor.searchListings(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.trim().length > 0,
  });
}

export function useGetListingsByLocation(location: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Listing[]>({
    queryKey: ['listings', 'location', location],
    queryFn: async () => {
      if (!actor || !location.trim()) return [];
      return actor.getListingsByLocation(location);
    },
    enabled: !!actor && !isFetching && location.trim().length > 0,
  });
}

export function useGetUserListings() {
  const { actor, isFetching } = useActor();

  return useQuery<Listing[]>({
    queryKey: ['listings', 'user'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserListings();
    },
    enabled: !!actor && !isFetching,
  });
}

// Listing Mutations
export function useCreateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      price: bigint;
      category: Category;
      location: string;
      images: ExternalBlob[];
      contactInfo: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createListing(
        data.title,
        data.description,
        data.price,
        data.category,
        data.location,
        data.images,
        data.contactInfo
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useUpdateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      listingId: bigint;
      title: string;
      description: string;
      price: bigint;
      category: Category;
      location: string;
      images: ExternalBlob[];
      contactInfo: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateListing(
        data.listingId,
        data.title,
        data.description,
        data.price,
        data.category,
        data.location,
        data.images,
        data.contactInfo
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useMarkListingAsSold() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markListingAsSold(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
