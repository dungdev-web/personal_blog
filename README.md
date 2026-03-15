# 🚀 Personal Blog Starter

[![GitHub license](https://img.shields.io/badge/license-Unlicensed-blue.svg)](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
[![GitHub stars](https://img.shields.io/github/stars/dungdev-web/personal_blog.svg?style=social)](https://github.com/dungdev-web/personal_blog/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/dungdev-web/personal_blog.svg?style=social)](https://github.com/dungdev-web/personal_blog/network/members)
[![GitHub issues](https://img.shields.io/github/issues/dungdev-web/personal_blog.svg)](https://github.com/dungdev-web/personal_blog/issues)
[![JavaScript](https://img.shields.io/badge/language-JavaScript-F7DF1E.svg?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A modern, fast, and highly customizable personal blog application built with React, Vite, Tailwind CSS, and Firebase. Perfect for developers, writers, and anyone looking to share their thoughts and knowledge online with a sleek, self-hosted solution.

---

## 🌟 Live Demo

Experience the blog in action!
[https://personal-blog-three-orpin.vercel.app](https://personal-blog-three-orpin.vercel.app)

---

## ✨ Features

This project offers a robust foundation for your personal blog, packed with modern web technologies:

*   **⚡️ Blazing Fast Development**: Powered by [Vite](https://vitejs.dev/), ensuring quick refresh times and optimized builds.
*   **⚛️ Modern Frontend**: Built with [React 19](https://react.dev/), providing a component-based architecture for a scalable and maintainable UI.
*   **🎨 Beautiful Styling**: Utilizes [Tailwind CSS](https://tailwindcss.com/) for utility-first styling, making it easy to create responsive and visually appealing designs.
*   **🔥 Backend as a Service**: Integrates with [Firebase](https://firebase.google.com/) (Firestore) for seamless data storage and management of posts and categories.
*   **✍️ Markdown Support**: Render your blog posts beautifully with Markdown, allowing for rich content creation.
*   **🔗 Dynamic Routing**: Seamless client-side navigation using [React Router DOM v7](https://reactrouter.com/en/main).
*   **🧩 Modular Components**: Well-organized `src/components`, `src/pages`, `src/layouts`, and `src/hooks` for better code structure and reusability.
*   **💡 Custom Hooks**: Efficient data fetching and state management with custom React hooks (`usePosts`, `useCategories`).
*   **📱 Responsive Design**: Adapts beautifully to various screen sizes, from desktops to mobile devices.
*   **🚀 Easy Deployment**: Optimized for deployment on platforms like Vercel, Netlify, or your preferred hosting.

---

## 📚 Table of Contents

*   [🌟 Live Demo](#-live-demo)
*   [✨ Features](#-features)
*   [📚 Table of Contents](#-table-of-contents)
*   [📦 Installation](#-installation)
    *   [Prerequisites](#prerequisites)
    *   [Clone the Repository](#clone-the-repository)
    *   [Install Dependencies](#install-dependencies)
    *   [Firebase Setup](#firebase-setup)
*   [🛠️ Usage](#️-usage)
    *   [Development Server](#development-server)
    *   [Building for Production](#building-for-production)
    *   [Adding Blog Content](#adding-blog-content)
*   [⚙️ Configuration](#️-configuration)
*   [📖 API/Data Structure](#-apidata-structure)
    *   [Firebase Integration](#firebase-integration)
    *   [Data Models](#data-models)
*   [🤝 Contributing](#-contributing)
*   [📄 License](#-license)
*   [🙏 Acknowledgments](#-acknowledgments)

---

## 📦 Installation

Follow these steps to get your personal blog up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: [LTS version recommended](https://nodejs.org/en/download/)
*   **npm** or **Yarn**: npm comes with Node.js, or you can install Yarn globally (`npm install -g yarn`).

### Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/dungdev-web/personal_blog.git
cd personal_blog/personal-blog # Navigate into the project subdirectory
```

> [!TIP]
> The project files are nested within a `personal-blog` directory inside the repository. Make sure to `cd` into it!

### Install Dependencies

Install the necessary npm packages:

```bash
npm install
# OR
yarn install
```

### Firebase Setup

This project uses Firebase Firestore as its backend. You'll need to set up your own Firebase project:

1.  **Create a Firebase Project**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Click "Add project" and follow the steps to create a new project.

2.  **Register Your App**:
    *   In your Firebase project, click the "Web" icon (`</>`) to add a web app.
    *   Follow the setup instructions. You'll receive your Firebase configuration object.

3.  **Enable Firestore Database**:
    *   In the Firebase Console, navigate to "Build" > "Firestore Database".
    *   Click "Create database". Choose "Start in production mode" (you can adjust security rules later) and select a location.

4.  **Configure Firebase in Your Project**:
    *   Open `personal-blog/src/firebase/firebase.js`.
    *   Replace the placeholder configuration with your actual Firebase config from step 2.

    ```javascript
    // src/firebase/firebase.js
    import { initializeApp } from "firebase/app";
    import { getFirestore } from "firebase/firestore";

    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    export { db };
    ```
    > [!WARNING]
    > For production environments, it's highly recommended to use environment variables (e.g., `.env` file) to store your Firebase configuration instead of hardcoding it directly in the source code. Vite supports `.env` files out of the box (e.g., `VITE_FIREBASE_API_KEY`).

5.  **Set Firestore Security Rules**:
    *   For public read access (which is typical for a blog), you'll need to adjust your Firestore security rules.
    *   In the Firebase Console, go to "Firestore Database" > "Rules".
    *   Replace the default rules with something like this to allow public read access to `posts` and `categories` collections:

    ```firestore
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read: if true; // Allows anyone to read all documents
          // allow write: if request.auth != null; // Only authenticated users can write
          allow write: if false; // Deny all writes by default for a read-only blog
        }

        // More granular rules if you have specific needs
        // match /posts/{postId} {
        //   allow read: if true;
        //   allow write: if false; // Or 'if request.auth != null;' for admin
        // }
        // match /categories/{categoryId} {
        //   allow read: if true;
        //   allow write: if false;
        // }
      }
    }
    ```
    > [!CAUTION]
    > `allow read: if true;` means anyone can read your entire database. Ensure this is acceptable for your blog content. For writing, you would typically require authentication.

---

## 🛠️ Usage

### Development Server

To run the project in development mode with live reloading:

```bash
npm run dev
# OR
yarn dev
```

The application will typically be available at `http://localhost:5173`.

### Building for Production

To create an optimized production build of the application:

```bash
npm run build
# OR
yarn build
```

This will generate a `dist` directory containing all the static files ready for deployment.

### Adding Blog Content

Since this project doesn't include an explicit admin panel in the provided file structure, content (posts and categories) is expected to be managed directly through the Firebase Firestore Console:

1.  **Access Firestore Console**: Go to your [Firebase Console](https://console.firebase.google.com/) and navigate to "Firestore Database".
2.  **Create `posts` Collection**:
    *   Click "Start collection" and name it `posts`.
    *   Add documents for each blog post. Each document should ideally have the following fields:
        *   `title` (string): The title of your post.
        *   `slug` (string): A URL-friendly identifier for the post (e.g., `my-first-post`).
        *   `content` (string): The full content of your blog post in Markdown format.
        *   `category` (string): The category ID or name (should match a document in the `categories` collection).
        *   `date` (timestamp): The publication date.
        *   `author` (string, optional): The author's name.
        *   `imageUrl` (string, optional): URL for a featured image.
3.  **Create `categories` Collection**:
    *   Click "Start collection" and name it `categories`.
    *   Add documents for each category. Each document should have:
        *   `name` (string): The display name of the category (e.g., "Web Development").
        *   `slug` (string): A URL-friendly identifier (e.g., `web-dev`).

> [!NOTE]
> The exact field names used in the application's `usePosts` and `useCategories` hooks will determine what data is displayed. Refer to `src/hooks/usePosts.js` and `src/hooks/useCategories.js` for the expected data structure.

---

## ⚙️ Configuration

The main configuration for the project is handled in the following files:

*   **`vite.config.js`**: Vite-specific configurations, including React plugin settings.
*   **`tailwind.config.js`**: Tailwind CSS configuration for customizing themes, colors, and plugins.
*   **`src/firebase/firebase.js`
