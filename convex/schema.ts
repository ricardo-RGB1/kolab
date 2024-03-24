import { v } from 'convex/values'; 
import { defineSchema, defineTable } from 'convex/server';

export default defineSchema({
    boards: defineTable({
        title: v.string(),
        orgId: v.string(),
        authorId: v.string(),
        authorName: v.string(),
        imageUrl: v.string(),
    })
        .index("by_org", ["orgId"])
        .searchIndex("search_title", {
            searchField: "title",
            filterFields: ["orgId"]
        }),
}); 

// This TypeScript code is defining a database schema using the convex library: 

// It imports the necessary functions from the convex library. v is used to define the types of values in the schema, defineSchema is used to define a new schema, and defineTable is used to define a new table in the schema.

// It defines a new schema using defineSchema. This schema contains one table, boards.

// The boards table is defined with defineTable. It has five fields: title, orgId, authorId, authorName, and imageUrl. All of these fields are strings, as indicated by v.string().

// Two indexes are created on the boards table. The first index, by_org, is a simple index on the orgId field. This allows for fast lookups of boards by their orgId.

// The second index, search_title, is a search index on the title field. This allows for full-text search on the title field. The filterFields option specifies that search results should be filtered by orgId.

// The entire schema is exported as the default export of the module. This allows it to be imported and used in other parts of the application.