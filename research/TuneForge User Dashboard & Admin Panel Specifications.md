# TuneForge User Dashboard & Admin Panel Specifications

## 1. Overview

*   **Purpose**: The user dashboard is the central hub for users to create, manage, and access their AI-generated music. It should be an intuitive and inspiring space that encourages creativity.
*   **Key Goals**:
    *   Provide a simple and clear interface for music generation.
    *   Allow users to easily manage their credit balance.
    *   Organize and provide access to the user's library of created songs.
    *   Offer a personalized and engaging experience.

---

## 2. Layout and Structure

*   **Main Layout**: A two-column layout. The left column will be a fixed sidebar for navigation, and the right column will be the main content area.
*   **Responsiveness**: The layout will be fully responsive. On mobile devices, the sidebar will collapse into a hamburger menu.

## 3. Left Sidebar (Navigation)

*   **Components**:
    *   **Logo**: The TuneForge logo at the top.
    *   **Navigation Links**: Icons and text for "Create Music", "My Library", "Buy Credits", and "Settings".
    *   **User Profile**: At the bottom, showing the user's avatar, name, and a logout button.
*   **Visual Style**:
    *   Uses the dark neutral color palette.
    *   The active link will be highlighted with a primary color.

## 4. Main Content Area: Create Music

*   **Purpose**: This is the default view of the dashboard, where users will spend most of their time. It's designed to make music creation a simple, three-step process.

### 4.1. Step 1: Describe Your Song

*   **UI Components**:
    *   **Prompt Input (Textarea)**: A large textarea for the user to describe the song they want to create. Placeholder text will guide them (e.g., "A dreamy pop song about summer love with a female vocalist...").
    *   **Genre/Mood Tags**: A multi-select dropdown or tag input field for the user to add specific genres (e.g., "Pop", "Rock", "Electronic") and moods (e.g., "Happy", "Sad", "Epic").
    *   **Instrumental Toggle**: A switch to choose between a song with vocals or an instrumental track.

### 4.2. Step 2: Choose Your Style (Optional)

*   **UI Components**:
    *   **Style Selection**: A grid of cards, each representing a different musical style (e.g., "80s Synthwave", "Modern Hip-Hop", "Cinematic Score"). This allows for more directed generation.
    *   **"Surprise Me" Button**: For users who want the AI to choose a style for them.

### 4.3. Step 3: Generate!

*   **UI Components**:
    *   **Generate Button**: A prominent button that initiates the music generation process. It will be disabled until the user has entered a prompt.
    *   **Credit Counter**: A small text element near the generate button that shows the user's remaining credits and how many will be used for this generation (e.g., "10 Credits / 1 Song").
    *   **Loading State**: After clicking "Generate", the content area will show a loading animation with an encouraging message (e.g., "Your masterpiece is being composed...").

## 5. Main Content Area: My Library

*   **Purpose**: To display all the songs the user has created.
*   **UI Components**:
    *   **Song List**: A table or a grid of cards, each representing a song.
    *   **Each Song Item will display**:
        *   Song Title
        *   Genre/Mood
        *   Creation Date
        *   A Play Button
        *   A Download Button
        *   A "More Options" menu (for actions like "Delete", "View Details", "Remix").
    *   **Search and Filter**: A search bar to find songs by title and filter options for genre and date.

## 6. Main Content Area: Buy Credits

*   **Purpose**: A simple and secure page for users to purchase more credits.
*   **UI Components**:
    *   **Credit Pack Options**: Cards displaying different credit packs (e.g., "100 Credits for $20", "500 Credits for $90").
    *   **Stripe Integration**: A secure payment form powered by Stripe.

## 7. Main Content Area: Settings

*   **Purpose**: To allow users to manage their account information.
*   **UI Components**:
    *   **Profile Settings**: Fields to update their name and profile picture.
    *   **Password Change**: A form to change their password.
    *   **Notification Preferences**: Checkboxes to opt-in or out of email notifications.

## 8. Admin Panel Specification

## 8.1. Overview

*   **Purpose**: The admin panel is the control center for the business owner to manage users, monitor platform activity, and view key business metrics.
*   **Access**: The admin panel will be accessible through a separate, secure login.

## 8.2. Dashboard (Default View)

*   **UI Components**:
    *   **Key Metrics**: A series of cards at the top displaying: Total Revenue, Monthly Recurring Revenue (MRR), New Users (last 30 days), and Total Songs Generated.
    *   **Charts and Graphs**:
        *   A line chart showing revenue over time.
        *   A bar chart showing new user sign-ups per month.
        *   A pie chart showing the most popular genres.

## 8.3. User Management

*   **UI Components**:
    *   **User Table**: A searchable and sortable table of all registered users.
    *   **Columns**: User ID, Name, Email, Sign-up Date, Total Spent, and Number of Songs Generated.
    *   **Actions**: For each user, there will be options to "View Details", "Edit", "Suspend", or "Delete".

## 8.4. Song Management

*   **UI Components**:
    *   **Song Table**: A searchable and sortable table of all generated songs.
    *   **Columns**: Song ID, Title, User, Creation Date, and Genre.
    *   **Actions**: For each song, there will be options to "Listen", "View Details", or "Delete".

## 8.5. Content Management

*   **Purpose**: To manage the content of the landing page (e.g., testimonials, blog posts) without needing to touch the code.
*   **UI Components**: Simple forms to add, edit, or delete testimonials and blog posts.

## 8.6. Settings

*   **UI Components**:
    *   **API Key Management**: A section to update the Suno API key.
    *   **Pricing Management**: A form to adjust the price per song and the credit pack options.

