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
      supplierId: v.id("suppliers"),
      bulkPrice: v.number(),
      discount: v.optional(v.number()),
      stock: v.number(),
    }).index("by_supplier", ["supplierId"]),

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
      .index("by_from_to", ["from", "to"])
  },
  {
    schemaValidation: false,
  },
);

export default schema;