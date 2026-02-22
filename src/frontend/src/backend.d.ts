import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Listing {
    id: bigint;
    status: ListingStatus;
    title: string;
    contactInfo: string;
    description: string;
    seller: Principal;
    timestamp: Time;
    category: Category;
    price: bigint;
    location: string;
    images: Array<ExternalBlob>;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export enum Category {
    vehicles = "vehicles",
    realEstate = "realEstate",
    furniture = "furniture",
    fashion = "fashion",
    services = "services",
    electronics = "electronics"
}
export enum ListingStatus {
    active = "active",
    sold = "sold"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(title: string, description: string, price: bigint, category: Category, location: string, images: Array<ExternalBlob>, contactInfo: string): Promise<bigint>;
    getActiveListings(): Promise<Array<Listing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListing(listingId: bigint): Promise<Listing>;
    getListingsByCategory(category: Category): Promise<Array<Listing>>;
    getListingsByLocation(location: string): Promise<Array<Listing>>;
    getUserListings(): Promise<Array<Listing>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markListingAsSold(listingId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchListings(searchTerm: string): Promise<Array<Listing>>;
    updateListing(listingId: bigint, title: string, description: string, price: bigint, category: Category, location: string, images: Array<ExternalBlob>, contactInfo: string): Promise<void>;
}
