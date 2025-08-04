```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```



BE build on Hono. 
Architecture: Effect, trpc, zod, HonoJS.
I chose Effect because its FP, and I wanted to try it out due to its granular control over failure cases, testability, maintainability. 

When code is written in Effect, the immutability is enforced. There won't be any weird bugs that are hard to debug during production and testing,
where I myself struggle to write OOP based code, I understand the concept of OOP, but when it gets too nested it simply becomes too hard to debug. where as in FP the code is straight forward, with correct naming, the logging, debugging, and testing is clearer.
              
I went with trpc instead of API due to its simplicity on the frontend to connect to the db. 
Something like supabase was able to deliver, but apparent the cases of trpc usage if better on mono-repo where this FE-BE relationship doesn't work for Type-Safe dev.
              
HonoJS because it's a lightweight/clean framework writing style that is easy to understand, use and deploy on CF 
without the maintenance of containers, etc to scale the application thus the preference to CF. 