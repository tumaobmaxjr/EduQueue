# EduQueue - Queue Management System

A modern queue management system designed for Visayas State University. Built with React + TypeScript frontend and .NET 10.0 backend.

## Features

- **Multi-step Kiosk Wizard** - Easy ticket generation for students
- **Officer Dashboard** - Real-time queue management with call next, complete, no-show, and transfer actions
- **Admin Panel** - Analytics with Recharts, window/purpose configuration, and ticket log
- **Now Serving Display** - Full-screen board for waiting area monitors
- **Priority Queue** - PWD, pregnant, and senior citizens get served first
- **Responsive Design** - Works on mobile, tablet, and desktop

## Tech Stack

### Frontend
- React 18 with TypeScript
- MUI v7 (Material UI)
- TanStack Query for data fetching
- Zustand for state management
- React Hook Form + Zod for validation
- Recharts for analytics
- Vite for build tooling

### Backend
- .NET 10.0 Web API
- Entity Framework Core
- SQL Server LocalDB

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- .NET 10.0 SDK
- SQL Server LocalDB

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/EduQueue.git
   cd EduQueue
   ```

2. **Setup Backend**
   ```bash
   cd backend
   
   # Restore packages
   dotnet restore
   
   # Apply database migrations
   dotnet ef database update
   
   # Run the backend (default: http://localhost:5000)
   dotnet run
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Run development server (default: http://localhost:5173)
   npm run dev
   ```

## Project Structure

```
EduQueue/
├── backend/                    # .NET Web API
│   ├── Controllers/           # API endpoints
│   ├── Data/                  # EF Core DbContext
│   ├── Models/                # Entity models
│   └── Program.cs             # App entry point
│
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── api/              # API client & TanStack Query hooks
│   │   ├── components/       # Reusable components
│   │   │   ├── admin/       # Admin page components
│   │   │   ├── kiosk/       # Kiosk wizard components
│   │   │   ├── officer/     # Officer dashboard components
│   │   │   └── shared/      # Shared UI components
│   │   ├── layouts/         # Page layouts
│   │   ├── pages/           # Route pages
│   │   ├── stores/          # Zustand stores
│   │   ├── theme.ts         # MUI theme configuration
│   │   └── main.tsx         # App entry point
│   └── vite.config.ts       # Vite configuration
│
└── ERD.md                    # Entity Relationship Diagram
```

## Available Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Kiosk - Student ticket generation | Public |
| `/login` | Role-based login | Public |
| `/admin` | Admin dashboard with analytics | Admin only |
| `/officer` | Officer queue management | Officer only |
| `/display` | Now Serving board | Public |

## API Endpoints

### Tickets
- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/{id}` - Get ticket by ID
- `GET /api/tickets/window/{windowId}` - Get tickets by window
- `GET /api/tickets/preview/{windowId}` - Get queue preview
- `POST /api/tickets` - Create new ticket
- `POST /api/tickets/{id}/call` - Call ticket
- `POST /api/tickets/{id}/complete` - Complete ticket
- `POST /api/tickets/{id}/noshow` - Mark as no-show
- `POST /api/tickets/{id}/transfer` - Transfer ticket

### Windows
- `GET /api/windows` - Get all windows
- `GET /api/windows/active` - Get active windows
- `GET /api/windows/{id}` - Get window by ID
- `POST /api/windows` - Create window
- `PUT /api/windows/{id}` - Update window
- `DELETE /api/windows/{id}` - Delete window

### Purposes
- `GET /api/purposes` - Get all purposes
- `GET /api/purposes/window/{windowId}` - Get purposes by window
- `GET /api/purposes/{id}` - Get purpose by ID
- `POST /api/purposes` - Create purpose
- `PUT /api/purposes/{id}` - Update purpose
- `DELETE /api/purposes/{id}` - Delete purpose

## Environment Variables

### Frontend
The frontend connects to the backend API at `http://localhost:5000` by default. To change this, update `frontend/src/api/client.ts`.

### Backend
Database connection string is configured in `backend/appsettings.json`.

## Development

### Frontend Commands
```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Backend Commands
```bash
dotnet run                    # Start API server
dotnet watch                  # Start with hot reload
dotnet ef migrations add X    # Add migration
dotnet ef database update     # Apply migrations
```

## Production Deployment

### Frontend
1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `dist/` folder to a static hosting service (Nginx, Vercel, Netlify, etc.)

### Backend
1. Publish the backend:
   ```bash
   cd backend
   dotnet publish -c Release
   ```
2. Deploy to IIS, Azure App Service, or Docker container
3. Configure production database connection string

## License

MIT License - See LICENSE file for details.

## Contributors

- Project contributors
