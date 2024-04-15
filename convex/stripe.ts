"use node";

import Stripe from "stripe";
import { v } from "convex/values";

import { action } from "./_generated/server";

const url = process.env.NEXT_PUBLIC_APP_URL;

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2024-04-10",
});




/**
 * Pay function that creates a new checkout session for a subscription payment.
 * 
 * @param {string} orgId - The organization ID.
 * @throws {Error} If the user is unauthorized or no organization ID is provided.
 * @returns {Promise<void>} A promise that resolves when the checkout session is created.
 */
export const pay = action({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }
    if (!args.orgId) {
      throw new Error("No organization ID provided");
    }

    // Create a new checkout session
    const session = await stripe.checkout.sessions.create({
      success_url: url + "/success",
      cancel_url: url + "/cancel",
      customer_email: identity.email,
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "Board Pro",
              description: "Unlimited boards for your organization",
            },
            unit_amount: 999,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        orgId: args.orgId,
      },
      mode: "subscription",
    });
    
    // Return the URL to redirect the user to the checkout session.
    return session.url!; 
  },
});
