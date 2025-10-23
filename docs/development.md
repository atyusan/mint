# Development Guide

## Overview

This guide provides comprehensive information for developers working on the Mint Platform. It covers development environment setup, coding standards, testing procedures, and best practices.

## Development Environment Setup

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 13+
- **Git** for version control
- **VS Code** (recommended) or your preferred IDE
- **Docker** (optional, for containerized development)

### Initial Setup

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd versa
   ```

2. **Install Dependencies**

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Configuration**

   ```bash
   # Backend
   cd backend
   cp .env.example .env

   # Frontend
   cd ../frontend
   cp .env.example .env
   ```

4. **Database Setup**
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

## Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── auth/                 # Authentication & authorization
│   │   ├── decorators/       # Custom decorators
│   │   ├── guards/          # Auth guards
│   │   ├── strategies/      # Auth strategies
│   │   └── auth.service.ts
│   ├── users/               # User management
│   ├── merchants/           # Merchant management
│   ├── outlets/             # Outlet management
│   ├── terminals/           # Terminal management
│   ├── invoices/            # Invoice management
│   ├── payments/            # Payment processing
│   ├── payouts/             # Payout management
│   ├── analytics/           # Analytics & reporting
│   ├── fees/                # Fee calculation
│   ├── paystack/            # Paystack integration
│   ├── webhooks/            # Webhook handling
│   ├── common/              # Shared utilities
│   │   ├── decorators/      # Common decorators
│   │   ├── filters/         # Exception filters
│   │   ├── guards/          # Common guards
│   │   ├── interceptors/    # Request interceptors
│   │   ├── pipes/           # Validation pipes
│   │   └── utils/           # Utility functions
│   ├── config/              # Configuration files
│   ├── database/            # Database configuration
│   └── main.ts              # Application entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Database seeding
├── test/                    # Test files
├── docs/                    # Documentation
└── package.json
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Auth/           # Authentication components
│   │   ├── Dashboard/      # Dashboard components
│   │   ├── Invoices/       # Invoice management
│   │   ├── Terminals/      # Terminal management
│   │   ├── Analytics/      # Analytics components
│   │   ├── Payouts/        # Payout management
│   │   └── Layout/         # Layout components
│   ├── store/              # Redux store
│   │   ├── slices/         # Redux slices
│   │   ├── api/            # API configuration
│   │   └── store.ts        # Store configuration
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── constants/          # Application constants
│   ├── styles/             # Global styles
│   └── App.tsx             # Main App component
├── public/                 # Static assets
├── docs/                   # Documentation
└── package.json
```

## Coding Standards

### TypeScript Standards

#### Naming Conventions

```typescript
// Interfaces and Types
interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

// Classes
class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService
  ) {}
}

// Functions
const calculateTotalAmount = (amount: number, fee: number): number => {
  return amount + fee;
};

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_PAGE_SIZE = 10;
```

#### Code Organization

```typescript
// 1. Imports
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// 2. Interfaces and Types
interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
}

// 3. Service Class
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 4. Public Methods
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);

    try {
      const user = await this.prisma.user.create({
        data: createUserDto,
      });

      this.logger.log(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw error;
    }
  }

  // 5. Private Methods
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
```

### NestJS Standards

#### Controller Structure

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions({ resource: 'user', action: 'read' })
  async getUsers(
    @Query() query: GetUsersDto
  ): Promise<PaginatedResponse<User>> {
    return this.usersService.getUsers(query);
  }

  @Post()
  @RequirePermissions({ resource: 'user', action: 'create' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'user', action: 'read' })
  async getUser(@Param('id') id: string): Promise<User> {
    return this.usersService.getUser(id);
  }

  @Put(':id')
  @RequirePermissions({ resource: 'user', action: 'update' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'user', action: 'delete' })
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.usersService.deleteUser(id);
  }
}
```

#### Service Structure

```typescript
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService
  ) {}

  async getUsers(query: GetUsersDto): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 10, search, status } = query;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    await this.emailService.sendWelcomeEmail(user.email);

    this.logger.log(`User created successfully: ${user.id}`);
    return user;
  }
}
```

### React Standards

#### Component Structure

```typescript
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { AppDispatch, RootState } from '../store/store';
import { getUsers } from '../store/slices/userSlice';

