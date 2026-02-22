import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Category = {
    #electronics;
    #vehicles;
    #realEstate;
    #furniture;
    #fashion;
    #services;
  };

  public type ListingStatus = { #active; #sold };

  public type Listing = {
    id : Nat;
    title : Text;
    description : Text;
    price : Nat;
    category : Category;
    location : Text;
    seller : Principal;
    images : [Storage.ExternalBlob];
    contactInfo : Text;
    timestamp : Time.Time;
    status : ListingStatus;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  let listings = Map.empty<Nat, Listing>();
  var nextListingId = 0;
  let userProfiles = Map.empty<Principal, UserProfile>();

  module Listing {
    public func compareByTimestampAscending(a : Listing, b : Listing) : Order.Order {
      Nat.compare(Int.abs(a.timestamp), Int.abs(b.timestamp));
    };

    public func compareByTimestampDescending(a : Listing, b : Listing) : Order.Order {
      Nat.compare(Int.abs(b.timestamp), Int.abs(a.timestamp));
    };

    public func compareByPriceAscending(a : Listing, b : Listing) : Order.Order {
      Nat.compare(a.price, b.price);
    };

    public func compareByPriceDescending(a : Listing, b : Listing) : Order.Order {
      Nat.compare(b.price, a.price);
    };
  };

  // User Profile Management Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Listing Management Functions
  public shared ({ caller }) func createListing(
    title : Text,
    description : Text,
    price : Nat,
    category : Category,
    location : Text,
    images : [Storage.ExternalBlob],
    contactInfo : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to create a listing");
    };

    let id = nextListingId;
    nextListingId += 1;

    let listing : Listing = {
      id;
      title;
      description;
      price;
      category;
      location;
      seller = caller;
      images;
      contactInfo;
      timestamp = Time.now();
      status = #active;
    };

    listings.add(id, listing);
    id;
  };

  public query ({ caller }) func getActiveListings() : async [Listing] {
    // No auth check - accessible to all including guests
    let activeListings = listings.values().toArray().filter(
      func(listing) { listing.status == #active }
    );
    activeListings.sort(Listing.compareByTimestampDescending);
  };

  public query ({ caller }) func getListingsByCategory(category : Category) : async [Listing] {
    // No auth check - accessible to all including guests
    let filteredListings = listings.values().toArray().filter(
      func(listing) { listing.category == category and listing.status == #active }
    );
    filteredListings.sort(Listing.compareByTimestampDescending);
  };

  public query ({ caller }) func searchListings(searchTerm : Text) : async [Listing] {
    // No auth check - accessible to all including guests
    let termLower = searchTerm.toLower();
    let matchingListings = listings.values().toArray().filter(
      func(listing) {
        listing.status == #active and (
          listing.title.toLower().contains(#text termLower) or
          listing.description.toLower().contains(#text termLower) or
          listing.location.toLower().contains(#text termLower)
        )
      }
    );
    matchingListings.sort(Listing.compareByTimestampDescending);
  };

  public query ({ caller }) func getUserListings() : async [Listing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to view your listings");
    };
    let userListings = listings.values().toArray().filter(
      func(listing) { Principal.equal(listing.seller, caller) }
    );
    userListings.sort(Listing.compareByTimestampDescending);
  };

  public shared ({ caller }) func updateListing(
    listingId : Nat,
    title : Text,
    description : Text,
    price : Nat,
    category : Category,
    location : Text,
    images : [Storage.ExternalBlob],
    contactInfo : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to update a listing");
    };

    let listing = switch (listings.get(listingId)) {
      case (null) {
        Runtime.trap("Listing does not exist");
      };
      case (?l) { l };
    };

    if (not Principal.equal(listing.seller, caller)) {
      Runtime.trap("Unauthorized: Only the listing owner can update this listing");
    };

    let updatedListing : Listing = {
      id = listingId;
      title;
      description;
      price;
      category;
      location;
      seller = caller;
      images;
      contactInfo;
      timestamp = Time.now();
      status = listing.status;
    };

    listings.add(listingId, updatedListing);
  };

  public shared ({ caller }) func markListingAsSold(listingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to mark a listing as sold");
    };

    let listing = switch (listings.get(listingId)) {
      case (null) {
        Runtime.trap("Listing does not exist");
      };
      case (?l) { l };
    };

    if (not Principal.equal(listing.seller, caller)) {
      Runtime.trap("Unauthorized: Only the listing owner can mark as sold");
    };

    let updatedListing : Listing = {
      id = listing.id;
      title = listing.title;
      description = listing.description;
      price = listing.price;
      category = listing.category;
      location = listing.location;
      seller = listing.seller;
      images = listing.images;
      contactInfo = listing.contactInfo;
      timestamp = listing.timestamp;
      status = #sold;
    };

    listings.add(listingId, updatedListing);
  };

  public query ({ caller }) func getListingsByLocation(location : Text) : async [Listing] {
    // No auth check - accessible to all including guests
    let locationLower = location.toLower();
    let filteredListings = listings.values().toArray().filter(
      func(listing) {
        listing.status == #active and listing.location.toLower().contains(#text locationLower)
      }
    );
    filteredListings.sort(Listing.compareByTimestampDescending);
  };

  public query ({ caller }) func getListing(listingId : Nat) : async Listing {
    // No auth check - accessible to all including guests
    switch (listings.get(listingId)) {
      case (null) {
        Runtime.trap("Listing does not exist");
      };
      case (?listing) { listing };
    };
  };
};

