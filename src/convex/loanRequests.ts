import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    amount: v.number(),
  },
  returns: v.id("loanRequests"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to create a loan request");
    }
    if (user.role !== "vendor") {
      throw new Error("Only vendors can create loan requests");
    }

    const loanRequestId = await ctx.db.insert("loanRequests", {
      vendorId: user._id,
      amount: args.amount,
      repaymentStatus: "pending",
    });

    return loanRequestId;
  },
});

export const getAllForInvestors = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("loanRequests"),
      _creationTime: v.number(),
      vendorId: v.id("users"),
      amount: v.number(),
      repaymentStatus: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("defaulted")
      ),
      investorId: v.optional(v.id("users")),
      vendorName: v.string(),
      vendorTrustScore: v.number(),
    })
  ),
  handler: async (ctx) => {
    const loanRequests = await ctx.db
      .query("loanRequests")
      .filter((q) => q.eq(q.field("repaymentStatus"), "pending") && q.eq(q.field("investorId"), undefined))
      .collect();

    const enrichedLoanRequests = await Promise.all(
      loanRequests.map(async (request) => {
        const vendor = await ctx.db.get(request.vendorId);
        return {
          ...request,
          vendorName: vendor?.name || "Unknown Vendor",
          vendorTrustScore: vendor?.trustScore || 0,
        };
      })
    );

    return enrichedLoanRequests;
  },
});

export const getByInvestor = query({
    args: {},
    returns: v.array(
        v.object({
            _id: v.id("loanRequests"),
            _creationTime: v.number(),
            vendorId: v.id("users"),
            amount: v.number(),
            repaymentStatus: v.union(
                v.literal("pending"),
                v.literal("paid"),
                v.literal("defaulted")
            ),
            investorId: v.optional(v.id("users")),
            vendorName: v.string(),
        })
    ),
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);
        if (!user) {
            return [];
        }

        const loanRequests = await ctx.db
            .query("loanRequests")
            .withIndex("by_investor", (q) => q.eq("investorId", user._id))
            .collect();
        
        const enrichedLoanRequests = await Promise.all(
            loanRequests.map(async (request) => {
                const vendor = await ctx.db.get(request.vendorId);
                return {
                    ...request,
                    vendorName: vendor?.name || "Unknown Vendor",
                };
            })
        );

        return enrichedLoanRequests;
    }
});

export const fund = mutation({
  args: {
    loanRequestId: v.id("loanRequests"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to fund a loan");
    }
    if (user.role !== "investor") {
      throw new Error("Only investors can fund loans");
    }

    const loanRequest = await ctx.db.get(args.loanRequestId);
    if (!loanRequest) {
      throw new Error("Loan request not found");
    }
    if (loanRequest.investorId) {
      throw new Error("Loan already funded");
    }

    await ctx.db.patch(args.loanRequestId, {
      investorId: user._id,
    });

    return null;
  },
});