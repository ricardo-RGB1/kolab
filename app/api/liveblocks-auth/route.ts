import { auth, currentUser } from "@clerk/nextjs"; 

import { Liveblocks } from '@liveblocks/node';
import { ConvexHttpClient } from 'convex/browser';

import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!); 

const liveblocks = new Liveblocks({
    secret: "sk_dev_kM3bM8wTTuhp9p8AMNeYykQczJHfsgdInBgyWJ8v_4qnM2KTlyR7mUAhtP7K688K", 
}); 

/**
 * Handles the POST request for liveblocks-auth.
 * 
 * @param request - The incoming request object.
 * @returns A Response object with the appropriate status and body.
 */
export async function POST(request: Request) {
    const authorization = await auth(); // Get the user's authorization token
    const user = await currentUser(); // Get the user's information

    if(!authorization || !user) {
        return new Response("Unauthorized", { status: 401 });
    }

    // Get the room ID from the request body
    const { room } = await request.json(); 

    // Get the board from Convex
    const board = await convex.query(api.board.get, { id: room });

    // Check if the user is authorized to access the board
    if(board?.orgId !== authorization.orgId) {
        return new Response("Unauthorized", { status: 401 });
    }

    // Generate a token for the user
    const userInfo = {
        name: user.firstName!, 
        picture: user.imageUrl!, 
    }

    // Prepare the session
    const session = liveblocks.prepareSession(
        user.id,
        { userInfo}
    );  

    // Allow the user to access the room
    if(room) {
        session.allow(room, session.FULL_ACCESS); 
    } 

    // Authorize the user
    const { status, body } = await session.authorize(); 
    

    return new Response(body, { status }); // Return the response


}