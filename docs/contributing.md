# Contributing Guide

## Overview

Thank you for your interest in contributing to the Mint Platform! This guide provides information about how to contribute to the project, including development setup, coding standards, and the contribution process.

## Getting Started

### Prerequisites

Before contributing, ensure you have the following installed:

- **Node.js** 18+ and npm
- **PostgreSQL** 13+
- **Git** for version control
- **Docker** (optional, for containerized development)

### Development Setup

1. **Fork the Repository**

   ```bash
   # Fork the repository on GitHub
   # Clone your fork
   git clone https://github.com/your-username/mint-platform.git
   cd mint-platform
   ```

2. **Set Up Development Environment**

   ```bash
   # Backend setup
   cd backend
   npm install
   cp .env.example .env
   # Configure your .env file

   # Frontend setup
   cd ../frontend
   npm install
   cp .env.example .env
   # Configure your .env file
   ```

3. **Database Setup**

   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. **Start Development Servers**

   ```bash
   # Backend (in one terminal)
   cd backend
   npm run start:dev

   # Frontend (in another terminal)
   cd frontend
   npm start
   ```

## Contribution Process

### 1. Issue Creation

Before starting work on a new feature or bug fix:

1. **Check Existing Issues**: Search for existing issues that might be related
2. **Create an Issue**: If no related issue exists, create a new one
3. **Provide Context**: Include detailed information about the problem or feature request
4. **Use Labels**: Apply appropriate labels to categorize the issue

### 2. Branch Creation

```bash
# Create a new branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/your-bug-fix-name
```

### 3. Development

- **Follow Coding Standards**: Adhere to the project's coding standards
- **Write Tests**: Include tests for new functionality
- **Update Documentation**: Update relevant documentation
- **Commit Frequently**: Make small, focused commits

### 4. Pull Request

1. **Push Your Changes**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**

   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

3. **Review Process**
   - Wait for code review
   - Address feedback
   - Make necessary changes

## Coding Standards

### TypeScript/JavaScript

#### Code Style

```typescript
// Use meaningful variable names
const userEmail = 'user@example.com';
const isAuthenticated = true;

// Use const for immutable values
const API_BASE_URL = 'https://api.example.com';

// Use let for mutable values
let currentUser = null;

// Use descriptive function names
const calculateTotalAmount = (amount: number, fee: number): number => {
  return amount + fee;
};

// Use interfaces for object shapes
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Use enums for constants
enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}
```

#### Naming Conventions

- **Variables**: camelCase (`userEmail`, `isAuthenticated`)
- **Functions**: camelCase (`getUserById`, `calculateTotal`)
- **Classes**: PascalCase (`UserService`, `PaymentController`)
- **Interfaces**: PascalCase (`User`, `PaymentRequest`)
- **Enums**: PascalCase (`UserStatus`, `PaymentStatus`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRY_ATTEMPTS`)

#### File Organization

```
src/
├── auth/
│   ├── decorators/
│   ├── guards/
│   ├── strategies/
│   └── auth.service.ts
├── users/
│   ├── dto/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
└── main.ts
```

### NestJS Standards

#### Controller Structure

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(@Query() query: GetUsersDto) {
    return this.usersService.getUsers(query);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
```

#### Service Structure

```typescript
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getUsers(query: GetUsersDto): Promise<PaginatedResponse<User>> {
    this.logger.log('Fetching users');

    const { page = 1, limit = 10, search } = query;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
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

  async getUser(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Updating user: ${id}`);

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });

      this.logger.log(`User updated successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    this.logger.log(`Deleting user: ${id}`);

    try {
      await this.prisma.user.delete({
        where: { id },
      });

      this.logger.log(`User deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete user: ${error.message}`);
      throw error;
    }
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

### Unit Testing

```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

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
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

      const result = await service.createUser(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
    });
  });
});
```

### Integration Testing

```typescript
// users.controller.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.data.email).toBe(createUserDto.email);
        });
    });
  });
});
```

## Documentation Standards

### Code Documentation

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

### README Files

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
const userService = new UserService(prismaService);
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

```

## Commit Standards

### Commit Message Format

```

type(scope): description

[optional body]

[optional footer]

````

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
feat(auth): add multi-factor authentication
fix(payments): resolve payment processing bug
docs(api): update API documentation
style(ui): improve button styling
refactor(users): optimize user query performance
test(auth): add unit tests for authentication
chore(deps): update dependencies
````

## Pull Request Standards

### PR Template

```markdown
## Description

Brief description of the changes made.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or documented)

## Related Issues

Closes #123
```

## Code Review Process

### Review Checklist

- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Error handling is appropriate
- [ ] Logging is adequate

### Review Guidelines

1. **Be Constructive**: Provide helpful feedback
2. **Be Specific**: Point out specific issues
3. **Be Respectful**: Maintain professional tone
4. **Be Thorough**: Check for edge cases and potential issues
5. **Be Timely**: Respond to review requests promptly

## Getting Help

### Resources

- **Documentation**: Check project documentation
- **Issues**: Search existing issues
- **Discussions**: Use GitHub discussions
- **Community**: Join community channels

### Contact

- **Email**: dev@mintplatform.com
- **Slack**: #mint-platform-dev
- **Discord**: Mint Platform Community

## Recognition

Contributors will be recognized in:

- **README**: Contributor list
- **Releases**: Release notes
- **Documentation**: Contributor acknowledgments
- **Community**: Special recognition

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Enforcement

Instances of unacceptable behavior may be reported to the project maintainers.

---

Thank you for contributing to the Mint Platform! Your contributions help make the platform better for everyone.
