import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { Effect, Array, Option } from "effect";

// Initialize tRPC - this is like setting up the foundation for our API
const t = initTRPC.create();

// Create our router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Define our data schemas using Zod for validation
// This ensures type safety and data validation

// Comment schema - matches your CommentData interface
// Define the type first for recursive reference
type CommentType = {
  id: string;
  username: string;
  userAvatar: string;
  text: string;
  likes: number;
  timeAgo: string;
  replies?: CommentType[];
};

const CommentSchema: z.ZodType<CommentType> = z.object({
  id: z.string(),
  username: z.string(),
  userAvatar: z.string(),
  text: z.string(),
  likes: z.number(),
  timeAgo: z.string(),
  replies: z
    .array(z.lazy((): z.ZodType<CommentType> => CommentSchema))
    .optional(), // Recursive for nested comments
});

// Post schema - matches your PostData interface
const PostSchema = z.object({
  id: z.string(),
  username: z.string(),
  userAvatar: z.string(),
  image: z.string(),
  caption: z.string(),
  likes: z.number(),
  timeAgo: z.string(),
  comments: z.array(CommentSchema),
  totalCommentsCount: z.number().optional(),
});

// Input schema for creating new posts
const CreatePostSchema = z.object({
  username: z.string().min(1, "Username is required"),
  userAvatar: z.string().url("Must be a valid URL"),
  image: z.string().url("Must be a valid image URL"),
  caption: z.string().max(500, "Caption too long"),
});

// Input schema for creating new comments
const CreateCommentSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  username: z.string().min(1, "Username is required"),
  userAvatar: z.string().url("Must be a valid URL"),
  text: z
    .string()
    .min(1, "Comment text is required")
    .max(300, "Comment too long"),
});

// Input schema for creating replies to comments
const CreateReplySchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  commentId: z.string().min(1, "Comment ID is required"),
  username: z.string().min(1, "Username is required"),
  userAvatar: z.string().url("Must be a valid URL"),
  text: z.string().min(1, "Reply text is required").max(300, "Reply too long"),
});

// Input schema for liking/unliking comments and replies
const LikeCommentSchema = z.object({
  postId: z.string(),
  commentId: z.string(),
});

const LikeReplySchema = z.object({
  postId: z.string(),
  commentId: z.string(),
  replyId: z.string(),
});