interface UserListProps {
  onUserSelect?: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ onUserSelect }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector(
    (state: RootState) => state.users
  );
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    onUserSelect?.(user);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color='error'>Error: {error}</Typography>;
  }

  return (
    <Box>
      <Typography variant='h4' component='h1' gutterBottom>
        Users
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                selected={selectedUser?.id === user.id}
                onClick={() => handleUserSelect(user)}
              >
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={() => handleUserSelect(user)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserList;
```

#### Custom Hooks

```typescript
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useApi = <T>(
  action: any,
  dependencies: any[] = []
): UseApiResult<T> => {
  const dispatch = useDispatch<AppDispatch>();
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const { data, loading, error } = useSelector((state: RootState) => state.api);

  useEffect(() => {
    dispatch(action());
  }, [dispatch, ...dependencies, refetchTrigger]);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  return {
    data: data as T,
    loading,
    error,
    refetch,
  };
};
```

## Testing Standards

### Backend Testing

#### Unit Tests

```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendWelcomeEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const expectedUser = {
        id: 'user-id',
        ...createUserDto,
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'create').mockResolvedValue(expectedUser);
      jest.spyOn(emailService, 'sendWelcomeEmail').mockResolvedValue(undefined);

      const result = await service.createUser(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: createUserDto.email,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
        }),
      });
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        createUserDto.email
      );
    });

    it('should throw an error if email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValue(new Error('Email already exists'));

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        'Email already exists'
      );
    });
  });
});
```

#### Integration Tests

```typescript
// users.controller.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import * as request from 'supertest';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a user', () => {
      const createUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const expectedUser = {
        id: 'user-id',
        ...createUserDto,
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'create').mockResolvedValue(expectedUser);

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toEqual(expectedUser);
        });
    });
  });
});
```

### Frontend Testing

#### Component Tests

```typescript
// UserList.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import UserList from './UserList';
import userReducer from '../store/slices/userSlice';

const mockStore = configureStore({
  reducer: {
    users: userReducer,
  },
  preloadedState: {
    users: {
      users: [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          status: 'ACTIVE',
        },
      ],
      loading: false,
      error: null,
    },
  },
});

describe('UserList', () => {
  it('renders user list correctly', () => {
    render(
      <Provider store={mockStore}>
        <UserList />
      </Provider>
    );

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('calls onUserSelect when user is clicked', () => {
    const mockOnUserSelect = jest.fn();

    render(
      <Provider store={mockStore}>
        <UserList onUserSelect={mockOnUserSelect} />
      </Provider>
    );

    fireEvent.click(screen.getByText('John Doe'));

    expect(mockOnUserSelect).toHaveBeenCalledWith({
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      status: 'ACTIVE',
    });
  });
});
```

#### Redux Tests

```typescript
// userSlice.test.ts
import userSlice, { getUsers, createUser } from './userSlice';

describe('userSlice', () => {
  const initialState = {
    users: [],
    loading: false,
    error: null,
  };

  it('should handle getUsers.pending', () => {
    const action = { type: getUsers.pending.type };
    const state = userSlice(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle getUsers.fulfilled', () => {
    const mockUsers = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    ];
    const action = { type: getUsers.fulfilled.type, payload: mockUsers };
    const state = userSlice(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.users).toEqual(mockUsers);
    expect(state.error).toBeNull();
  });

  it('should handle getUsers.rejected', () => {
    const error = 'Failed to fetch users';
    const action = { type: getUsers.rejected.type, payload: error };
    const state = userSlice(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe(error);
  });
});
```

## Development Workflow

### Git Workflow

1. **Feature Branches**

   ```bash
   git checkout -b feature/user-authentication
   git add .
   git commit -m "feat: add user authentication"
   git push origin feature/user-authentication
   ```

2. **Pull Requests**

   - Create pull request from feature branch to main
   - Include description of changes
   - Link related issues
   - Request code review

3. **Commit Messages**
   ```
   feat: add user authentication
   fix: resolve payment processing bug
   docs: update API documentation
   test: add unit tests for user service
   refactor: improve code structure
   ```

### Code Review Process

1. **Automated Checks**

   - Linting (ESLint, Prettier)
   - Type checking (TypeScript)
   - Unit tests
   - Integration tests

2. **Manual Review**

   - Code quality
   - Security considerations
   - Performance implications
   - Documentation updates

3. **Approval Requirements**
   - At least one approval from team member
   - All automated checks passing
   - No security vulnerabilities

### Testing Workflow

1. **Unit Tests**

   ```bash
   # Backend
   cd backend
   npm run test

   # Frontend
   cd frontend
   npm run test
   ```

2. **Integration Tests**

   ```bash
   cd backend
   npm run test:e2e
   ```

3. **Coverage Reports**
   ```bash
   npm run test:coverage
   ```

## Debugging

### Backend Debugging

#### VS Code Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug NestJS",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/main.ts",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeArgs": ["-r", "ts-node/register"]
    }
  ]
}
```

#### Logging

```typescript
import { Logger } from '@nestjs/common';

export class UserService {
  private readonly logger = new Logger(UserService.name);

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);

    try {
      const user = await this.prisma.user.create({
        data: createUserDto,
      });

      this.logger.log(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### Frontend Debugging

#### React Developer Tools

1. Install React Developer Tools browser extension
2. Use Redux DevTools for state debugging
3. Use Network tab for API debugging

#### Console Logging

```typescript
const UserList: React.FC = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    console.log('Users state changed:', { users, loading, error });
  }, [users, loading, error]);

  return (
    // Component JSX
  );
};
```

## Performance Optimization

### Backend Optimization

#### Database Optimization

```typescript
// Use select to limit fields
const users = await this.prisma.user.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
  },
});

