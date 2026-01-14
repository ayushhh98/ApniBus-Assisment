# Smart Issue Board

A robust, real-time issue tracking application built with React, Vite, and Firebase. This project was developed as part of an internship assignment to demonstrate problem-solving skills and full-stack capabilities using serverless architecture.

## 🚀 Why This Stack?

I chose the **React + Vite + Tailwind CSS** stack for the frontend and **Firebase** for the backend for several key reasons:

*   **Vite**: For its lightning-fast HMR (Hot Module Replacement) and optimized build performance, which significantly speeds up development compared to CRA.
*   **React**: Leveraged its component-based architecture to build reusable UI elements like the `IssueCard` and `CreateIssueModal`. The ecosystem also provides excellent libraries like `react-hot-toast` for notifications and `lucide-react` for consistent iconography.
*   **Tailwind CSS**: Enabled rapid UI development with utility-first classes, allowing for a polished, responsive, and "premium" feel (gradients, glassmorphism) without writing custom CSS files.
*   **Firebase**: Specifically chosen for its seamless integration of Authentication and Firestore. The real-time capabilities of Firestore (`onSnapshot`) made the live updates on the dashboard trivial to implement without complex WebSocket setups.

## 🗄️ Firestore Data Structure

The application uses a normalized NoSQL structure to ensure scalability and ease of querying.

### 1. `users` Collection
Stores user profile information.
```json
{
  "userId": "uid_string",
  "email": "user@example.com",
  "name": "username",
  "createdAt": "timestamp"
}
```

### 2. `issues` Collection
The core duplicate logic led to the inclusion of a `keywords` array to optimize search.
```json
{
  "id": "auto_generated_id",
  "title": "Fix login bug",
  "description": "Login fails when...",
  "status": "Open", // | "In Progress" | "Done"
  "priority": "High", // | "Medium" | "Low"
  "assignedTo": "dev@example.com", // Nullable
  "createdBy": "manager@example.com",
  "createdAt": "serverTimestamp",
  "keywords": ["fix", "login", "bug"] // Used for similarity search
}
```

## 🧠 Handling Similar Issues

One of the core challenges was intelligently handling similar issues. I implemented a two-step approach:

1.  **Keyword Generation**: When a user types a title, I extract meaningful keywords (filtering out short words) and store them in the `keywords` field.
2.  **Jaccard Similarity Check**: Before creation, the app queries the database for issues containing any of these keywords. It then calculates the **Jaccard Similarity Coefficient** between the new title and existing titles.
    *   If similarity > 40%, a "Similar Issues Found" warning is displayed.
    *   The user is shown the potential duplicates and can choose to either edit their current draft or "Submit Anyway".

This approach strikes a balance between performance (using Firestore array-contains indices) and accuracy (client-side string comparison).

## ⚠️ Challenges & Decisions

1.  **Duplicate Detection in NoSQL**: Firestore doesn't support full-text search natively. I had to design the `keywords` array approach to make the search efficient without needing an external service like Algolia, keeping the architecture simple.
2.  **State Management**: Deciding between Redux and Context API. I opted for **Context API** (`AuthContext`) for authentication as it was sufficient for this scale, avoiding the boilerplate of Redux.
3.  **UI Polish**: The requirement for "street-smart decisions" led me to prioritize a high-quality UI (animations, empty states) to show that functional apps can also be beautiful.

## 🚀 Improvements

If given more time, I would:

1.  **Add Comments**: Allow users to discuss specific issues.
2.  **Drag & Drop**: Implement a Kanban board view (Trello-style) for changing status.
3.  **Algolia Integration**: meaningful full-text search for better duplicate detection.
4.  **Role-Based Access**: Restrict "Delete" or "Assign" actions to admins/managers.

