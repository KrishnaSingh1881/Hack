import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  VENDOR: "vendor",
  WHOLESALER: "wholesaler",
  INVESTOR: "investor",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.VENDOR),
  v.literal(ROLES.WHOLESALER),
  v.literal(ROLES.INVESTOR)
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      trustScore: v.optional(v.number()),
      location: v.optional(
        v.object({
          lat: v.number(),
          lng: v.number(),
        }),
      ),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // add other tables here
    suppliers: defineTable({
      name: v.string(),
      location: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
      deliveryRadius: v.number(),
      ownerId: v.id("users"),
    }).index("by_owner", ["ownerId"]),

    products: defineTable({
      name: v.string(),
      bulkPrice: v.number(),
      discount: v.optional(v.number()),
      stock: v.number(),
      unit: v.union(v.literal("kg"), v.literal("pieces"), v.literal("liters"), v.literal("grams")),
      ownerId: v.id("users"), // Direct ownership by user, no supplier needed
    }).index("by_owner", ["ownerId"]),

    orders: defineTable({
      vendorId: v.id("users"),
      productId: v.id("products"),
      quantity: v.number(),
      isGroupBuy: v.boolean(),
      status: v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("cancelled")
      ),
    })
      .index("by_vendor", ["vendorId"])
      .index("by_product", ["productId"]),

    groupBuys: defineTable({
      productId: v.id("products"),
      targetQuantity: v.number(),
      currentQuantity: v.number(),
      pricePerUnit: v.number(),
      participants: v.array(v.id("users")),
      status: v.union(
        v.literal("open"),
        v.literal("closed"),
        v.literal("completed")
      ),
      createdBy: v.id("users"),
    }).index("by_product", ["productId"])
      .index("by_creator", ["createdBy"]),

    reviews: defineTable({
      vendorId: v.id("users"),
      supplierId: v.id("suppliers"),
      rating: v.number(),
      comment: v.optional(v.string()),
    })
      .index("by_vendor", ["vendorId"])
      .index("by_supplier", ["supplierId"]),

    loanRequests: defineTable({
      vendorId: v.id("users"),
      amount: v.number(),
      repaymentStatus: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("defaulted")
      ),
      investorId: v.optional(v.id("users")),
    })
      .index("by_vendor", ["vendorId"])
      .index("by_investor", ["investorId"]),

    communityItems: defineTable({
      vendorId: v.id("users"),
      itemName: v.string(),
      quantity: v.number(),
      type: v.union(v.literal("exchange"), v.literal("request")),
    }).index("by_vendor", ["vendorId"]),

    messages: defineTable({
      from: v.id("users"),
      to: v.id("users"),
      content: v.string(),
      language: v.union(
        v.literal("en"),
        v.literal("hi"),
        v.literal("mr")
      ),
    })
      .index("by_from_to", ["from", "to"]),

    // Zero-Waste Community Exchange
    wasteListings: defineTable({
      vendorId: v.id("users"),
      itemName: v.string(),
      quantity: v.number(),
      unit: v.union(v.literal("kg"), v.literal("pieces"), v.literal("liters"), v.literal("grams")),
      expiryDate: v.optional(v.string()), // ISO date string
      location: v.optional(v.object({
        lat: v.number(),
        lng: v.number(),
        address: v.optional(v.string()),
      })),
      desiredSwap: v.string(), // "barter" or "cash" or specific item
      status: v.union(v.literal("available"), v.literal("reserved"), v.literal("completed")),
      urgency: v.union(v.literal("low"), v.literal("medium"), v.literal("high")), // based on expiry
      category: v.optional(v.string()), // food category for smart matching
    }).index("by_vendor", ["vendorId"])
      .index("by_status", ["status"])
      .index("by_urgency", ["urgency"]),

    // Green Points System
    greenPoints: defineTable({
      userId: v.id("users"),
      points: v.number(),
      earnedFrom: v.string(), // "waste_exchange", "successful_pickup", etc.
      transactionId: v.optional(v.id("wasteListings")),
    }).index("by_user", ["userId"]),

    // Waste Exchange Notifications
    wasteNotifications: defineTable({
      recipientId: v.id("users"),
      senderId: v.id("users"),
      listingId: v.id("wasteListings"),
      type: v.union(v.literal("new_listing"), v.literal("interest"), v.literal("pickup_reminder")),
      message: v.string(),
      read: v.boolean(),
    }).index("by_recipient", ["recipientId"])
      .index("by_read", ["read"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;