// Use include for related data
const userWithMerchant = await this.prisma.user.findUnique({
  where: { id: userId },
  include: {
    merchant: true,
  },
});

// Use pagination
const users = await this.prisma.user.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```

#### Caching

```typescript
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getUser(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    await this.cacheManager.set(cacheKey, user, 300); // 5 minutes
    return user;
  }
}
```

### Frontend Optimization

#### Component Optimization

```typescript
import React, { memo, useMemo, useCallback } from 'react';

interface UserListProps {
  users: User[];
  onUserSelect: (user: User) => void;
}

const UserList: React.FC<UserListProps> = memo(({ users, onUserSelect }) => {
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [users]);

  const handleUserSelect = useCallback(
    (user: User) => {
      onUserSelect(user);
    },
    [onUserSelect]
  );

  return (
    <div>
      {sortedUsers.map((user) => (
        <UserItem key={user.id} user={user} onSelect={handleUserSelect} />
      ))}
    </div>
  );
});

export default UserList;
```

#### Bundle Optimization

```typescript
// Lazy loading components
const UserList = lazy(() => import('./UserList'));
const Analytics = lazy(() => import('./Analytics'));

// Code splitting
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path='/users'
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <UserList />
            </Suspense>
          }
        />
      </Routes>
    </Router>
  );
};
```

## Documentation

### Code Documentation

#### JSDoc Comments

```typescript
/**
 * Creates a new user in the system
 * @param createUserDto - User creation data
 * @returns Promise<User> - Created user object
 * @throws {ConflictException} - If email already exists
 * @throws {ValidationException} - If input data is invalid
 */
async createUser(createUserDto: CreateUserDto): Promise<User> {
  // Implementation
}
```

#### README Files

````markdown
# User Service

This service handles user management operations including creation, retrieval, and updates.

## Features

- User creation with validation
- Email verification
- Password hashing
- User profile management

## Usage

```typescript
const userService = new UserService(prismaService, emailService);
const user = await userService.createUser({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: 'password123',
});
```
````

## API

### Methods

- `createUser(dto: CreateUserDto): Promise<User>`
- `getUser(id: string): Promise<User>`
- `updateUser(id: string, dto: UpdateUserDto): Promise<User>`
- `deleteUser(id: string): Promise<void>`

````

## Deployment

### Development Deployment

```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm start
````

### Production Deployment

```bash
# Build
cd backend
npm run build

cd frontend
npm run build

# Deploy
# Follow deployment guide
```

---

This development guide provides comprehensive information for developers working on the Mint Platform. Use this as a reference for coding standards, testing procedures, and development workflows.
