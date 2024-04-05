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
    userFavorites: defineTable({
        orgId: v.string(),
        userId: v.string(),
        boardId: v.id('boards'),
    }) 
      .index("by_board", ["boardId"])
      .index("by_user_org", ["userId", "orgId"])
      .index("by_user_board", ["userId", "boardId"])
      .index("by_user_board_org", ["userId", "boardId", "orgId"])
}); 

// This TypeScript code is defining a database schema using the convex library:
// 1. The schema has two tables: boards and userFavorites.
// 2. The boards table has columns: title, orgId, authorId, authorName, and imageUrl.
// 3. The userFavorites table has columns: orgId, userId, and boardId.
// 4. The boards table has indexes: by_org and search_title.
// 5. The userFavorites table has indexes: by_board, by_user_org, by_user_board, and by_user_board_org.
// 6. The schema is exported as the default export of the file.

