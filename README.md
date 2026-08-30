# BlogHaven

A server-rendered blogging platform built with Express, EJS, and MongoDB. Registered users can browse blog posts, search them, comment, like/dislike, and manage their own profile.

## Features

- **Authentication** — session-based login/registration with bcrypt-hashed passwords
- **Blog feed** — dashboard listing posts with search-by-title and lazy-loaded pagination
- **Blog detail page** — full post view with comments and like/dislike counts
- **Comments** — post comments with basic validation, spam-word filtering, and per-user rate limiting
- **Likes/dislikes** — one like or dislike per user per post, with running counts on each blog
- **Image uploads** — blog cover images uploaded via Multer and served from `public/uploads`
- **User settings** — edit profile details (name, date of birth, phone, email, address)

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Web framework | Express 5 |
| Templating | EJS |
| Database | MongoDB via Mongoose 9 |
| Auth | express-session, bcrypt |
| File uploads | Multer |
| Dates | Moment.js |
| Dev tooling | nodemon, dotenv |

## Project Structure

```
server.js              Express app setup, session/middleware config, top-level routes
routes/
  register.js           Sign-up (GET/POST /register)
  library.js             Dashboard, search, comments, likes/dislikes (mounted at /)
  blogPage.js            Single blog view + lazy-load API (mounted at /blogs)
  settings.js            Profile view/update (mounted at /settings)
model/
  aspirants.js            User schema (registered users)
  blogs.js                Blog post schema
  blogComments.js         Comment schema
  blogLikes.js            Like/dislike schema
views/                  EJS templates (login, register, dashboard, blog, settings, partials)
public/
  CSS, JS                Static styles and client-side scripts
  resourceDirectory        Logos/branding assets
  uploads/blog images       User-uploaded blog cover images
```

## Prerequisites

- Node.js >= 20.19
- A running MongoDB instance (local or hosted)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the project root:
   ```bash
   DATABASE_URL="mongodb://localhost/platformdb"
   SESSION_SECRET="a-long-random-string"
   NODE_ENV="development"
   PORT=3000
   ```
   `SESSION_SECRET` falls back to a default in code if omitted, but a real secret should always be set outside local development. `PORT` defaults to `3000` if unset.
3. Start the app:
   ```bash
   npm start        # node server.js
   npm run devStart # nodemon server.js, auto-restarts on file changes
   ```
4. Visit `http://localhost:3000/register` to create an account, then log in at `/login`.

## Routes Overview

| Method | Path | Description |
|---|---|---|
| GET | `/login` | Login page |
| POST | `/users` | Authenticate credentials |
| GET/POST | `/register` | Registration page / create account |
| GET | `/` | Dashboard (blog list) — requires auth |
| POST | `/search` | Search blogs by title |
| POST | `/postComment` | Comment on a blog |
| POST | `/likeBlog` / `/dislikeBlog` | Like or dislike a blog |
| GET | `/blogs?id=<id>` | View a single blog post |
| GET | `/blogs/api/more-blogs` | Lazy-load additional blog cards |
| POST | `/blog-create` | Create a blog post (with image upload) |
| GET/POST | `/settings` | View/update the logged-in user's profile |
| DELETE | `/logout` | End the session |

## Notes

- Authentication is a custom cookie-session guard (`isAuthenticated`/`isNotAuthenticated` in `server.js`), not a library like Passport.
- Uploaded blog images are stored on local disk under `public/uploads/blog images` and are git-ignored.
