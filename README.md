# SocialHub

A full-stack social media web app where users can share posts, follow each other, and chat in real time.

**Live demo:** https://socialhub-v2-seven.vercel.app

![SocialHub screenshot](./screenshots/home.png)

## Features

- **Authentication:** sign up and sign in with form validation, plus protected routes
- **Posts:** create posts, like, comment, and save posts for later
- **Followers:** follow and unfollow users, with follower and following counts
- **Real-time chat:** 1-on-1 and group conversations with live message delivery
- **Image sharing:** send images in chat (stored in Supabase Storage)
- **Notifications:** unread message counts and in-app toast notifications
- **Responsive UI:** works on mobile and desktop

## Tech Stack

| Area | Technology |
|------|------------|
| Frontend | React, Vite, React Router, Material UI, Tailwind CSS |
| Forms | React Hook Form, Zod |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| Security | Row Level Security (RLS) policies |
| Hosting | Vercel |

## Getting Started

1. Clone the repo:
```
   git clone https://github.com/Saber-2006/SocialHub.git
   cd SocialHub
```
2. Install dependencies:
```
   npm install
```
3. Create a `.env` file in the project root:
```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
4. Set up the database: in your Supabase dashboard, open the SQL Editor and run `supabase_schema.sql`.
5. Start the dev server:
```
   npm run dev
```

## What I Learned

- Designing a relational database for a social app (profiles, posts, follows, conversations)
- Writing Row Level Security policies, including fixing recursive policy errors with a `security definer` function
- Building real-time features with Supabase `postgres_changes` subscriptions
- Deploying a Vite + React app to Vercel and managing environment variables

## Author

**Moustafa** — Frontend developer, student at  National University of Science and Technology Politehnica Bucharest 
GitHub: [@Saber-2006](https://github.com/Saber-2006)