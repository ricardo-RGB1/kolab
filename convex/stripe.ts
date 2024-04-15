"use node";

import Stripe from "stripe";
import { v } from "convex/values";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// The URL to redirect the user to after the payment is completed
const url = process.env.NEXT_PUBLIC_APP_URL; 

/**
 * Create a new Stripe instance.
 */
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2024-04-10",
});



/**
 * Creates a billing portal session for an organization.
 * 
 * @param orgId - The ID of the organization.
 * @returns The URL of the billing portal session.
 * @throws Error if the user is unauthorized, no organization ID is provided, or no subscription is found for the organization.
 */
export const portal = action({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if(!identity) {
      throw new Error("Unauthorized");
    }

    if(!args.orgId) {
      throw new Error("No organization ID provided");
    }

    // Retrieve the subscription for the organization: pass the orgId to the get query from the subscriptions API
    const orgSubscription = await ctx.runQuery(
      internal.subscriptions.get, 
      { orgId: args.orgId }
    );

    if(!orgSubscription) {
      throw new Error("No subscription found for the organization");
    }


    // Create a new billing portal session for the organization
    const session = await stripe.billingPortal.sessions.create({
      // The ID of the Stripe customer associated with the subscription
      customer: orgSubscription.stripeCustomerId, 
      // The URL to redirect the user to after the session is completed
      return_url: url, 
    })

    // Return the URL of the billing portal session
    return session.url!; 

     
  }
})






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
      success_url: url,
      cancel_url: url,
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

/**
 * Fulfill function that handles the fulfillment of a Stripe webhook event.
 *
 * @param signature - The signature of the webhook event.
 * @param payload - The payload of the webhook event.
 * @returns An object indicating the success of the fulfillment.
 */
export const fulfill = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async (ctx, { signature, payload }) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    // Verify the webhook signature to ensure the event is from Stripe
    // and construct the event object
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      // Get the session object from the event
      const session = event.data.object as Stripe.Checkout.Session;

      // Check if the user has paid for the subscription and retrieve the subscription object
      if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        if (!session?.metadata?.orgId) {
          throw new Error("No organization ID provided");
        }

        // Update the subscription in the database with the new subscription details and current period end
        await ctx.runMutation(internal.subscriptions.create, {
          orgId: session.metadata.orgId as string,
          stripeSubscriptionId: subscription.id as string,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id as string,
          stripeCurrentPeriodEnd: subscription.current_period_end * 1000,
        });
      }



      // Check if the payment was successful and update the subscription object
      if (event.type === 'invoice.payment_succeeded') {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        ); 
        // Update the subscription in the database with the new current period end date
        await ctx.runMutation(internal.subscriptions.update, {
          stripeSubscriptionId: subscription.id as string,
          stripeCurrentPeriodEnd: subscription.current_period_end * 1000,
        });
      }

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  },
});
