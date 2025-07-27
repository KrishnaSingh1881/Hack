import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const createDirect = mutation({
  args: {
    name: v.string(),
    bulkPrice: v.number(),
    discount: v.optional(v.number()),
    stock: v.number(),
  },
  returns: v.id("products"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to create a product");
    }

    return await ctx.db.insert("products", {
      name: args.name,
      bulkPrice: args.bulkPrice,
      discount: args.discount,
      stock: args.stock,
      ownerId: user._id,
    });
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  returns: v.array(
    v.object({
      _id: v.id("products"),
      _creationTime: v.number(),
      name: v.string(),
      bulkPrice: v.number(),
      discount: v.optional(v.number()),
      stock: v.number(),
      ownerId: v.id("users"),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .collect();
  },
});