// Simulated database using Effect
// In a real app, this would be connected to a database
class PostsService {
  private posts: Array<z.infer<typeof PostSchema>> = [
    {
      id: "1",
      username: "david_tiw",
      userAvatar:
        "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
      image:
        "https://scontent.fkul3-4.fna.fbcdn.net/v/t39.30808-6/473620869_10170431578270424_6768865139126819584_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=aa7094&_nc_ohc=4bBjHnbfEd8Q7kNvwF1JEdH&_nc_oc=AdlJDzKs5xROd5YMrV8rq32rHfTkVj4qSYzmWG84s89rBr8moFX1lHPga6XOwW8GgNFR_ixKj3IOhZWCaMLTEwsz&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=Vvb02BiLxodiVspMvUTkhw&oh=00_AfVXI929rBTlE9umHL7vBzGoFePT07CXBQQ0rX8i7pl8Rw&oe=689633BF",
      caption: "This is David.",
      likes: 42,
      timeAgo: "2h",
      comments: [
        {
          id: "c1",
          username: "david_tiw",
          userAvatar:
            "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
          text: "Amazing shot! David self comments because this is his own photo",
          likes: 9,
          timeAgo: "1h",
          replies: [
            {
              id: "r1",
              username: "isaactanlishung",
              userAvatar:
                "https://scontent.fkul3-3.fna.fbcdn.net/v/t39.30808-6/338412396_170251385889424_655098475624149023_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=6lz4jHLZW7gQ7kNvwFleYFq&_nc_oc=Adl8tm0GU7mUREsXhJ6nkmkFSwM8T2zwuxFWuHQ4-RAazFMIUBA1x0lsGqsuRddsIi7qK4hzitWavv5hmsSAHEd5&_nc_zt=23&_nc_ht=scontent.fkul3-3.fna&_nc_gid=h_KRfW7IzLScALguNDs2ww&oh=00_AfVZAkxvpDhH2f4a5DnCXeh6MrNZQlT56EiCzKiD-YV7UA&oe=68964130",
              text: "Thanks! I used a FUJI mirrorless camera with a 24-70mm lens, like fr.",
              likes: 3,
              timeAgo: "45m",
            },
            {
              id: "r2",
              username: "david_tiw",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: "Really do checkout his work. He's a good friend of mine who does UIUX design and photoshoots.",
              likes: 2,
              timeAgo: "30m",
            },
          ],
        },
        {
          id: "c2",
          username: "david_tiw",
          userAvatar:
            "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
          text: "README.md. Jokes. Clearly impossible in 2 days. This is with the help of Cursor. And this takes at least 3 days.",
          likes: 3,
          timeAgo: "1h",
          replies: [
            {
              id: "r1",
              username: "david_tiw",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: "Project setup: React, Hono, and Cloudflare.",
              likes: 0,
              timeAgo: "45m",
            },
            {
              id: "r2",
              username: "david_tiw",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: "React: TS-Router, TS-Query, Zod, Zustand, shadcn/ui, twcss",
              likes: 2,
              timeAgo: "30m",
            },
            {
              id: "r3",
              username: "david_tiw",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: "Hono: Effect, Zod, Hono, hono/trpc",
              likes: 2,
              timeAgo: "30m",
            },
            {
              id: "r3",
              username: "david_tiw",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: "I've been wanting to learn on TS-Query, TS-Router, Effect and trpc for some time and I make use of this oppurtunity to learn the usage and how it scales applications and developments.",
              likes: 2,
              timeAgo: "30m",
            },
          ],
        },
        {
          id: "c3",
          username: "david_tiw",
          userAvatar:
            "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
          text: "HOW2USE.md",
          likes: 5,
          timeAgo: "1h",
          replies: [
            {
              id: "r1",
              username: "david_tiw",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: `Top Right, "+" for URL upload and Caption`,
              likes: 3,
              timeAgo: "45m",
            },
            {
              id: "r2",
              username: "david_tiw",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: "Double Tap for like on posts. Single Tap on hearts for comments/reply.",
              likes: 2,
              timeAgo: "30m",
            },
            {
              id: "r3",
              username: "david_tiw",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: "Click reply on comments/reply to @ the person and be added on top the you wanna reply.",
              likes: 2,
              timeAgo: "30m",
            },
            {
              id: "r4",
              username: "david_tiw",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: "That's it.",
              likes: 2,
              timeAgo: "30m",
            },
          ],
        },
        {
          id: "c4",
          username: "david_tiw",
          userAvatar:
            "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
          text: "WHY & HOW.md",
          likes: 8,
          timeAgo: "1h",
          replies: [
            {
              id: "r1",
              username: "david_tiw",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: `FE Architecture : TS-Query, TS-Router because of caching, error handling and file-based routing like Next.js. 
              But not NextJS, WHY? because there is no granular control like in React than in NextJS. 
              Zod for type safety. TRPC because I want to attempt to use trpc.post.like/comment but was unable to do so and simplify the DevEx on the FE, but end up API calling instead. I wanted to connect to server and use whatever functions that were able to be done through trpc.`,
              likes: 3,
              timeAgo: "45m",
            },
            {
              id: "r2",
              username: "david_tiw",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: `FE Component Control: Routes, Components and Zustand (Store). 
            It should only be as complicated as this could be. 

            On the Route, the fetching of data should be done in the route-based components, and the components should be able to handle the data.
            Instead of creating another folder for api_call, it creates complication and referencing which will get confusing dev/debugging/maintenance.
            
            The <Comment />  are nested in <CommentDrawer/> because there are multiple comments. 
            Zustand is used to manage the state for @reply and comment incase of user interactivity. 

            The same goes for <Post /> and <Feed /> as <Feed/> is the main feature on the page, and there will be multiple posts.
            To manage it on a person's feed, there might have different arrange of the <Post />, and the <Feed /> should be able to handle it; 
            because JS dev fav fx is .map() and ?.

            To structure it better, within compoonents should have a route-based components, and emphasize on the route-based components.`,
              likes: 2,
              timeAgo: "30m",
            },
            {
              id: "r3",
              username: "david_tiw",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: `BE Architecture: Effect, trpc, zod, HonoJS.
              I chose Effect because its FP, and I wanted to try it out due to its granular control over failure cases, testability, maintainability. 
              When code is written in Effect, the immutability is enforced. There won't be any weird bugs that are hard to debug during production and testing,
              where I myself struggle to write OOP based code, I understand the concept of OOP, but when it gets too nested it simply becomes too hard to debug.
              where as in FP the code is straight forward, with correct naming, the logging, debugging, and testing is clearer.
              
              I went with trpc instead of API due to its simplicity on the frontend to connect to the db. 
              Something like supabase was able to deliver, but apparent the cases of trpc usage if better on mono-repo where this FE-BE relationship doesn't work for Type-Safe dev.
              
              HonoJS because it's a lightweight/clean framework writing style that is easy to understand, use and deploy on CF 
              without the maintenance of containers, etc to scale the application thus the preference to CF. 
              `,
              likes: 2,
              timeAgo: "30m",
            },
            {
              id: "r4",
              username: "david_tiw",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: "That's it.",
              likes: 2,
              timeAgo: "30m",
            },
          ],
        },
      ],
      totalCommentsCount: 2,
    },
    {
      id: "2",
      username: "dtiw.xyz",
      userAvatar:
        "https://scontent.fkul3-5.fna.fbcdn.net/v/t1.6435-9/41673054_2112990445379324_408678009504006144_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=YiWQVm7ffDkQ7kNvwE4nD4e&_nc_oc=AdkiukJkUdJJccnEzAjhHEbMJVkC-SP-xiucwENsrb8FGNcj80ybYDqQaCQWtYi7L3QHs1-HnCaFlzpfY8ikP7hZ&_nc_zt=23&_nc_ht=scontent.fkul3-5.fna&_nc_gid=qD5sW5hXOlrm-B3Bnnh0KQ&oh=00_AfXKNCIVOqg8cO5PcD7Tkse106rlilyuwEBtwNlPKLhl5A&oe=68B7EF5F",
      image:
        "https://scontent.fkul3-5.fna.fbcdn.net/v/t1.6435-9/41673054_2112990445379324_408678009504006144_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=YiWQVm7ffDkQ7kNvwE4nD4e&_nc_oc=AdkiukJkUdJJccnEzAjhHEbMJVkC-SP-xiucwENsrb8FGNcj80ybYDqQaCQWtYi7L3QHs1-HnCaFlzpfY8ikP7hZ&_nc_zt=23&_nc_ht=scontent.fkul3-5.fna&_nc_gid=qD5sW5hXOlrm-B3Bnnh0KQ&oh=00_AfXKNCIVOqg8cO5PcD7Tkse106rlilyuwEBtwNlPKLhl5A&oe=68B7EF5F",
      caption:
        "A cooler David. Software Engineer - for outdated portfolio go to dtiw.xyz",
      likes: 28,
      timeAgo: "4h",
      comments: [
        {
          id: "c1",
          username: "david_tiw",
          userAvatar:
            "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
          text: "PERSONALITY.md",
          likes: 5,
          timeAgo: "1h",
          replies: [
            {
              id: "r1",
              username: "dtiw.xyz",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: `
              INTJ. Type 1w2.
              A bit try-hard. So I seriously taking my seriousness more lightly. 
              I'm straight forward, because I prefer truth and understanding. 
              It is not an OR statement, because w/o truth and understanding, 
              there will be a picture/impression I paint without going through the struggles of knowing someone.
              `,
              likes: 3,
              timeAgo: "45m",
            },
            {
              id: "r2",
              username: "david_tiw",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: `At WORK I have a routine/ritual in the AM.
              I will start the work by writing out the tasks for the day, and focus on it. 
              Then I will work on the heaviest tasks for the day. Followed by the lighter tasks.

              In the morning, I will have a clearer mind, and I will be more focused on the tasks.
              I will also be more productive, disciplined, creative, and I will be more efficient, innovative, and consistent.

              If disrupted sometimes, I will be pretty moody for the rest of the day.
              `,
              likes: 2,
              timeAgo: "30m",
            },
            {
              id: "r3",
              username: "david_tiw",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: `MAX Social hr / day : 2 hours.
              pushing it = burnout + social mode for days.
              `,
              likes: 2,
              timeAgo: "30m",
            },
          ],
        },
        {
          id: "c1",
          username: "david_tiw",
          userAvatar:
            "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
          text: "HOBBY.md",
          likes: 5,
          timeAgo: "1h",
          replies: [
            {
              id: "r1",
              username: "dtiw.xyz",
              userAvatar:
                "https://scontent.fkul3-4.fna.fbcdn.net/v/t1.6435-9/45609712_2187758491235852_6900831938550956032_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=NOORgK5j-S8Q7kNvwEYOll2&_nc_oc=AdleRVF2ey5BpbZOhYHqJavrM3S6S2apCnTLvMJ8RR3m_3dz_qUW9DVlpFY_uXHAIbSmTDjiOV5-hVlAZZWbI6dl&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=1I7htGLHrX5-6LFgLZyI3A&oh=00_AfVLolz1iXJfv_N0y0gz4p5GedJveuESjqVkTHaIf0eJdg&oe=68B7C24A",
              text: `
              F1.
              Go-kart 
              Sleep. 
              Read. (but I stopped).
              ChatGPT. 
              Claude.
              `,
              likes: 3,
              timeAgo: "45m",
            },
          ],
        },
      ],
      totalCommentsCount: 0,
    },
  ];

