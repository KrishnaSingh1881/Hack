import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    vendorId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("loanRequests", {
      ...args,
      repaymentStatus: "pending",
    });
  },
});

export const getAllForInvestors = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("loanRequests")
      .filter((q) => q.eq(q.field("repaymentStatus"), "pending"))
      .collect();
  },
});

export const fund = mutation({
  args: {
    loanRequestId: v.id("loanRequests"),
    investorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.loanRequestId, { investorId: args.investorId });
  },
});