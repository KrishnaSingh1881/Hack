import { query } from "./_generated/server";
import { v } from "convex/values";

export const getMapData = query({
  returns: v.object({
    wholesalers: v.array(
      v.object({
        _id: v.id("suppliers"),
        name: v.string(),
        location: v.object({
          lat: v.number(),
          lng: v.number(),
        }),
      })
    ),
    vendors: v.array(
      v.object({
        _id: v.id("users"),
        name: v.optional(v.string()),
        location: v.optional(
          v.object({
            lat: v.number(),
            lng: v.number(),
          })
        ),
      })
    ),
  }),
  handler: async (ctx) => {
    const wholesalers = await ctx.db.query("suppliers").collect();
    const vendors = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "vendor"))
      .collect();

    return {
      wholesalers: wholesalers.map(({ _id, name, location }) => ({
        _id,
        name,
        location,
      })),
      vendors: vendors.map(({ _id, name, location }) => ({
        _id,
        name,
        location,
      })),
    };
  },
});
