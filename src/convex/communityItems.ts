import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    itemName: v.string(),
    quantity: v.number(),
    type: v.union(v.literal("exchange"), v.literal("request")),
  },
  returns: v.id("communityItems"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to create a community item");
    }

    if (user.role !== "vendor") {
      throw new Error("Only vendors can create community items");
    }

    const itemId = await ctx.db.insert("communityItems", {
      vendorId: user._id,
      itemName: args.itemName,
      quantity: args.quantity,
      type: args.type,
    });

    return itemId;
  },
});

export const getAll = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("communityItems"),
      _creationTime: v.number(),
      vendorId: v.id("users"),
      itemName: v.string(),
      quantity: v.number(),
      type: v.union(v.literal("exchange"), v.literal("request")),
      vendorName: v.string(),
    })
  ),
  handler: async (ctx) => {
    const items = await ctx.db.query("communityItems").collect();
    
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const vendor = await ctx.db.get(item.vendorId);
        return {
          ...item,
          vendorName: vendor?.name || "Unknown Vendor",
        };
      })
    );

    return enrichedItems;
  },
});
