# ModSquad - Car Enthusiast Platform

ModSquad is a modern web platform for car enthusiasts to share their builds, connect with other modders, and showcase their automotive passion.

## Features

- 🚗 Vehicle Build Management
- 👥 User Profiles & Authentication
- 📸 Image Upload & Gallery
- 💬 Community Interaction
- 🔧 Build Modification Tracking
- 👑 Admin Dashboard

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **File Storage**: Local (configurable for cloud storage)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/modsquad.git
   cd modsquad
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/modsquad"
   JWT_SECRET="your-secret-key"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Start the development server:
   ```bash
   # Start frontend
   npm run dev

   # Start backend (in a new terminal)
   npm run server

   # Or start both concurrently
   npm run dev:all
   ```

## Development

- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:5001

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/modsquad](https://github.com/yourusername/modsquad)
