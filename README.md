# Unburdened - Anonymous Confessions App

A full-stack anonymous confessions application built with Next.js frontend and Node.js/Express backend, using Appwrite for authentication, database, and storage.

## Features

- 🔐 User authentication (register, login, logout)
- 📝 Anonymous confessions posting
- ❤️ Reaction system (hearts, wow, laugh)
- 🛡️ Content moderation (OpenAI + keyword fallback)
- 📁 File upload and storage
- 🎨 Modern dark theme UI
- 📱 Responsive design

## Tech Stack

### Frontend

- Next.js 14
- React 18
- Tailwind CSS
- FontAwesome icons
- Axios for API calls

### Backend

- Node.js
- Express.js
- Appwrite SDK
- SQLite (fallback database)
- Multer for file uploads

## Prerequisites

1. Node.js (v16 or higher)
2. Appwrite account and project
3. OpenAI API key (optional, for content moderation)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd Unburdened
```

### 2. Backend Setup

```bash
cd Unburdened/backend
npm install
```

Create a `.env` file in the backend directory:

```env
# Server configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Appwrite Configuration
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_PROJECT_NAME=Unburdened
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=unburdened
APPWRITE_POSTS_COLLECTION_ID=posts
APPWRITE_USERS_COLLECTION_ID=users
APPWRITE_COMMENTS_COLLECTION_ID=comments
APPWRITE_POST_LIKES_COLLECTION_ID=postLikes
APPWRITE_MEDIA_BUCKET_ID=media

# Optional: OpenAI API Key for content moderation
OPENAI_API_KEY=your_openai_api_key
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Appwrite Setup

1. Create an Appwrite project at [https://appwrite.io](https://appwrite.io)
2. Create a database with ID: `unburdened`
3. Create collections:
   - `posts` with attributes: content (String), userId (String), likes (Integer), commentsCount (Integer), mood (String), createdAt (String)
   - `users` with attributes: email (String), name (String), createdAt (String)
   - `comments` with attributes: postId (String), userId (String), content (String), parentId (String, optional), createdAt (String)
   - `postLikes` with attributes: postId (String), userId (String), createdAt (String) and a unique index on `postId` + `userId`
4. Create a storage bucket with ID: `media`
5. Set appropriate permissions for each collection and bucket
6. Get your API key and update the `.env` file

### 5. Run the Application

Start the backend server:

```bash
cd backend
npm run dev
```

Start the frontend development server:

```bash
cd frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify` - Verify session

### Posts

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `PUT /api/posts/:id/like` - Toggle like on a post
- `GET /api/posts/:id/comments` - Get comments for a post
- `POST /api/posts/:id/comments` - Add a comment (supports parent replies)

### Storage

- `POST /api/storage/upload` - Upload a file
- `GET /api/storage/download/:fileId` - Get file download URL
- `GET /api/storage/preview/:fileId` - Get file preview URL
- `DELETE /api/storage/:fileId` - Delete a file
- `GET /api/storage` - List files

### Moderation

- `POST /api/moderate` - Moderate content using OpenAI
- `POST /api/moderate/appwrite` - Moderate content using Appwrite Functions

## Project Structure

```
Unburdened/
├── backend/
│   ├── config/
│   │   └── appwrite.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── posts.js
│   │   ├── moderation.js
│   │   └── storage.js
│   ├── services/
│   │   ├── auth.js
│   │   ├── database.js
│   │   └── storage.js
│   ├── server.js
│   ├── db.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   ├── auth.js
│   │   │   ├── posts.js
│   │   │   └── moderation.js
│   │   ├── app/
│   │   │   ├── layout.js
│   │   │   ├── page.jsx
│   │   │   └── globals.css
│   │   └── components/
│   │       └── button.jsx
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
