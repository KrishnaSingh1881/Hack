import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { ROLES } from "../schema";
import { internal } from "../_generated/api";

export const createAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Clean up previous dummy data if needed (optional)
    // Note: This is destructive and should be used carefully.
    // const allUsers = await ctx.db.query("users").collect();
    // await Promise.all(allUsers.map(u => ctx.db.delete(u._id)));
    // ... delete from other tables

    // --- Create Users ---
    const vendor1Id = await ctx.db.insert("users", {
      name: "Ravi Kumar",
      email: "ravi.k@example.com",
      role: ROLES.VENDOR,
      trustScore: 85,
    });
    const vendor2Id = await ctx.db.insert("users", {
      name: "Priya Sharma",
      email: "priya.s@example.com",
      role: ROLES.VENDOR,
      trustScore: 92,
    });
    const wholesalerId = await ctx.db.insert("users", {
      name: "Global Textiles",
      email: "contact@globaltextiles.com",
      role: ROLES.WHOLESALER,
    });
    const investorId = await ctx.db.insert("users", {
      name: "Anjali Mehta",
      email: "anjali.m@invest.com",
      role: ROLES.INVESTOR,
    });

    console.log("Created sample users.");

    // --- Create Supplier and Products ---
    const supplierId = await ctx.db.insert("suppliers", {
      name: "Mumbai Fabrics Co.",
      location: { lat: 19.076, lng: 72.8777 },
      deliveryRadius: 100,
      ownerId: wholesalerId,
    });

    const product1Id = await ctx.db.insert("products", {
      name: "Premium Cotton (per meter)",
      supplierId: supplierId,
      bulkPrice: 8.5,
      discount: 0.1, // 10% discount
      stock: 5000,
    });

    const product2Id = await ctx.db.insert("products", {
      name: "Silk Blend (per meter)",
      supplierId: supplierId,
      bulkPrice: 15.0,
      stock: 2500,
    });

    console.log("Created sample supplier and products.");

    // --- Create Group Buys ---
    await ctx.db.insert("groupBuys", {
      productId: product1Id,
      targetQuantity: 500,
      currentQuantity: 120,
      pricePerUnit: 7.65, // Price with discount
      participants: [vendor1Id],
      status: "open",
      createdBy: vendor1Id,
    });

    await ctx.db.insert("groupBuys", {
      productId: product2Id,
      targetQuantity: 200,
      currentQuantity: 180,
      pricePerUnit: 15.0,
      participants: [vendor1Id, vendor2Id],
      status: "open",
      createdBy: vendor2Id,
    });

    console.log("Created sample group buys.");

    // --- Create Loan Requests ---
    await ctx.db.insert("loanRequests", {
      vendorId: vendor1Id,
      amount: 1500,
      repaymentStatus: "pending",
    });
    await ctx.db.insert("loanRequests", {
      vendorId: vendor2Id,
      amount: 2500,
      repaymentStatus: "pending",
    });

    console.log("Created sample loan requests.");

    // --- Create Community Items ---
    await ctx.db.insert("communityItems", {
      vendorId: vendor1Id,
      itemName: "Surplus Blue Dye (5L)",
      quantity: 1,
      type: "exchange",
    });
    await ctx.db.insert("communityItems", {
      vendorId: vendor2Id,
      itemName: "Need 500 Zippers",
      quantity: 500,
      type: "request",
    });

    console.log("Created sample community items.");
    return "Dummy data created successfully!";
  },
});
