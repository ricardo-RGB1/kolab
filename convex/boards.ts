import { v } from "convex/values";

import { query } from "./_generated/server";

/**
 * Retrieves all boards for a given organization ID.
 *
 * @param {string} orgId - The ID of the organization.
 * @returns {Promise<Array<any>>} - A promise that resolves to an array of boards.
 * @throws {Error} - If the user is unauthorized.
 */
export const get = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    // The handler function is an async function that receives the context and the arguments for the query.
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Fetch all boards for the given organization ID and store in a const called "boards".
    const boards = await ctx.db 
      .query("boards")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))// filter by org ID
      .order("desc")
      .collect();

      return boards;  
  },
});
