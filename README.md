# Postr - Full Stack Application

A full-stack application with React frontend and Express backend.

## Deployment to Render

This project is set up for easy deployment to Render with a render.yaml configuration file.

### Prerequisites

1. A Render account (https://render.com)
2. MongoDB Atlas database
3. Clerk API keys for authentication
4. Gemini API key for AI features

### Deployment Steps

1. **Fork or clone this repository**

2. **Connect to Render**
   - Go to your Render dashboard
   - Click "New" → "Blueprint"
   - Connect your repository
   - Render will automatically detect the render.yaml configuration

3. **Set Environment Variables**
   You will need to set the following secret environment variables in Render:
   
   For backend:
   - `MONGO`: Your MongoDB connection URI
   - `CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `CLERK_SECRET_KEY`: Your Clerk secret key
   
   For frontend:
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `VITE_GEMINI_PUBLIC_KEY`: Your Gemini API key

4. **Deploy the Blueprint**
   - Render will automatically create both the backend and frontend services
   - It will configure the necessary environment variables between services

5. **Check Deployment**
   - Monitor the deployment logs for any errors
   - Once both services are deployed, you can access your application

## Local Development

1. Clone the repository
2. Create .env files in both frontEnd and backEnd directories based on the .env.example files
3. Run `npm install` in both directories
4. Start the backend with `npm start` in the backEnd directory
5. Start the frontend with `npm run dev` in the frontEnd directory 