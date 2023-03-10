import { createTRPCRouter } from "./trpc";
import { exampleRouter } from "./routers/example";
import { newsRouter } from "./routers/news";
import { tweetRouter } from "./routers/tweet";
import { commentRouter } from "./routers/comment";
import { followRouter } from "./routers/follow";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  news: newsRouter,
  tweet: tweetRouter,
  comment: commentRouter,
  follow: followRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
