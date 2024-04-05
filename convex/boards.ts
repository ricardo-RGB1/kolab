import { v } from "convex/values";
import { getAllOrThrow } from "convex-helpers/server/relationships";

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
    search: v.optional(v.string()), // Optional search parameter
    favorites: v.optional(v.string()), // Optional favorites parameter
  },
  handler: async (ctx, args) => {
    // The handler function is an async function that receives the context and the arguments for the query.
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

  
    // If the 'favorites' query parameter is present then fetch the favorite boards for the user.
    if (args.favorites) {
      const favoriteBoards = await ctx.db
        .query("userFavorites")
        .withIndex("by_user_org", (q) =>
          q.eq("userId", identity.subject).eq("orgId", args.orgId)
        )
        .order("desc")
        .collect();

      // Map the favorite boards to an array of IDs
      const ids = favoriteBoards.map((b) => b.boardId);

      // Get all boards with the IDs
      const boards = await getAllOrThrow(ctx.db, ids);

      // Map each board to a new object with the 'isFavorite' property set to true
      return boards.map((board) => ({ 
        ...board,
        isFavorite: true,
      }));
    }

    const title = args.search as string;
    let boards = [];

    if (title) {
      // If there is a search query
      boards = await ctx.db // Query the 'boards' table
        .query("boards")
        .withSearchIndex("search_title", (q) =>
          q.search("title", title).eq("orgId", args.orgId)
        )
        .collect(); // Collect all results
    } else {
      boards = await ctx.db
        .query("boards")
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId)) // filter by org ID
        .order("desc")
        .collect();
    }

    /**
     * Maps each board in the 'boards' array to a new object that includes an 'isFavorite' property indicating whether the board is a favorite for the current user.
     * @returns {Promise<Array<{ _id: string, isFavorite: boolean }>>} A promise that resolves to an array of objects, each representing a board with the 'isFavorite' property.
     */
    const boardWithFavoriteRelation = boards.map((board) => {
      return ctx.db
        .query("userFavorites")
        .withIndex("by_user_board", (q) =>
          q.eq("userId", identity.subject).eq("boardId", board._id)
        )
        .unique()
        .then((favorite) => {
          return {
            ...board,
            isFavorite: !!favorite, // Convert favorite to boolean
          };
        });
    });

    // Wait for all promises to resolve
    const boardsWithFavoriteBoolean = Promise.all(boardWithFavoriteRelation);

    return boardsWithFavoriteBoolean;
  },
});
