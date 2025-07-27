import { ROLES } from "../schema";
import { internalMutation } from "../_generated/server";
import { TableNames } from "../_generated/dataModel";

export const createAll = internalMutation({
  handler: async (ctx) => {
    // Clear existing data to avoid duplicates
    const tables: TableNames[] = [
      "users",
      "suppliers", 
      "products",
      "groupBuys",
      "loanRequests",
      "communityItems",
      "reviews",
      "orders",
      "messages",
    ];
    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      await Promise.all(docs.map((doc) => ctx.db.delete(doc._id)));
    }

    // --- VENDORS ---
    const vendor1Id = await ctx.db.insert("users", {
      name: "Raju's Chaat Corner",
      email: "raju.chaat@example.com",
      role: ROLES.VENDOR,
      trustScore: 85,
      location: { lat: 19.079, lng: 72.875 }, // Near Mumbai
    });
    const vendor2Id = await ctx.db.insert("users", {
      name: "Priya's Vada Pav",
      email: "priya.vada@example.com",
      role: ROLES.VENDOR,
      trustScore: 92,
      location: { lat: 19.073, lng: 72.88 }, // Near Mumbai
    });
    const vendor3Id = await ctx.db.insert("users", {
      name: "Sanjay's Samosas",
      email: "sanjay.samosa@example.com",
      role: ROLES.VENDOR,
      trustScore: 78,
      location: { lat: 28.7041, lng: 77.1025 }, // Near Delhi
    });

    // --- WHOLESALERS ---
    const wholesaler1Id = await ctx.db.insert("users", {
      name: "Mumbai Masala Co.",
      email: "contact@mumbaimasala.com",
      role: ROLES.WHOLESALER,
    });
    const wholesaler2Id = await ctx.db.insert("users", {
      name: "Delhi Daily Grocers",
      email: "sales@delhigrocers.com",
      role: ROLES.WHOLESALER,
    });

    // --- INVESTORS ---
    const investor1Id = await ctx.db.insert("users", {
      name: "Anjali Investments",
      email: "anjali.m@invest.com",
      role: ROLES.INVESTOR,
    });

    // --- SUPPLIERS (Owned by Wholesalers) ---
    const supplier1Id = await ctx.db.insert("suppliers", {
      name: "Mumbai Masala Co. Warehouse",
      location: { lat: 19.076, lng: 72.8777 }, // Mumbai
      deliveryRadius: 50,
      ownerId: wholesaler1Id,
    });
    const supplier2Id = await ctx.db.insert("suppliers", {
      name: "Delhi Daily Grocers Depot",
      location: { lat: 28.7041, lng: 77.1025 }, // Delhi
      deliveryRadius: 75,
      ownerId: wholesaler2Id,
    });

    // --- PRODUCTS ---
    const potatoId = await ctx.db.insert("products", {
      name: "Potatoes (per kg)",
      supplierId: supplier2Id,
      bulkPrice: 30,
      stock: 5000,
    });
    const besanId = await ctx.db.insert("products", {
      name: "Gram Flour (Besan) (per kg)",
      supplierId: supplier1Id,
      bulkPrice: 80,
      stock: 2000,
    });
    await ctx.db.insert("products", {
      name: "Cooking Oil (per litre)",
      supplierId: supplier1Id,
      bulkPrice: 150,
      stock: 1500,
    });
    await ctx.db.insert("products", {
      name: "Onions (per kg)",
      supplierId: supplier2Id,
      bulkPrice: 40,
      stock: 3000,
    });
    await ctx.db.insert("products", {
      name: "Mixed Spices (Chaat Masala) (per kg)",
      supplierId: supplier1Id,
      bulkPrice: 400,
      stock: 500,
    });

    // --- GROUP BUYS ---
    await ctx.db.insert("groupBuys", {
      productId: potatoId,
      targetQuantity: 500,
      currentQuantity: 120,
      pricePerUnit: 25,
      participants: [vendor1Id, vendor2Id],
      status: "open",
      createdBy: vendor1Id,
    });
    await ctx.db.insert("groupBuys", {
      productId: besanId,
      targetQuantity: 200,
      currentQuantity: 200,
      pricePerUnit: 75,
      participants: [vendor1Id, vendor2Id, vendor3Id],
      status: "closed",
      createdBy: vendor2Id,
    });

    // --- LOAN REQUESTS ---
    await ctx.db.insert("loanRequests", {
      vendorId: vendor2Id,
      amount: 25000,
      repaymentStatus: "pending",
    });
    await ctx.db.insert("loanRequests", {
      vendorId: vendor3Id,
      amount: 15000,
      repaymentStatus: "pending",
      investorId: investor1Id,
    });

    // --- COMMUNITY ITEMS ---
    await ctx.db.insert("communityItems", {
      vendorId: vendor1Id,
      itemName: "Extra Mint Chutney",
      quantity: 5,
      type: "exchange",
    });
    await ctx.db.insert("communityItems", {
      vendorId: vendor3Id,
      itemName: "Need fresh Paneer (5kg)",
      quantity: 5,
      type: "request",
    });

    console.log("Dummy data created successfully!");
  },
});