  // Effect to get all posts
  getAllPosts = Effect.succeed(this.posts);

  // Effect to create a new post
  createPost = (input: z.infer<typeof CreatePostSchema>) =>
    Effect.sync(() => {
      const newPost: z.infer<typeof PostSchema> = {
        id: Date.now().toString(), // Simple ID generation
        ...input,
        likes: 0,
        timeAgo: "now",
        comments: [],
        totalCommentsCount: 0,
      };
      this.posts.unshift(newPost); // Add to beginning of array
      return newPost;
    });

  // Effect to find a post by ID
  findPostById = (id: string) =>
    Effect.sync(() =>
      Array.findFirst(this.posts, (post) => post.id === id)
    ).pipe(
      Effect.flatMap((option) =>
        Option.isSome(option)
          ? Effect.succeed(option.value)
          : Effect.fail(new Error(`Post with id ${id} not found`))
      )
    );

  // Effect to increment likes for a post
  incrementLikes = (id: string) =>
    Effect.sync(() => {
      const postIndex = this.posts.findIndex((post) => post.id === id);
      if (postIndex === -1) {
        throw new Error(`Post with id ${id} not found`);
      }

      // Increment likes count
      this.posts[postIndex].likes += 1;
      return this.posts[postIndex];
    });

  // Effect to decrement likes for a post
  decrementLikes = (id: string) =>
    Effect.sync(() => {
      const postIndex = this.posts.findIndex((post) => post.id === id);
      if (postIndex === -1) {
        throw new Error(`Post with id ${id} not found`);
      }

      // Decrement likes count
      this.posts[postIndex].likes -= 1;
      return this.posts[postIndex];
    });

