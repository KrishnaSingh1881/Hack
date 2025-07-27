import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    productId: v.id("products"),
    targetQuantity: v.number(),
    pricePerUnit: v.number(),
  },
  returns: v.id("groupBuys"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to create a group buy");
    }

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const groupBuyId = await ctx.db.insert("groupBuys", {
      productId: args.productId,
      targetQuantity: args.targetQuantity,
      pricePerUnit: args.pricePerUnit,
      participants: [user._id],
      currentQuantity: 0,
      status: "open",
      createdBy: user._id,
    });

    return groupBuyId;
  },
});

export const join = mutation({
  args: {
    groupBuyId: v.id("groupBuys"),
    quantity: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to join a group buy");
    }

    const groupBuy = await ctx.db.get(args.groupBuyId);
    if (!groupBuy) {
      throw new Error("Group buy not found");
    }

    if (groupBuy.status !== "open") {
      throw new Error("Group buy is not open for new participants");
    }

    // Check if user is already a participant
    if (groupBuy.participants.includes(user._id)) {
      throw new Error("You are already participating in this group buy");
    }

    // Add user to participants and update quantity
    await ctx.db.patch(args.groupBuyId, {
      participants: [...groupBuy.participants, user._id],
      currentQuantity: groupBuy.currentQuantity + args.quantity,
    });

    // Check if target quantity is reached
    if (groupBuy.currentQuantity + args.quantity >= groupBuy.targetQuantity) {
      await ctx.db.patch(args.groupBuyId, {
        status: "closed",
      });
    }

    return null;
  },
});

export const getAll = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("groupBuys"),
      _creationTime: v.number(),
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
      productName: v.string(),
      participantCount: v.number(),
    })
  ),
  handler: async (ctx) => {
    const groupBuys = await ctx.db.query("groupBuys").collect();
    
    const enrichedGroupBuys = await Promise.all(
      groupBuys.map(async (groupBuy) => {
        const product = await ctx.db.get(groupBuy.productId);
        return {
          ...groupBuy,
          productName: product?.name || "Unknown Product",
          participantCount: groupBuy.participants.length,
        };
      })
    );

    return enrichedGroupBuys;
  },
});

export const getByUser = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("groupBuys"),
      _creationTime: v.number(),
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
      productName: v.string(),
      participantCount: v.number(),
    })
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const allGroupBuys = await ctx.db.query("groupBuys").collect();

    const groupBuys = allGroupBuys.filter(
      (gb) => gb.createdBy === user._id || gb.participants.includes(user._id)
    );

    const enrichedGroupBuys = await Promise.all(
      groupBuys.map(async (groupBuy) => {
        const product = await ctx.db.get(groupBuy.productId);
        return {
          ...groupBuy,
          productName: product?.name || "Unknown Product",
          participantCount: groupBuy.participants.length,
        };
      })
    );

    return enrichedGroupBuys;
  },
});