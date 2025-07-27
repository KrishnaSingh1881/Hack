import { internalMutation } from "../_generated/server";
import { ROLES } from "../schema";

export const create = internalMutation({
  handler: async (ctx) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", "wholesaler@example.com"))
      .first();

    let userId;

    if (existingUser) {
      userId = existingUser._id;
    } else {
      userId = await ctx.db.insert("users", {
        name: "Test Wholesaler",
        email: "wholesaler@example.com",
        role: ROLES.WHOLESALER,
        trustScore: 100,
      });
    }

    const existingSupplier = await ctx.db
      .query("suppliers")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .first();

    if (existingSupplier) {
      console.log("Supplier for this user already exists.");
      return;
    }

    await ctx.db.insert("suppliers", {
      name: "Bangalore Raw Materials Co.",
      location: {
        lat: 12.9716,
        lng: 77.5946,
      },
      deliveryRadius: 50, // 50km
      ownerId: userId,
    });

    console.log("Created a sample supplier.");
  },
});
