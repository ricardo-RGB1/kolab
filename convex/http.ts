/**
 * HTTP router for handling incoming requests related to the Stripe integration.
 * This module exports an HTTP router instance that can be used to define routes and handlers for incoming requests.
 * The router is responsible for parsing the request, executing the appropriate action, and returning a response.
 * @module http
 */

import { httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

/**
 * Route handler for the "/stripe" endpoint.
 * This handler is responsible for processing incoming Stripe webhook events.
 * It verifies the signature, extracts the payload, and executes the appropriate action.
 * Returns a response based on the success of the fulfillment.
 * @param ctx - The Convex context object.
 * @param request - The incoming request object.
 * @returns A response object indicating the success or failure of the fulfillment.
 */
http.route({
    path: "/stripe",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const signature: string = request.headers.get("stripe-signature") as string; // Extract the signature from the request headers

        // Execute the fulfill action with the signature and payload
        // The fulfill action is defined in the internal API
        const result = await ctx.runAction(internal.stripe.fulfill, { 
            signature, // a header in the request
            payload: await request.text(), // the raw body of the request
        });

        // Return a response based on the success of the fulfillment
        if (result.success) {
            return new Response(null, {
                status: 200,
            });
        } else {  // If the fulfillment failed, return a 400 response
            return new Response("Webhook Error", {
                status: 400,
            });
        }
    }),
});

export default http;
