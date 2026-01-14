# Firestore Data Model – Smart Issue Board

## 1. High-Level Structure
We use two main Firestore collections: `users` for basic user info and `issues` to store all issue data including priority, status, assignment, and keywords. This simple structure supports filtering, sorting, and smart duplicate detection while remaining easy to scale.

## 2. Diagram
```
Firestore
│
├── users
│     └── {userId} (profile info)
│
└── issues
      └── {issueId} (tasks/tickets)
```

## 3. Collections

### Collection: `users`
Stores basic user profile info.
*   **userId** (string): Firebase Auth UID
*   **email** (string): User email
*   **name** (string): User display name (optional)
*   **createdAt** (timestamp): Account creation time

### Collection: `issues`
Stores all issues and tickets.
*   **issueId** (auto-id): Unique document ID
*   **title** (string): Main issue label (e.g., "Login page error")
*   **description** (string): Details about the issue
*   **priority** (string): Low / Medium / High
*   **status** (string): Open / In Progress / Done
*   **assignedTo** (string): Email of the assignee
*   **createdBy** (string): Email of the reporter
*   **createdAt** (timestamp): Server timestamp
*   **keywords** (array): `["login", "submit", "error"]` - Used for smart duplicate detection

## 4. Smart Similarity Detection
When creating a new issue:
1.  System breaks down the **title** into **keywords**.
2.  *Example*: "Login button not working" → `["login", "button", "working"]`
3.  Queries Firestore: `where("keywords", "array-contains-any", newKeywords)`
4.  If matches are found, a warning is displayed to the user.