  // Effect to add a comment to a post
  addComment = (input: z.infer<typeof CreateCommentSchema>) =>
    Effect.sync(() => {
      const postIndex = this.posts.findIndex(
        (post) => post.id === input.postId
      );
      if (postIndex === -1) {
        throw new Error(`Post with id ${input.postId} not found`);
      }

      const newComment: CommentType = {
        id: `c_${Date.now()}`, // Generate unique comment ID
        username: input.username,
        userAvatar: input.userAvatar,
        text: input.text,
        likes: 0,
        timeAgo: "now",
        replies: [],
      };

      // Add comment to post
      this.posts[postIndex].comments.push(newComment);
      this.posts[postIndex].totalCommentsCount =
        (this.posts[postIndex].totalCommentsCount || 0) + 1;

      return {
        post: this.posts[postIndex],
        comment: newComment,
      };
    });

  // Effect to add a reply to a comment
  addReply = (input: z.infer<typeof CreateReplySchema>) =>
    Effect.sync(() => {
      const postIndex = this.posts.findIndex(
        (post) => post.id === input.postId
      );
      if (postIndex === -1) {
        throw new Error(`Post with id ${input.postId} not found`);
      }

      const commentIndex = this.posts[postIndex].comments.findIndex(
        (comment) => comment.id === input.commentId
      );
      if (commentIndex === -1) {
        throw new Error(`Comment with id ${input.commentId} not found`);
      }

      const newReply: CommentType = {
        id: `r_${Date.now()}`, // Generate unique reply ID
        username: input.username,
        userAvatar: input.userAvatar,
        text: input.text,
        likes: 0,
        timeAgo: "now",
      };

      // Initialize replies array if it doesn't exist
      if (!this.posts[postIndex].comments[commentIndex].replies) {
        this.posts[postIndex].comments[commentIndex].replies = [];
      }

      // Add reply to comment
      this.posts[postIndex].comments[commentIndex].replies!.push(newReply);
      this.posts[postIndex].totalCommentsCount =
        (this.posts[postIndex].totalCommentsCount || 0) + 1;

      return {
        post: this.posts[postIndex],
        comment: this.posts[postIndex].comments[commentIndex],
        reply: newReply,
      };
    });

