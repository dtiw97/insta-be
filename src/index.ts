import { Hono } from 'hono'
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { trpcServer } from '@hono/trpc-server'
import { postsRouter } from './routes/insta_posts'

const app = new Hono()

// Apply middleware to all routes
app.use("*", logger());
app.use("*", cors());

// Root endpoint - simple health check
app.get('/', (c) => {
  return c.json({ 
    message: 'Instagram Clone API is running!',
    endpoints: {
      posts: '/trpc/getPosts',
      createPost: '/trpc/createPost', 
      likePost: '/trpc/likePost',
      getPostById: '/trpc/getPostById'
    }
  })
})

// Mount tRPC router at /trpc endpoint
// This creates all your API endpoints automatically
app.use('/trpc/*', 
  trpcServer({
    router: postsRouter,
  })
)

export default app
