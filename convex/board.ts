import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const ORG_BOARD_LIMIT = 2; // The maximum number of boards per organization

const images = [
  "/placeholders/1.svg",
  "/placeholders/2.svg",
  "/placeholders/3.svg",
  "/placeholders/4.svg",
  "/placeholders/5.svg",
  "/placeholders/6.svg",
  "/placeholders/7.svg",
  "/placeholders/8.svg",
  "/placeholders/9.svg",
  "/placeholders/10.svg",
];

/**
 * Creates a new board.
 * @param orgId - The ID of the organization.
 * @param title - The title of the board.
 * @returns The newly created board.
 * @throws Error if the user is not authenticated.
 */
export const create = mutation({
  args: {
    orgId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    // Get a random image from images array:
    const randomImage = images[Math.floor(Math.random() * images.length)];



    // Check if the organization has an active subscription
    const orgSubscription = await ctx.db 
      .query("orgSubscription")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .unique(); // unique() returns the first item in the result set

    // Get the current period end date of the subscription
    const periodEnd = orgSubscription?.stripeCurrentPeriodEnd;
    // Check if the subscription is active
    const isSubscribed = periodEnd && periodEnd > Date.now();


    /**
     * Retrieves existing boards for the specified organization.
     *
     * @returns {Promise<Array<Board>>} A promise that resolves to an array of boards.
     */
    const existingBoards = await ctx.db
      .query("boards")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect(); // Collect all boards

    // Check if the organization has reached the maximum number of boards
    if (!isSubscribed &&
        existingBoards.length >= ORG_BOARD_LIMIT
        ) {
      throw new Error("Organization has reached the maximum number of boards");
    }

    /**
     * Inserts a new board into the database.
     */
    const board = await ctx.db.insert("boards", {
      title: args.title,
      orgId: args.orgId,
      authorId: identity.subject,
      authorName: identity.name!,
      imageUrl: randomImage,
    });

    return board;
  },
});

/**
 * Removes a board from the database.
 * @param {string} id - The ID of the board to be removed.
 * @throws {Error} If the user is not authenticated.
 */
export const remove = mutation({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    /**
     * Represents an existing favorite for a user and a board.
     */
    const existingFavorite = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_board", (q) =>
        q.eq("userId", userId).eq("boardId", args.id)
      )
      .unique();

    if (existingFavorite) {
      // If the favorite exists, delete it
      await ctx.db.delete(existingFavorite._id);
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Updates the title of a board.
 *
 * @param {string} id - The ID of the board to update.
 * @param {string} title - The new title for the board.
 * @returns {Promise<object>} - A promise that resolves to the updated board object.
 * @throws {Error} - If the user is not authenticated, the title is empty, or the title is too long.
 */
export const update = mutation({
  args: { id: v.id("boards"), title: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const title = args.title.trim(); // Remove leading and trailing whitespace

    if (!title) {
      throw new Error("Title cannot be empty");
    }

    if (title.length > 60) {
      throw new Error("Title is too long");
    }

    // Patch is used to update the title of the board.
    const board = await ctx.db.patch(args.id, {
      title: args.title,
    });

    return board;
  },
});

/**
 * Mutation to mark a board as favorite for a user.
 *
 * @param {string} id - The ID of the board.
 * @param {string} orgId - The ID of the organization.
 * @returns {Promise<Board>} - The updated board.
 * @throws {Error} - If the user is not authenticated, the board is not found, or the board is already favorited.
 */
export const favorite = mutation({
  args: { id: v.id("boards"), orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const board = await ctx.db.get(args.id); // Get the board

    if (!board) {
      throw new Error("Board not found");
    }

    const userId = identity.subject; // Get the user ID

    /**
     * Represents an existing favorite for a user, board, and organization.
     */
    const existingFavorite = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_board", (q) =>
        q.eq("userId", userId).eq("boardId", board._id)
      )
      .unique();

    if (existingFavorite) {
      throw new Error("Already favorited");
    }

    /**
     * Inserts a new favorite into the database.
     */
    await ctx.db.insert("userFavorites", {
      userId,
      boardId: board._id,
      orgId: args.orgId,
    });

    return board;
  },
});

/**
 * Removes a board from favorites.
 *
 * @param {string} id - The ID of the board to unfavorite.
 * @returns {Promise<Board>} - The unfavorite board.
 * @throws {Error} - If the user is not authenticated, the board is not found, or the favorite is not found.
 */
export const unfavorite = mutation({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const board = await ctx.db.get(args.id); // Get the board

    if (!board) {
      throw new Error("Board not found");
    }

    const userId = identity.subject; // Get the user ID

    /**
     * Represents an existing favorite for a user, board, and organization.
     */
    const existingFavorite = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_board", (q) =>
        q.eq("userId", userId).eq("boardId", board._id)
      )
      .unique();

    // If the favorite does not exist, throw an error
    if (!existingFavorite) {
      throw new Error("Favorite not found");
    }

    // Delete the favorite from the database
    await ctx.db.delete(existingFavorite._id);

    return board;
  },
});

/**
 * Retrieves a board from the database based on the provided ID.
 * @param {string} id - The ID of the board to retrieve.
 * @returns {Promise<Board>} - A promise that resolves to the retrieved board.
 */
export const get = query({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    const board = ctx.db.get(args.id);

    return board; // Return the board
  },
});

// mutation: A function that represents a mutation. It takes two arguments: args and handler.
// args: The arguments that the query function accepts.
// handler: The function that is called when the query is executed. It takes two arguments: ctx and args.
