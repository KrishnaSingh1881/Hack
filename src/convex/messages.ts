import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    // Get messages from current user to the other user
    const messages1 = await ctx.db
      .query("messages")
      .withIndex("by_from_to", (q) =>
        q.eq("from", user._id).eq("to", args.otherUserId)
      )
      .collect();

    // Get messages from other user to the current user
    const messages2 = await ctx.db
      .query("messages")
      .withIndex("by_from_to", (q) =>
        q.eq("from", args.otherUserId).eq("to", user._id)
      )
      .collect();

    // Combine and sort messages by creation time
    const allMessages = messages1.concat(messages2);
    return allMessages.sort((a, b) => a._creationTime - b._creationTime);
  },
});

export const send = mutation({
  args: {
    to: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to send a message");
    }

    await ctx.db.insert("messages", {
      from: user._id,
      to: args.to,
      content: args.content,
      language: "en", // Defaulting to English for now
    });
  },
});