  // Effect to like a comment
  likeComment = (input: z.infer<typeof LikeCommentSchema>) =>
    Effect.sync(() => {
      const postIndex = this.posts.findIndex(
        (post) => post.id === input.postId
      );
      if (postIndex === -1) {
        throw new Error(`Post with id ${input.postId} not found`);
      }

      const commentIndex = this.posts[postIndex].comments.findIndex(
        (comment) => comment.id === input.commentId
      );
      if (commentIndex === -1) {
        throw new Error(`Comment with id ${input.commentId} not found`);
      }

      // Increment comment likes
      this.posts[postIndex].comments[commentIndex].likes += 1;

      return {
        post: this.posts[postIndex],
        comment: this.posts[postIndex].comments[commentIndex],
      };
    });

  // Effect to unlike a comment
  unlikeComment = (input: z.infer<typeof LikeCommentSchema>) =>
    Effect.sync(() => {
      const postIndex = this.posts.findIndex(
        (post) => post.id === input.postId
      );
      if (postIndex === -1) {
        throw new Error(`Post with id ${input.postId} not found`);
      }

      const commentIndex = this.posts[postIndex].comments.findIndex(
        (comment) => comment.id === input.commentId
      );
      if (commentIndex === -1) {
        throw new Error(`Comment with id ${input.commentId} not found`);
      }

      // Decrement comment likes (don't go below 0)
      this.posts[postIndex].comments[commentIndex].likes = Math.max(
        0,
        this.posts[postIndex].comments[commentIndex].likes - 1
      );

      return {
        post: this.posts[postIndex],
        comment: this.posts[postIndex].comments[commentIndex],
      };
    });

