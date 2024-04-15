import { v } from "convex/values";

import { internalMutation, internalQuery, query } from "./_generated/server";



/**
 * Retrieves the unique subscription for the specified organization.
 * @param orgId The ID of the organization.
 * @returns A promise that resolves to the unique subscription for the organization.
 */
export const get = internalQuery({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db 
      .query("orgSubscription")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .unique(); // Get the unique subscription for the organization
  }
})


/**
 * Retrieves the subscription for an organization.
 *
 * @param orgId - The ID of the organization.
 * @returns A promise that resolves to the subscription object.
 */
export const getIsSubscribed = query({
  args: { orgId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.orgId) {
      return false;
    }

    const orgSubscription = await ctx.db
      .query("orgSubscription")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId as string))
      .unique(); // Get the unique subscription for the organization

    const periodEnd = orgSubscription?.stripeCurrentPeriodEnd;

    const isSubscribed = periodEnd && periodEnd > Date.now(); // Check if the subscription is active

    return isSubscribed;
  },
});





/**
 * Creates a new subscription for an  organization.
 *
 * @param orgId - The ID of the organization.
 * @param stripePriceId - The ID of the Stripe price associated with the subscription.
 * @param stripeCustomerId - The ID of the Stripe customer associated with the subscription.
 * @param stripeSubscriptionId - The ID of the Stripe subscription.
 * @param stripeCurrentPeriodEnd - The timestamp indicating the end of the current billing period.
 * @returns A promise that resolves to the newly created orgSubscription object.
 */
export const create = internalMutation({
  args: {
    orgId: v.string(),
    stripePriceId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripeCurrentPeriodEnd: v.number(),
  },
  handler: async (
    ctx,
    {
      orgId,
      stripePriceId,
      stripeCustomerId,
      stripeSubscriptionId,
      stripeCurrentPeriodEnd,
    }
  ) => {
    return await ctx.db.insert("orgSubscription", {
      orgId,
      stripePriceId,
      stripeCustomerId,
      stripeSubscriptionId,
      stripeCurrentPeriodEnd,
    });
  },
});

/**
 * Updates a subscription with the given Stripe subscription ID and current period end date.
 * If the subscription is not found, an error is thrown.
 *
 * @param {string} stripeSubscriptionId - The ID of the Stripe subscription.
 * @param {number} stripeCurrentPeriodEnd - The current period end date for the subscription.
 * @returns {Promise<{ success: boolean }>} - A promise that resolves to an object indicating the success of the update operation.
 */
export const update = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    stripeCurrentPeriodEnd: v.number(),
  },
  handler: async (ctx, { stripeSubscriptionId, stripeCurrentPeriodEnd }) => {
    try {
      const existingSubscription = await ctx.db
        .query("orgSubscription")
        .withIndex("by_subscription", (q) =>
          q.eq("stripeSubscriptionId", stripeSubscriptionId)
        )
        .unique();

      if (!existingSubscription) {
        throw new Error("Subscription not found");
      }

      // Update the current period end date for the subscription
      await ctx.db.patch(existingSubscription._id, {
        stripeCurrentPeriodEnd,
      });

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  },
});
