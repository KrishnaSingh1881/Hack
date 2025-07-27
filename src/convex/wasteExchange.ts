import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";
import { internal } from "./_generated/api";

// Create a new waste listing
export const createListing = mutation({
  args: {
    itemName: v.string(),
    quantity: v.number(),
    unit: v.union(v.literal("kg"), v.literal("pieces"), v.literal("liters"), v.literal("grams")),
    expiryDate: v.optional(v.string()),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      address: v.optional(v.string()),
    })),
    desiredSwap: v.string(),
    category: v.optional(v.string()),
  },
  returns: v.id("wasteListings"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to create a listing");
    }

    // Calculate urgency based on expiry date
    let urgency: "low" | "medium" | "high" = "low";
    if (args.expiryDate) {
      const expiryTime = new Date(args.expiryDate).getTime();
      const now = Date.now();
      const hoursUntilExpiry = (expiryTime - now) / (1000 * 60 * 60);
      
      if (hoursUntilExpiry <= 6) urgency = "high";
      else if (hoursUntilExpiry <= 24) urgency = "medium";
    }

    const listingId = await ctx.db.insert("wasteListings", {
      vendorId: user._id,
      itemName: args.itemName,
      quantity: args.quantity,
      unit: args.unit,
      expiryDate: args.expiryDate,
      location: args.location,
      desiredSwap: args.desiredSwap,
      status: "available",
      urgency,
      category: args.category,
    });

    // Notify nearby vendors (simplified - in real app would use location-based matching)
    await ctx.scheduler.runAfter(0, internal.wasteExchange.notifyNearbyVendors, {
      listingId,
      vendorId: user._id,
    });

    return listingId;
  },
});

// Get all available waste listings
export const getAvailableListings = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("wasteListings"),
      _creationTime: v.number(),
      vendorId: v.id("users"),
      vendorName: v.string(),
      itemName: v.string(),
      quantity: v.number(),
      unit: v.union(v.literal("kg"), v.literal("pieces"), v.literal("liters"), v.literal("grams")),
      expiryDate: v.optional(v.string()),
      location: v.optional(v.object({
        lat: v.number(),
        lng: v.number(),
        address: v.optional(v.string()),
      })),
      desiredSwap: v.string(),
      status: v.union(v.literal("available"), v.literal("reserved"), v.literal("completed")),
      urgency: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      category: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const listings = await ctx.db
      .query("wasteListings")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .collect();

    const enrichedListings = await Promise.all(
      listings.map(async (listing) => {
        const vendor = await ctx.db.get(listing.vendorId);
        return {
          ...listing,
          vendorName: vendor?.name || "Unknown Vendor",
        };
      })
    );

    return enrichedListings;
  },
});

// Get user's own listings
export const getMyListings = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("wasteListings"),
      _creationTime: v.number(),
      vendorId: v.id("users"),
      itemName: v.string(),
      quantity: v.number(),
      unit: v.union(v.literal("kg"), v.literal("pieces"), v.literal("liters"), v.literal("grams")),
      expiryDate: v.optional(v.string()),
      location: v.optional(v.object({
        lat: v.number(),
        lng: v.number(),
        address: v.optional(v.string()),
      })),
      desiredSwap: v.string(),
      status: v.union(v.literal("available"), v.literal("reserved"), v.literal("completed")),
      urgency: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      category: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("wasteListings")
      .withIndex("by_vendor", (q) => q.eq("vendorId", user._id))
      .collect();
  },
});

// Express interest in a listing
export const expressInterest = mutation({
  args: {
    listingId: v.id("wasteListings"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    // Create notification for listing owner
    await ctx.db.insert("wasteNotifications", {
      recipientId: listing.vendorId,
      senderId: user._id,
      listingId: args.listingId,
      type: "interest",
      message: `${user.name || "Someone"} is interested in your ${listing.itemName}`,
      read: false,
    });

    return null;
  },
});

// Get user's green points
export const getGreenPoints = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return 0;
    }

    const points = await ctx.db
      .query("greenPoints")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return points.reduce((total, point) => total + point.points, 0);
  },
});

// Internal function to notify nearby vendors
export const notifyNearbyVendors = internalMutation({
  args: {
    listingId: v.id("wasteListings"),
    vendorId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    const vendor = await ctx.db.get(args.vendorId);
    
    if (!listing || !vendor) return null;

    // Get all other vendors (simplified - in real app would use location-based filtering)
    const allUsers = await ctx.db.query("users").collect();
    const otherVendors = allUsers.filter(u => u._id !== args.vendorId);

    // Create notifications for nearby vendors
    for (const otherVendor of otherVendors.slice(0, 5)) { // Limit to 5 for demo
      await ctx.db.insert("wasteNotifications", {
        recipientId: otherVendor._id,
        senderId: args.vendorId,
        listingId: args.listingId,
        type: "new_listing",
        message: `New waste listing: ${listing.itemName} (${listing.quantity} ${listing.unit}) - ${listing.urgency} urgency`,
        read: false,
      });
    }

    return null;
  },
});