  // Effect to like a reply
  likeReply = (input: z.infer<typeof LikeReplySchema>) =>
    Effect.sync(() => {
      const postIndex = this.posts.findIndex(
        (post) => post.id === input.postId
      );
      if (postIndex === -1) {
        throw new Error(`Post with id ${input.postId} not found`);
      }

      const commentIndex = this.posts[postIndex].comments.findIndex(
        (comment) => comment.id === input.commentId
      );
      if (commentIndex === -1) {
        throw new Error(`Comment with id ${input.commentId} not found`);
      }

      const replyIndex =
        this.posts[postIndex].comments[commentIndex].replies?.findIndex(
          (reply) => reply.id === input.replyId
        ) ?? -1;
      if (replyIndex === -1) {
        throw new Error(`Reply with id ${input.replyId} not found`);
      }

      // Increment reply likes
      this.posts[postIndex].comments[commentIndex].replies![
        replyIndex
      ].likes += 1;

      return {
        post: this.posts[postIndex],
        comment: this.posts[postIndex].comments[commentIndex],
        reply:
          this.posts[postIndex].comments[commentIndex].replies![replyIndex],
      };
    });

  // Effect to unlike a reply
  unlikeReply = (input: z.infer<typeof LikeReplySchema>) =>
    Effect.sync(() => {
      const postIndex = this.posts.findIndex(
        (post) => post.id === input.postId
      );
      if (postIndex === -1) {
        throw new Error(`Post with id ${input.postId} not found`);
      }

      const commentIndex = this.posts[postIndex].comments.findIndex(
        (comment) => comment.id === input.commentId
      );
      if (commentIndex === -1) {
        throw new Error(`Comment with id ${input.commentId} not found`);
      }

      const replyIndex =
        this.posts[postIndex].comments[commentIndex].replies?.findIndex(
          (reply) => reply.id === input.replyId
        ) ?? -1;
      if (replyIndex === -1) {
        throw new Error(`Reply with id ${input.replyId} not found`);
      }

      // Decrement reply likes (don't go below 0)
      this.posts[postIndex].comments[commentIndex].replies![replyIndex].likes =
        Math.max(
          0,
          this.posts[postIndex].comments[commentIndex].replies![replyIndex]
            .likes - 1
        );

      return {
        post: this.posts[postIndex],
        comment: this.posts[postIndex].comments[commentIndex],
        reply:
          this.posts[postIndex].comments[commentIndex].replies![replyIndex],
      };
    });
}

// Create service instance
const postsService = new PostsService();

