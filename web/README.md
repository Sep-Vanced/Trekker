This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```
mapanuepe-trail
├─ AGENTS.md
├─ CLAUDE.md
├─ eslint.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ api
│  │  │  ├─ auth
│  │  │  │  ├─ login
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ logout
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ profile
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ refresh
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ register
│  │  │  │     └─ route.ts
│  │  │  ├─ navigation
│  │  │  │  ├─ campsite
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [id]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ checkpoint
│  │  │  │  │  └─ [routeId]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ trekroute
│  │  │  │  │  ├─ detail
│  │  │  │  │  │  └─ [routeId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  └─ [campsiteId]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ vehicles
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ weather
│  │  │  │     └─ route.ts
│  │  │  ├─ tourism
│  │  │  │  ├─ my-registrations
│  │  │  │  │  ├─ history
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ ranger
│  │  │  │  │  ├─ dashboard
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ entry
│  │  │  │  │  │  └─ [trackingId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ exit
│  │  │  │  │  │  └─ [trackingId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ registrations
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ scan
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ register
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ registrations
│  │  │  │     └─ [permit]
│  │  │  │        ├─ qr
│  │  │  │        │  └─ route.ts
│  │  │  │        └─ route.ts
│  │  │  ├─ user
│  │  │  │  ├─ location
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ location-log
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [sessionId]
│  │  │  │  │     └─ route.ts
│  │  │  │  └─ trekking-session
│  │  │  │     ├─ route.ts
│  │  │  │     └─ [id]
│  │  │  │        └─ route.ts
│  │  │  └─ weather
│  │  │     └─ routes
│  │  │        └─ [routeId]
│  │  │           ├─ refresh
│  │  │           │  └─ route.ts
│  │  │           └─ route.ts
│  │  ├─ campsite-routes
│  │  │  └─ page.tsx
│  │  ├─ dashboard
│  │  │  └─ page.tsx
│  │  ├─ emergency
│  │  │  └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ home
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ my-registrations
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ profile
│  │  │  └─ page.tsx
│  │  ├─ ranger
│  │  │  ├─ dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ profile
│  │  │  │  └─ page.tsx
│  │  │  ├─ registrations
│  │  │  │  └─ page.tsx
│  │  │  └─ scan
│  │  │     └─ page.tsx
│  │  ├─ registration-detail
│  │  │  └─ page.tsx
│  │  ├─ route-checkpoints
│  │  │  └─ page.tsx
│  │  ├─ routes
│  │  │  └─ page.tsx
│  │  ├─ sign-in
│  │  │  └─ page.tsx
│  │  ├─ sign-up
│  │  │  └─ page.tsx
│  │  ├─ trek
│  │  │  └─ page.tsx
│  │  └─ trek-start
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ trekker
│  │  │  └─ TabLayout.tsx
│  │  └─ ui
│  │     ├─ CampsiteMap.tsx
│  │     ├─ CampsiteMapClient.tsx
│  │     ├─ PhaseConfig.ts
│  │     └─ WeatherCard.tsx
│  ├─ hooks
│  │  └─ useAuth.tsx
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ jwt.ts
│  │  ├─ prisma.ts
│  │  └─ utils.ts
│  └─ types
│     ├─ auth.ts
│     ├─ navigation-types.ts
│     ├─ trekking-types.ts
│     └─ weather-types.ts
└─ tsconfig.json

```
```
mapanuepe-trail
├─ AGENTS.md
├─ CLAUDE.md
├─ eslint.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ api
│  │  │  ├─ auth
│  │  │  │  ├─ login
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ logout
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ profile
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ refresh
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ register
│  │  │  │     └─ route.ts
│  │  │  ├─ navigation
│  │  │  │  ├─ campsite
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [id]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ checkpoint
│  │  │  │  │  └─ [routeId]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ trekroute
│  │  │  │  │  ├─ detail
│  │  │  │  │  │  └─ [routeId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  └─ [campsiteId]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ vehicles
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ weather
│  │  │  │     └─ route.ts
│  │  │  ├─ tourism
│  │  │  │  ├─ my-registrations
│  │  │  │  │  ├─ history
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ ranger
│  │  │  │  │  ├─ dashboard
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ entry
│  │  │  │  │  │  └─ [trackingId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ exit
│  │  │  │  │  │  └─ [trackingId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ registrations
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ scan
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ register
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ registrations
│  │  │  │     └─ [permit]
│  │  │  │        ├─ qr
│  │  │  │        │  └─ route.ts
│  │  │  │        └─ route.ts
│  │  │  ├─ user
│  │  │  │  ├─ location
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ location-log
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [sessionId]
│  │  │  │  │     └─ route.ts
│  │  │  │  └─ trekking-session
│  │  │  │     ├─ route.ts
│  │  │  │     └─ [id]
│  │  │  │        └─ route.ts
│  │  │  └─ weather
│  │  │     └─ routes
│  │  │        └─ [routeId]
│  │  │           ├─ refresh
│  │  │           │  └─ route.ts
│  │  │           └─ route.ts
│  │  ├─ campsite-routes
│  │  │  └─ page.tsx
│  │  ├─ dashboard
│  │  │  └─ page.tsx
│  │  ├─ emergency
│  │  │  └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ home
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ my-registrations
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ profile
│  │  │  └─ page.tsx
│  │  ├─ ranger
│  │  │  ├─ dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ profile
│  │  │  │  └─ page.tsx
│  │  │  ├─ registrations
│  │  │  │  └─ page.tsx
│  │  │  └─ scan
│  │  │     └─ page.tsx
│  │  ├─ registration-detail
│  │  │  └─ page.tsx
│  │  ├─ route-checkpoints
│  │  │  └─ page.tsx
│  │  ├─ routes
│  │  │  └─ page.tsx
│  │  ├─ sign-in
│  │  │  └─ page.tsx
│  │  ├─ sign-up
│  │  │  └─ page.tsx
│  │  ├─ trek
│  │  │  └─ page.tsx
│  │  └─ trek-start
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ trekker
│  │  │  └─ TabLayout.tsx
│  │  └─ ui
│  │     ├─ CampsiteMap.tsx
│  │     ├─ CampsiteMapClient.tsx
│  │     ├─ PhaseConfig.ts
│  │     └─ WeatherCard.tsx
│  ├─ hooks
│  │  └─ useAuth.tsx
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ jwt.ts
│  │  ├─ prisma.ts
│  │  └─ utils.ts
│  └─ types
│     ├─ auth.ts
│     ├─ navigation-types.ts
│     ├─ trekking-types.ts
│     └─ weather-types.ts
└─ tsconfig.json

```
```
mapanuepe-trail
├─ AGENTS.md
├─ CLAUDE.md
├─ eslint.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ api
│  │  │  ├─ auth
│  │  │  │  ├─ login
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ logout
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ profile
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ refresh
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ register
│  │  │  │     └─ route.ts
│  │  │  ├─ navigation
│  │  │  │  ├─ campsite
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [id]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ checkpoint
│  │  │  │  │  └─ [routeId]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ trekroute
│  │  │  │  │  ├─ detail
│  │  │  │  │  │  └─ [routeId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  └─ [campsiteId]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ vehicles
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ weather
│  │  │  │     └─ route.ts
│  │  │  ├─ tourism
│  │  │  │  ├─ my-registrations
│  │  │  │  │  ├─ history
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ ranger
│  │  │  │  │  ├─ dashboard
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ entry
│  │  │  │  │  │  └─ [trackingId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ exit
│  │  │  │  │  │  └─ [trackingId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ registrations
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ scan
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ register
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ registrations
│  │  │  │     └─ [permit]
│  │  │  │        ├─ qr
│  │  │  │        │  └─ route.ts
│  │  │  │        └─ route.ts
│  │  │  ├─ user
│  │  │  │  ├─ location
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ location-log
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [sessionId]
│  │  │  │  │     └─ route.ts
│  │  │  │  └─ trekking-session
│  │  │  │     ├─ route.ts
│  │  │  │     └─ [id]
│  │  │  │        └─ route.ts
│  │  │  └─ weather
│  │  │     └─ routes
│  │  │        └─ [routeId]
│  │  │           ├─ refresh
│  │  │           │  └─ route.ts
│  │  │           └─ route.ts
│  │  ├─ campsite-routes
│  │  │  └─ page.tsx
│  │  ├─ dashboard
│  │  │  └─ page.tsx
│  │  ├─ emergency
│  │  │  └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ home
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ my-registrations
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ profile
│  │  │  └─ page.tsx
│  │  ├─ ranger
│  │  │  ├─ dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ profile
│  │  │  │  └─ page.tsx
│  │  │  ├─ registrations
│  │  │  │  └─ page.tsx
│  │  │  └─ scan
│  │  │     └─ page.tsx
│  │  ├─ registration-detail
│  │  │  └─ page.tsx
│  │  ├─ route-checkpoints
│  │  │  └─ page.tsx
│  │  ├─ routes
│  │  │  └─ page.tsx
│  │  ├─ session-detail
│  │  │  └─ page.tsx
│  │  ├─ sign-in
│  │  │  └─ page.tsx
│  │  ├─ sign-up
│  │  │  └─ page.tsx
│  │  ├─ trek
│  │  │  └─ page.tsx
│  │  └─ trek-start
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ trekker
│  │  │  └─ TabLayout.tsx
│  │  └─ ui
│  │     ├─ CampsiteMap.tsx
│  │     ├─ CampsiteMapClient.tsx
│  │     ├─ PhaseConfig.ts
│  │     ├─ RouteMap.tsx
│  │     ├─ RouteMapClient.tsx
│  │     └─ WeatherCard.tsx
│  ├─ hooks
│  │  └─ useAuth.tsx
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ jwt.ts
│  │  ├─ prisma.ts
│  │  └─ utils.ts
│  └─ types
│     ├─ auth.ts
│     ├─ navigation-types.ts
│     ├─ trekking-types.ts
│     └─ weather-types.ts
└─ tsconfig.json

```
```
mapanuepe-trail
├─ AGENTS.md
├─ CLAUDE.md
├─ dev.db
├─ eslint.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20260816104549_init
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ scripts
│  ├─ migrate-to-sqlite.ts
│  ├─ test-db.ts
│  └─ test-sqlite.mjs
├─ src
│  ├─ app
│  │  ├─ api
│  │  │  ├─ auth
│  │  │  │  ├─ login
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ logout
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ profile
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ refresh
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ register
│  │  │  │     └─ route.ts
│  │  │  ├─ navigation
│  │  │  │  ├─ campsite
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [id]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ checkpoint
│  │  │  │  │  └─ [routeId]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ trekroute
│  │  │  │  │  ├─ detail
│  │  │  │  │  │  └─ [routeId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [campsiteId]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ vehicles
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ weather
│  │  │  │     └─ route.ts
│  │  │  ├─ tourism
│  │  │  │  ├─ my-registrations
│  │  │  │  │  ├─ history
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ ranger
│  │  │  │  │  ├─ dashboard
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ entry
│  │  │  │  │  │  └─ [trackingId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ exit
│  │  │  │  │  │  └─ [trackingId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ registrations
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ scan
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ register
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ registrations
│  │  │  │     └─ [permit]
│  │  │  │        ├─ qr
│  │  │  │        │  └─ route.ts
│  │  │  │        └─ route.ts
│  │  │  ├─ user
│  │  │  │  ├─ location
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ location-log
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [sessionId]
│  │  │  │  │     └─ route.ts
│  │  │  │  └─ trekking-session
│  │  │  │     ├─ route.ts
│  │  │  │     └─ [id]
│  │  │  │        └─ route.ts
│  │  │  └─ weather
│  │  │     └─ routes
│  │  │        └─ [routeId]
│  │  │           ├─ refresh
│  │  │           │  └─ route.ts
│  │  │           └─ route.ts
│  │  ├─ campsite-routes
│  │  │  └─ page.tsx
│  │  ├─ dashboard
│  │  │  └─ page.tsx
│  │  ├─ emergency
│  │  │  └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ home
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ my-registrations
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ profile
│  │  │  └─ page.tsx
│  │  ├─ ranger
│  │  │  ├─ dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ profile
│  │  │  │  └─ page.tsx
│  │  │  ├─ registrations
│  │  │  │  └─ page.tsx
│  │  │  └─ scan
│  │  │     └─ page.tsx
│  │  ├─ registration-detail
│  │  │  └─ page.tsx
│  │  ├─ route-checkpoints
│  │  │  └─ page.tsx
│  │  ├─ routes
│  │  │  └─ page.tsx
│  │  ├─ session-detail
│  │  │  └─ page.tsx
│  │  ├─ sign-in
│  │  │  └─ page.tsx
│  │  ├─ sign-up
│  │  │  └─ page.tsx
│  │  ├─ trek
│  │  │  └─ page.tsx
│  │  └─ trek-start
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ trekker
│  │  │  └─ TabLayout.tsx
│  │  └─ ui
│  │     ├─ CampsiteMap.tsx
│  │     ├─ CampsiteMapClient.tsx
│  │     ├─ PhaseConfig.ts
│  │     ├─ RouteMap.tsx
│  │     ├─ RouteMapClient.tsx
│  │     └─ WeatherCard.tsx
│  ├─ hooks
│  │  └─ useAuth.tsx
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ jwt.ts
│  │  ├─ prisma.ts
│  │  └─ utils.ts
│  └─ types
│     ├─ auth.ts
│     ├─ navigation-types.ts
│     ├─ trekking-types.ts
│     └─ weather-types.ts
└─ tsconfig.json

```
```
mapanuepe-trail
├─ AGENTS.md
├─ CLAUDE.md
├─ dev.db
├─ eslint.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20260816104549_init
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ scripts
│  ├─ migrate-to-sqlite.ts
│  ├─ test-db.ts
│  └─ test-sqlite.mjs
├─ src
│  ├─ app
│  │  ├─ api
│  │  │  ├─ auth
│  │  │  │  ├─ login
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ logout
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ profile
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ refresh
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ register
│  │  │  │     └─ route.ts
│  │  │  ├─ navigation
│  │  │  │  ├─ campsite
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [id]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ checkpoint
│  │  │  │  │  └─ [routeId]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ trekroute
│  │  │  │  │  ├─ detail
│  │  │  │  │  │  └─ [routeId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [campsiteId]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ vehicles
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ weather
│  │  │  │     └─ route.ts
│  │  │  ├─ tourism
│  │  │  │  ├─ my-registrations
│  │  │  │  │  ├─ history
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ ranger
│  │  │  │  │  ├─ dashboard
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ entry
│  │  │  │  │  │  └─ [trackingId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ exit
│  │  │  │  │  │  └─ [trackingId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ registrations
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ scan
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ register
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ registrations
│  │  │  │     └─ [permit]
│  │  │  │        ├─ qr
│  │  │  │        │  └─ route.ts
│  │  │  │        └─ route.ts
│  │  │  ├─ user
│  │  │  │  ├─ location
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ location-log
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [sessionId]
│  │  │  │  │     └─ route.ts
│  │  │  │  └─ trekking-session
│  │  │  │     ├─ route.ts
│  │  │  │     └─ [id]
│  │  │  │        └─ route.ts
│  │  │  └─ weather
│  │  │     └─ routes
│  │  │        └─ [routeId]
│  │  │           ├─ refresh
│  │  │           │  └─ route.ts
│  │  │           └─ route.ts
│  │  ├─ campsite-routes
│  │  │  └─ page.tsx
│  │  ├─ dashboard
│  │  │  └─ page.tsx
│  │  ├─ emergency
│  │  │  └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ home
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ my-registrations
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ profile
│  │  │  └─ page.tsx
│  │  ├─ ranger
│  │  │  ├─ dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ profile
│  │  │  │  └─ page.tsx
│  │  │  ├─ registrations
│  │  │  │  └─ page.tsx
│  │  │  └─ scan
│  │  │     └─ page.tsx
│  │  ├─ registration-detail
│  │  │  └─ page.tsx
│  │  ├─ route-checkpoints
│  │  │  └─ page.tsx
│  │  ├─ routes
│  │  │  └─ page.tsx
│  │  ├─ session-detail
│  │  │  └─ page.tsx
│  │  ├─ sign-in
│  │  │  └─ page.tsx
│  │  ├─ sign-up
│  │  │  └─ page.tsx
│  │  ├─ trek
│  │  │  └─ page.tsx
│  │  └─ trek-start
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ trekker
│  │  │  └─ TabLayout.tsx
│  │  └─ ui
│  │     ├─ CampsiteMap.tsx
│  │     ├─ CampsiteMapClient.tsx
│  │     ├─ PhaseConfig.ts
│  │     ├─ RouteMap.tsx
│  │     ├─ RouteMapClient.tsx
│  │     └─ WeatherCard.tsx
│  ├─ hooks
│  │  └─ useAuth.tsx
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ jwt.ts
│  │  ├─ prisma.ts
│  │  └─ utils.ts
│  └─ types
│     ├─ auth.ts
│     ├─ navigation-types.ts
│     ├─ trekking-types.ts
│     └─ weather-types.ts
└─ tsconfig.json

```
```
mapanuepe-trail
├─ AGENTS.md
├─ CLAUDE.md
├─ dev.db
├─ eslint.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20260816104549_init
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ scripts
│  ├─ migrate-to-sqlite.ts
│  ├─ test-db.ts
│  └─ test-sqlite.mjs
├─ src
│  ├─ app
│  │  ├─ api
│  │  │  ├─ auth
│  │  │  │  ├─ login
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ logout
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ profile
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ refresh
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ register
│  │  │  │     └─ route.ts
│  │  │  ├─ navigation
│  │  │  │  ├─ campsite
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [id]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ checkpoint
│  │  │  │  │  └─ [routeId]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ trekroute
│  │  │  │  │  ├─ detail
│  │  │  │  │  │  └─ [routeId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [campsiteId]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ vehicles
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ weather
│  │  │  │     └─ route.ts
│  │  │  ├─ tourism
│  │  │  │  ├─ my-registrations
│  │  │  │  │  ├─ history
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ ranger
│  │  │  │  │  ├─ dashboard
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ entry
│  │  │  │  │  │  └─ [trackingId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ exit
│  │  │  │  │  │  └─ [trackingId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ registrations
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ scan
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ register
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ registrations
│  │  │  │     └─ [permit]
│  │  │  │        ├─ qr
│  │  │  │        │  └─ route.ts
│  │  │  │        └─ route.ts
│  │  │  ├─ user
│  │  │  │  ├─ location
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ location-log
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [sessionId]
│  │  │  │  │     └─ route.ts
│  │  │  │  └─ trekking-session
│  │  │  │     ├─ route.ts
│  │  │  │     └─ [id]
│  │  │  │        └─ route.ts
│  │  │  └─ weather
│  │  │     └─ routes
│  │  │        └─ [routeId]
│  │  │           ├─ refresh
│  │  │           │  └─ route.ts
│  │  │           └─ route.ts
│  │  ├─ campsite-routes
│  │  │  └─ page.tsx
│  │  ├─ dashboard
│  │  │  └─ page.tsx
│  │  ├─ emergency
│  │  │  └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ home
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ my-registrations
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ profile
│  │  │  └─ page.tsx
│  │  ├─ ranger
│  │  │  ├─ dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ profile
│  │  │  │  └─ page.tsx
│  │  │  ├─ registrations
│  │  │  │  └─ page.tsx
│  │  │  └─ scan
│  │  │     └─ page.tsx
│  │  ├─ registration-detail
│  │  │  └─ page.tsx
│  │  ├─ route-checkpoints
│  │  │  └─ page.tsx
│  │  ├─ routes
│  │  │  └─ page.tsx
│  │  ├─ session-detail
│  │  │  └─ page.tsx
│  │  ├─ sign-in
│  │  │  └─ page.tsx
│  │  ├─ sign-up
│  │  │  └─ page.tsx
│  │  ├─ trek
│  │  │  └─ page.tsx
│  │  ├─ trek-start
│  │  │  └─ page.tsx
│  │  └─ vehicle-check
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ trekker
│  │  │  └─ TabLayout.tsx
│  │  └─ ui
│  │     ├─ CampsiteMap.tsx
│  │     ├─ CampsiteMapClient.tsx
│  │     ├─ PhaseConfig.ts
│  │     ├─ RouteMap.tsx
│  │     ├─ RouteMapClient.tsx
│  │     └─ WeatherCard.tsx
│  ├─ hooks
│  │  └─ useAuth.tsx
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ jwt.ts
│  │  ├─ prisma.ts
│  │  └─ utils.ts
│  └─ types
│     ├─ auth.ts
│     ├─ navigation-types.ts
│     ├─ trekking-types.ts
│     └─ weather-types.ts
└─ tsconfig.json

```
```
mapanuepe-trail
├─ AGENTS.md
├─ CLAUDE.md
├─ eslint.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20260816104549_init
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ scripts
│  ├─ migrate-to-sqlite.ts
│  ├─ test-db.ts
│  └─ test-sqlite.mjs
├─ src
│  ├─ app
│  │  ├─ api
│  │  │  ├─ auth
│  │  │  │  ├─ login
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ logout
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ profile
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ refresh
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ register
│  │  │  │     └─ route.ts
│  │  │  ├─ navigation
│  │  │  │  ├─ campsite
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [id]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ checkpoint
│  │  │  │  │  └─ [routeId]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ trekroute
│  │  │  │  │  ├─ detail
│  │  │  │  │  │  └─ [routeId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [campsiteId]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ vehicles
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ weather
│  │  │  │     └─ route.ts
│  │  │  ├─ tourism
│  │  │  │  ├─ my-registrations
│  │  │  │  │  ├─ history
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ ranger
│  │  │  │  │  ├─ dashboard
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ entry
│  │  │  │  │  │  └─ [trackingId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ exit
│  │  │  │  │  │  └─ [trackingId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ registrations
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ scan
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ register
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ registrations
│  │  │  │     └─ [permit]
│  │  │  │        ├─ qr
│  │  │  │        │  └─ route.ts
│  │  │  │        └─ route.ts
│  │  │  ├─ user
│  │  │  │  ├─ location
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ location-log
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [sessionId]
│  │  │  │  │     └─ route.ts
│  │  │  │  └─ trekking-session
│  │  │  │     ├─ route.ts
│  │  │  │     └─ [id]
│  │  │  │        └─ route.ts
│  │  │  └─ weather
│  │  │     └─ routes
│  │  │        └─ [routeId]
│  │  │           ├─ refresh
│  │  │           │  └─ route.ts
│  │  │           └─ route.ts
│  │  ├─ campsite-routes
│  │  │  └─ page.tsx
│  │  ├─ dashboard
│  │  │  └─ page.tsx
│  │  ├─ emergency
│  │  │  └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ home
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ my-registrations
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ profile
│  │  │  └─ page.tsx
│  │  ├─ ranger
│  │  │  ├─ dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ profile
│  │  │  │  └─ page.tsx
│  │  │  ├─ registrations
│  │  │  │  └─ page.tsx
│  │  │  └─ scan
│  │  │     └─ page.tsx
│  │  ├─ registration-detail
│  │  │  └─ page.tsx
│  │  ├─ route-checkpoints
│  │  │  └─ page.tsx
│  │  ├─ routes
│  │  │  └─ page.tsx
│  │  ├─ session-detail
│  │  │  └─ page.tsx
│  │  ├─ sign-in
│  │  │  └─ page.tsx
│  │  ├─ sign-up
│  │  │  └─ page.tsx
│  │  ├─ trek
│  │  │  └─ page.tsx
│  │  ├─ trek-start
│  │  │  └─ page.tsx
│  │  └─ vehicle-check
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ trekker
│  │  │  └─ TabLayout.tsx
│  │  └─ ui
│  │     ├─ CampsiteMap.tsx
│  │     ├─ CampsiteMapClient.tsx
│  │     ├─ PhaseConfig.ts
│  │     ├─ RouteMap.tsx
│  │     ├─ RouteMapClient.tsx
│  │     └─ WeatherCard.tsx
│  ├─ hooks
│  │  └─ useAuth.tsx
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ jwt.ts
│  │  ├─ prisma.ts
│  │  └─ utils.ts
│  └─ types
│     ├─ auth.ts
│     ├─ navigation-types.ts
│     ├─ trekking-types.ts
│     └─ weather-types.ts
└─ tsconfig.json

```
```
mapanuepe-trail
├─ AGENTS.md
├─ CLAUDE.md
├─ eslint.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20260816104549_init
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ scripts
│  ├─ migrate-to-sqlite.ts
│  ├─ test-db.ts
│  └─ test-sqlite.mjs
├─ src
│  ├─ app
│  │  ├─ api
│  │  │  ├─ auth
│  │  │  │  ├─ login
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ logout
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ profile
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ refresh
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ register
│  │  │  │     └─ route.ts
│  │  │  ├─ navigation
│  │  │  │  ├─ campsite
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [id]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ checkpoint
│  │  │  │  │  └─ [routeId]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ trekroute
│  │  │  │  │  ├─ detail
│  │  │  │  │  │  └─ [routeId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [campsiteId]
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ vehicles
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ weather
│  │  │  │     └─ route.ts
│  │  │  ├─ tourism
│  │  │  │  ├─ my-registrations
│  │  │  │  │  ├─ history
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ ranger
│  │  │  │  │  ├─ dashboard
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ entry
│  │  │  │  │  │  └─ [trackingId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ exit
│  │  │  │  │  │  └─ [trackingId]
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ registrations
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ scan
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ register
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ registrations
│  │  │  │     └─ [permit]
│  │  │  │        ├─ qr
│  │  │  │        │  └─ route.ts
│  │  │  │        └─ route.ts
│  │  │  ├─ user
│  │  │  │  ├─ location
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ location-log
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ [sessionId]
│  │  │  │  │     └─ route.ts
│  │  │  │  └─ trekking-session
│  │  │  │     ├─ route.ts
│  │  │  │     └─ [id]
│  │  │  │        └─ route.ts
│  │  │  └─ weather
│  │  │     └─ routes
│  │  │        └─ [routeId]
│  │  │           ├─ refresh
│  │  │           │  └─ route.ts
│  │  │           └─ route.ts
│  │  ├─ campsite-routes
│  │  │  └─ page.tsx
│  │  ├─ dashboard
│  │  │  └─ page.tsx
│  │  ├─ emergency
│  │  │  └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ home
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ my-registrations
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ profile
│  │  │  └─ page.tsx
│  │  ├─ ranger
│  │  │  ├─ dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ profile
│  │  │  │  └─ page.tsx
│  │  │  ├─ registrations
│  │  │  │  └─ page.tsx
│  │  │  └─ scan
│  │  │     └─ page.tsx
│  │  ├─ registration-detail
│  │  │  └─ page.tsx
│  │  ├─ route-checkpoints
│  │  │  └─ page.tsx
│  │  ├─ routes
│  │  │  └─ page.tsx
│  │  ├─ session-detail
│  │  │  └─ page.tsx
│  │  ├─ sign-in
│  │  │  └─ page.tsx
│  │  ├─ sign-up
│  │  │  └─ page.tsx
│  │  ├─ trek
│  │  │  └─ page.tsx
│  │  ├─ trek-start
│  │  │  └─ page.tsx
│  │  └─ vehicle-check
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ trekker
│  │  │  └─ TabLayout.tsx
│  │  └─ ui
│  │     ├─ CampsiteMap.tsx
│  │     ├─ CampsiteMapClient.tsx
│  │     ├─ PhaseConfig.ts
│  │     ├─ RouteMap.tsx
│  │     ├─ RouteMapClient.tsx
│  │     └─ WeatherCard.tsx
│  ├─ hooks
│  │  └─ useAuth.tsx
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ jwt.ts
│  │  ├─ prisma.ts
│  │  └─ utils.ts
│  └─ types
│     ├─ auth.ts
│     ├─ navigation-types.ts
│     ├─ trekking-types.ts
│     └─ weather-types.ts
└─ tsconfig.json

```