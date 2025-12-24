# RolePlay Identity System

A comprehensive platform for RolePlay servers, providing a full-featured MDT/CAD system and character management. The project solves the task of creating a unified ecosystem for managing characters, emergency calls, reporting, and administrative functions within a gaming RolePlay community.

## 🚀 Features

### Core Functionality

- **Character Management**: Create, edit, and manage player characters
- **MDT/CAD System**: Full-featured Mobile Data Terminal system for law enforcement
- **911 Call System**: Processing and dispatching of emergency calls
- **Vehicle Management**: Registration and tracking of vehicles
- **Weapon Registration**: Inventory and management of weapons
- **Application System**: Submission and processing of department applications
- **Report System**: Create and manage reports with template support
- **BOLO System**: Be On Look Out - wanted persons/vehicles system
- **Real-time Updates**: WebSocket connections for real-time data synchronization
- **Personal Cabinet**: Personal user dashboard with profile management
- **Testing System**: Conduct tests for candidates
- **Department Management**: Administration of departments and divisions

### Technical Features

- **Monorepo**: Single codebase for all system components
- **Type Safety**: End-to-end typing from database to UI
- **Row Level Security (RLS)**: Row-level security in the database
- **Service Architecture**: Clear separation of business logic
- **API-first Approach**: RESTful API with versioning

## 📋 Requirements

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **PostgreSQL**: 17+ (or Supabase)
- **Supabase**: Account and project (for authentication and database)

## 🏗️ Architecture

The project uses a monorepo with clear separation into applications and libraries:

```
RolePlayIdentity/
├── apps/
│   ├── client/              # Main client interface
│   ├── server/             # Backend API server
│   ├── mdtclient/          # MDT client for emergency services
│   ├── personal-cabinet/   # User personal cabinet
│   └── resources_fivem/    # FiveM resources
├── libs/
│   ├── shared-types/       # Shared TypeScript types
│   ├── shared-utils/       # Shared utilities
│   └── ui-components/      # Reusable UI components
├── packages/
│   └── db-types/          # Database types (auto-generated)
└── docs/                   # Project documentation
```

### Database Schemas

The project uses multiple PostgreSQL schemas for logical data separation:

- **`public`**: Public data, user profiles, notifications
- **`common`**: Common data - characters, vehicles, weapons, companies, departments
- **`mdt`**: MDT system data - 911 calls, BOLO, active units, reports, applications

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/roleplay-identity.git
cd roleplay-identity
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

#### Backend (Server)

Copy `apps/server/.env.example` to `apps/server/.env` and fill in the required values:

```bash
cp apps/server/.env.example apps/server/.env
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role key from Supabase
- `JWT_SECRET` - Secret key for JWT tokens (generate: `openssl rand -base64 32`)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

#### Frontend (Client)

Copy `apps/client/env.example` to `apps/client/.env`:

```bash
cp apps/client/env.example apps/client/.env
```

### 4. Database Setup

1. Create a project in Supabase
2. Apply migrations from `supabase/migrations/`
3. Configure Row Level Security (RLS) policies

### 5. Run in Development Mode

```bash
# Run all applications simultaneously
npm run dev

# Or run individual applications
npm run dev:client    # Client on port 3000
npm run dev:mdt       # MDT client on port 3001
npm run dev:server    # Server on port 5000
```

## 📦 Building for Production

```bash
# Build all applications
npm run build

# Build individual applications
npm run build:client
npm run build:mdt
npm run build:server
```

After building, files will be in the `dist/` directory.

## 🧪 Testing

```bash
# Run all tests
npm run test

# Tests for individual applications
npm run test:client
npm run test:mdt
npm run test:server

# Tests with coverage
npm run test:coverage
```

## 📚 Documentation

Detailed documentation is located in the `docs/` directory:

- [Project Architecture](docs/PROJECT_ARCHITECTURE.md) - Detailed architecture description
- [Role Management](docs/ROLES_MANAGEMENT.md) - Roles and permissions system
- [Testing System](docs/TESTING_SYSTEM.md) - Testing system documentation
- [Backend Architecture](docs/BACKEND_ARCHITECTURE_MAP.md) - Backend structure

## 🔧 Development

### Project Structure

The project uses a monorepo with workspace packages. Each application can be run independently.

### Code Standards

- **TypeScript**: Strict typing is required
- **ESLint**: Used for code checking
- **Prettier**: Automatic formatting (where configured)

### Main Commands

```bash
# Linting
npm run lint

# Clean build artifacts
npm run clean

# Sync database types
npm run db:sync

# Sync roles
npm run sync:roles
```

### "Golden Rules" of Development

1. **UUID for all IDs**: All identifiers use UUID (string)
2. **Service Layer**: All business logic in services, routes only validate and call services
3. **Types from db-types**: Always use types from `@roleplay-identity/db-types`
4. **Per-request Clients**: Supabase clients are created per request
5. **RLS Compatibility**: All queries must work with Row Level Security

## 🔐 Security

The project uses a multi-layered security system:

- **Row Level Security (RLS)**: Row-level security in PostgreSQL
- **JWT Authentication**: Tokens for API requests
- **Validation Middleware**: Access control checks at middleware level
- **Helmet**: HTTP header protection
- **CORS**: Cross-Origin Resource Sharing configuration
- **Rate Limiting**: Protection against abuse

For more details, see [SECURITY.md](SECURITY.md)

## 🤝 Contributing

We welcome contributions to the project! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for information on the contribution process.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have questions or issues:

1. Check the [documentation](docs/)
2. Create an [Issue](https://github.com/your-username/roleplay-identity/issues)
3. Refer to the [security policy](SECURITY.md) for reporting vulnerabilities

## 🗺️ Roadmap

- [ ] Notification system improvements
- [ ] Extended API documentation
- [ ] E2E tests addition
- [ ] Performance optimization
- [ ] Mobile application

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes (if available).

---

**RolePlay Identity System** - Modern platform for managing RolePlay communities.
