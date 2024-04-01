/**
 * Creates a new board.
 * @param orgId - The ID of the organization.
 * @param title - The title of the board.
 * @throws Error - If the user is not authenticated.
 */

import { v } from "convex/values";
import { mutation } from "./_generated/server";

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

    // TODO  Later check to delete favorite relation as well

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
