import { httpRouter } from 'convex/server';

import { httpAction } from './_generated/server';


const http = httpRouter();

http.route({
    path: '/test',
    method: 'GET',
    handler: httpAction(async (ctx) => {
        return new Response('Hello World');
    })
})

export default http;