# NoteGreen

NoteGreen is a web-based note-taking application with rich text editing, custom tags, and folder organization capabilities.

## Features

- Rich text editor for note creation and editing
- Organization of notes in custom folders
- Tagging system with color-coded tags
- Mobile-friendly responsive design
- Dark-themed interface optimized for readability
- PostgreSQL database for persistent storage

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI components
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: React Query, Zustand
- **Routing**: Wouter

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- PostgreSQL database

### Installation

1. Clone the repository
   ```
   git clone https://github.com/rohithmohanan1/NoteGreen.git
   cd NoteGreen
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file with the following variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   ```

4. Push database schema
   ```
   npm run db:push
   ```

5. Start the development server
   ```
   npm run dev
   ```

## Usage

- Create notes using the + button on the home screen
- Organize notes into folders
- Add tags to categorize your notes
- Edit notes with the rich text editor
- Delete notes when no longer needed

## Contributing

Contributions are welcome! Feel free to open issues and submit pull requests.

## License

This project is licensed under the MIT License.