// Define our tRPC router with all the endpoints
export const postsRouter = router({
  // GET /posts - Fetch all posts
  getPosts: publicProcedure
    .output(z.array(PostSchema)) // Define expected output type
    .query(async () => {
      // Use Effect to get posts and handle any potential errors
      return await Effect.runPromise(
        postsService.getAllPosts.pipe(
          Effect.tapError((error) => Effect.logError(error)) // Log errors using Effect
        )
      );
    }),

  // POST /posts - Create a new post
  createPost: publicProcedure
    .input(CreatePostSchema) // Validate input using our schema
    .output(PostSchema) // Define expected output type
    .mutation(async ({ input }) => {
      // Use Effect to create post and handle any potential errors
      return await Effect.runPromise(
        postsService.createPost(input).pipe(
          Effect.tapError((error) => Effect.logError(error)),
          Effect.tap((post) => Effect.log(`Created post with ID: ${post.id}`))
        )
      );
    }),

  // PATCH /posts/:id/like - Increment likes for a specific post
  likePost: publicProcedure
    .input(z.object({ id: z.string() })) // Validate that we get a valid ID
    .output(PostSchema) // Return the updated post
    .mutation(async ({ input }) => {
      // Use Effect to increment likes and handle any potential errors
      return await Effect.runPromise(
        postsService.incrementLikes(input.id).pipe(
          Effect.tapError((error) => Effect.logError(error)),
          Effect.tap((post) =>
            Effect.log(
              `Incremented likes for post ${post.id}: ${post.likes} likes`
            )
          )
        )
      );
    }),

  unlikePost: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(PostSchema)
    .mutation(async ({ input }) => {
      return await Effect.runPromise(
        postsService.decrementLikes(input.id).pipe(
          Effect.tapError((error) => Effect.logError(error)),
          Effect.tap((post) =>
            Effect.log(
              `Decremented likes for post ${post.id}: ${post.likes} likes`
            )
          )
        )
      );
    }),

  // GET /posts/:id - Get a single post by ID (bonus endpoint)
  getPostById: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(PostSchema)
    .query(async ({ input }) => {
      return await Effect.runPromise(
        postsService
          .findPostById(input.id)
          .pipe(Effect.tapError((error) => Effect.logError(error)))
      );
    }),

  // POST /comments - Add a comment to a post
  addComment: publicProcedure
    .input(CreateCommentSchema)
    .output(
      z.object({
        post: PostSchema,
        comment: CommentSchema,
      })
    )
    .mutation(async ({ input }) => {
      return await Effect.runPromise(
        postsService.addComment(input).pipe(
          Effect.tapError((error) => Effect.logError(error)),
          Effect.tap((result) =>
            Effect.log(`Added comment to post ${result.post.id}`)
          )
        )
      );
    }),

  // POST /replies - Add a reply to a comment
  addReply: publicProcedure
    .input(CreateReplySchema)
    .output(
      z.object({
        post: PostSchema,
        comment: CommentSchema,
        reply: CommentSchema,
      })
    )
    .mutation(async ({ input }) => {
      return await Effect.runPromise(
        postsService.addReply(input).pipe(
          Effect.tapError((error) => Effect.logError(error)),
          Effect.tap((result) =>
            Effect.log(`Added reply to comment ${result.comment.id}`)
          )
        )
      );
    }),

  // PATCH /comments/:id/like - Like a comment
  likeComment: publicProcedure
    .input(LikeCommentSchema)
    .output(
      z.object({
        post: PostSchema,
        comment: CommentSchema,
      })
    )
    .mutation(async ({ input }) => {
      return await Effect.runPromise(
        postsService.likeComment(input).pipe(
          Effect.tapError((error) => Effect.logError(error)),
          Effect.tap((result) =>
            Effect.log(
              `Liked comment ${result.comment.id}: ${result.comment.likes} likes`
            )
          )
        )
      );
    }),

  // PATCH /comments/:id/unlike - Unlike a comment
  unlikeComment: publicProcedure
    .input(LikeCommentSchema)
    .output(
      z.object({
        post: PostSchema,
        comment: CommentSchema,
      })
    )
    .mutation(async ({ input }) => {
      return await Effect.runPromise(
        postsService.unlikeComment(input).pipe(
          Effect.tapError((error) => Effect.logError(error)),
          Effect.tap((result) =>
            Effect.log(
              `Unliked comment ${result.comment.id}: ${result.comment.likes} likes`
            )
          )
        )
      );
    }),

  // PATCH /replies/:id/like - Like a reply
  likeReply: publicProcedure
    .input(LikeReplySchema)
    .output(
      z.object({
        post: PostSchema,
        comment: CommentSchema,
        reply: CommentSchema,
      })
    )
    .mutation(async ({ input }) => {
      return await Effect.runPromise(
        postsService.likeReply(input).pipe(
          Effect.tapError((error) => Effect.logError(error)),
          Effect.tap((result) =>
            Effect.log(
              `Liked reply ${result.reply.id}: ${result.reply.likes} likes`
            )
          )
        )
      );
    }),

  // PATCH /replies/:id/unlike - Unlike a reply
  unlikeReply: publicProcedure
    .input(LikeReplySchema)
    .output(
      z.object({
        post: PostSchema,
        comment: CommentSchema,
        reply: CommentSchema,
      })
    )
    .mutation(async ({ input }) => {
      return await Effect.runPromise(
        postsService.unlikeReply(input).pipe(
          Effect.tapError((error) => Effect.logError(error)),
          Effect.tap((result) =>
            Effect.log(
              `Unliked reply ${result.reply.id}: ${result.reply.likes} likes`
            )
          )
        )
      );
    }),
});

// Export the type of our router for frontend use
export type PostsRouter = typeof postsRouter;
