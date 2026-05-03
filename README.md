# AI Election Assistant

## Live Demo
Deployed on Google Cloud Run: [Insert Link Here]

## Overview
The AI Election Assistant is a state-of-the-art, interactive web application designed to help citizens understand the election process, voting timelines, and their civic duties. Built with a focus on neutrality, accuracy, and accessibility, this assistant leverages the power of Google Services to provide real-time, context-aware guidance in a premium, highly responsive user interface.

## Vertical
**Civic Engagement & Government Accessibility**
Our goal is to demystify the electoral process. Elections involve complex dates, legal jargon, and multi-step registration processes which can be overwhelming. By providing a natural language interface, we make civic participation easier and more accessible for everyone.

## Approach & Logic
1. **Frontend Architecture:** Built using Next.js (App Router) for server-side rendering benefits, fast load times, and SEO. The UI uses pure, vanilla CSS modules with modern design principles (glassmorphism, micro-animations, accessible high-contrast colors) to ensure a premium look without heavy styling frameworks.
2. **AI Integration:** The core logic runs on the `@google/genai` SDK, securely connected through Next.js serverless API routes. 
3. **Contextual Awareness:** The assistant maintains chat history in the local state, allowing it to provide conversational, contextual responses (e.g., answering "What's the next step after that?").
4. **Deployment Strategy:** Containerized using Docker to ensure environment consistency and deployed to Google Cloud Run for scalable, secure, and highly available hosting.

## How It Works
- The user accesses the web application and is greeted by the AI Assistant.
- The user can type questions like "How do I register to vote?", "When is the next local election?", or "What are the requirements for mail-in voting?".
- The frontend sends the conversation history to the `/api/chat` route.
- The backend securely formats the prompt, injecting a strong system directive (ensuring neutrality and accuracy), and queries the Google Gemini API.
- The AI's response is streamed or returned to the client and rendered using `react-markdown` for clear, readable formatting (bullet points, bold text).

## Assumptions Made
- The user has access to a modern web browser.
- The model's knowledge cutoff is sufficient for general election processes (for real-time live election dates, a future enhancement would involve RAG with live official APIs).
- The assistant operates in a general, non-partisan capacity and does not require user authentication for MVP functionality.

## Tech Stack
- **Framework:** Next.js (TypeScript, React)
- **Styling:** Vanilla CSS Modules
- **AI/Backend:** Google Gemini 2.5 Flash API (`@google/genai`)
- **Deployment:** Google Cloud Run, Docker

## Setup Locally
1. Clone the repository.
2. Install dependencies: \`npm install\`
3. Create a \`.env.local\` file and add your Google Gemini API key: \`GEMINI_API_KEY=your_key_here\`
4. Run the development server: \`npm run dev\`
5. Open \`http://localhost:3000\`

## Evaluation Criteria Addressed
- **Code Quality:** Modular React components, TypeScript for type safety, clear separation of frontend and API routes.
- **Security:** API keys remain strictly on the server-side; no sensitive keys are exposed to the client.
- **Efficiency:** Next.js standalone output and Docker multi-stage builds ensure minimal container size and fast startup on Cloud Run.
- **Accessibility:** Semantic HTML, ARIA-friendly structures, and readable contrast ratios.
- **Google Services:** Deep integration with Google Gemini via the official SDK and Google Cloud Run.
