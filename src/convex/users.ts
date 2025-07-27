import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, QueryCtx } from "./_generated/server";
import { roleValidator } from "./schema";
import { v } from "convex/values";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      image: v.optional(v.string()),
      role: v.optional(roleValidator),
      trustScore: v.optional(v.number()),
      location: v.optional(
        v.object({
          lat: v.number(),
          lng: v.number(),
        }),
      ),
    })
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }
    const allUsers = await ctx.db.query("users").collect();
    // Filter out the current user
    return allUsers.filter((u) => u._id !== user._id);
  },
});

export const updateProfile = mutation({
  args: {
    name: v.string(),
    role: roleValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Must be authenticated to update profile");
    }

    // Check if user document exists, if not create it
    const existingUser = await ctx.db.get(userId);
    if (!existingUser) {
      // Create the user document if it doesn't exist
      await ctx.db.insert("users", {
        _id: userId,
        name: args.name,
        role: args.role,
        trustScore: 100, // Default trust score
      });
    } else {
      // Update existing user
      await ctx.db.patch(userId, {
        name: args.name,
        role: args.role,
      });
    }

    return null;
  },
});

export const syncAuthUser = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Must be authenticated");
    }

    // Check if user document exists
    const existingUser = await ctx.db.get(userId);
    if (!existingUser) {
      // Create the user document with default values
      await ctx.db.insert("users", {
        _id: userId,
        name: "New User",
        trustScore: 100,
      });
    }

    return null;
  },
});