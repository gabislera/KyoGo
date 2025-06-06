# Gym Management Frontend

A modern, responsive frontend application for the Gym Management System built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Dark Theme**: Beautiful dark theme optimized for all screen sizes
- **Role-Based Access Control**: Different features for Admin and Member users
- **Responsive Design**: Fully responsive design that works on mobile and desktop
- **Authentication**: JWT-based authentication with automatic token refresh
- **Gym Management**: Search and find nearby gyms
- **Check-in System**: Location-based check-ins with validation
- **Admin Features**: Create gyms and validate check-ins (Admin only)

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running API server (from the api-solid project)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd gym-frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment file:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

4. Update the API URL in `.env.local`:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3333
\`\`\`

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
gym-frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Protected dashboard pages
│   ├── login/            # Authentication pages
│   ├── register/         
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
│   ├── ui/              # shadcn/ui components
│   ├── auth-provider.tsx
│   ├── header.tsx
│   └── sidebar.tsx
├── hooks/               # Custom React hooks
├── lib/                # Utility functions
└── public/             # Static assets
\`\`\`

## User Roles

### Member Users
- View and search gyms
- Find nearby gyms using geolocation
- Check in at gyms (location verified)
- View check-in history
- View personal metrics

### Admin Users
- All member features
- Create new gyms
- Validate member check-ins
- Access to admin dashboard

## API Integration

The frontend integrates with all API endpoints:

- **Authentication**: `/users`, `/sessions`, `/token/refresh`, `/me`
- **Gyms**: `/gyms/search`, `/gyms/nearby`, `/gyms` (POST)
- **Check-ins**: `/gyms/:id/check-ins`, `/check-ins/history`, `/check-ins/metrics`, `/check-ins/:id/validate`

## Features

### Authentication
- User registration and login
- JWT token management with automatic refresh
- Protected routes with role-based access

### Gym Management
- Search gyms by name with pagination
- Find nearby gyms using geolocation
- Responsive gym cards with detailed information

### Check-in System
- Location-based check-ins with GPS verification
- Real-time location validation
- Check-in history with pagination
- Admin validation of check-ins

### Responsive Design
- Mobile-first design approach
- Collapsible sidebar for mobile
- Touch-friendly interface
- Optimized for all screen sizes

## Environment Variables

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3333  # API server URL
\`\`\`

## Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
