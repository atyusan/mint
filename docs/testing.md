# Testing Guide

## Overview

This guide provides comprehensive information about testing strategies, procedures, and best practices for the Mint Platform. It covers unit testing, integration testing, end-to-end testing, and performance testing.

## Testing Strategy

### Testing Pyramid

The Mint Platform follows a testing pyramid approach with three main levels:

1. **Unit Tests** (70%): Fast, isolated tests for individual components
2. **Integration Tests** (20%): Tests for component interactions and API endpoints
3. **End-to-End Tests** (10%): Full application workflow tests

### Testing Principles

- **Test Early and Often**: Tests are written alongside development
- **Automated Testing**: All tests are automated and run in CI/CD pipeline
- **Comprehensive Coverage**: Aim for 90%+ code coverage
- **Fast Feedback**: Tests provide quick feedback on code changes
- **Reliable Tests**: Tests are stable and deterministic

## Backend Testing

### Unit Testing

#### Setup

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

  afterEach(() => {
    jest.clearAllMocks();
  });
});
```

#### Test Examples

```typescript
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
```

### Integration Testing

#### Setup

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
});
```

#### Test Examples

```typescript
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

  it('should return 400 for invalid input', () => {
    const invalidDto = {
      email: 'invalid-email',
      firstName: '',
      lastName: 'Doe',
      password: '123',
    };

    return request(app.getHttpServer())
      .post('/users')
      .send(invalidDto)
      .expect(400);
  });
});
```

### Database Testing

#### Setup

```typescript
// database.test.ts
import { PrismaService } from '../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('Database Tests', () => {
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await prismaService.user.deleteMany();
    await prismaService.merchant.deleteMany();
  });
});
```

#### Test Examples

```typescript
describe('User Database Operations', () => {
  it('should create a user in database', async () => {
    const userData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashed-password',
      userType: 'MERCHANT',
    };

    const user = await prismaService.user.create({
      data: userData,
    });

    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.firstName).toBe(userData.firstName);
    expect(user.lastName).toBe(userData.lastName);
  });

  it('should find user by email', async () => {
    const userData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashed-password',
      userType: 'MERCHANT',
    };

    await prismaService.user.create({ data: userData });

    const user = await prismaService.user.findUnique({
      where: { email: userData.email },
    });

    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
  });
});
```

## Frontend Testing

### Component Testing

#### Setup

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
```

#### Test Examples

```typescript
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

  it('displays loading state', () => {
    const loadingStore = configureStore({
      reducer: {
        users: userReducer,
      },
      preloadedState: {
        users: {
          users: [],
          loading: true,
          error: null,
        },
      },
    });

    render(
      <Provider store={loadingStore}>
        <UserList />
      </Provider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    const errorStore = configureStore({
      reducer: {
        users: userReducer,
      },
      preloadedState: {
        users: {
          users: [],
          loading: false,
          error: 'Failed to load users',
        },
      },
    });

    render(
      <Provider store={errorStore}>
        <UserList />
      </Provider>
    );

    expect(screen.getByText('Error: Failed to load users')).toBeInTheDocument();
  });
});
```

### Redux Testing

#### Setup

```typescript
// userSlice.test.ts
import userSlice, { getUsers, createUser } from './userSlice';

describe('userSlice', () => {
  const initialState = {
    users: [],
    loading: false,
    error: null,
  };
});
```

#### Test Examples

```typescript
describe('userSlice', () => {
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

### API Testing

#### Setup

```typescript
// api.test.ts
import { api } from './api';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json({
        data: [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
        ],
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

#### Test Examples

```typescript
describe('API Tests', () => {
  it('should fetch users', async () => {
    const users = await api.getUsers();

    expect(users).toEqual([
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    ]);
  });

  it('should handle API errors', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Internal Server Error' })
        );
      })
    );

    await expect(api.getUsers()).rejects.toThrow('Internal Server Error');
  });
});
```

## End-to-End Testing

### Setup

```typescript
// e2e/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
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
});
```

### Test Examples

```typescript
describe('User Management (e2e)', () => {
  it('/users (POST) should create a user', () => {
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
        expect(res.body.data.firstName).toBe(createUserDto.firstName);
        expect(res.body.data.lastName).toBe(createUserDto.lastName);
      });
  });

  it('/users (GET) should return users', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });

  it('/users/:id (GET) should return a user', async () => {
    // First create a user
    const createUserDto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto);

    const userId = createResponse.body.data.id;

    // Then fetch the user
    return request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.id).toBe(userId);
        expect(res.body.data.email).toBe(createUserDto.email);
      });
  });
});
```

## Performance Testing

### Load Testing

#### Setup

```typescript
// performance.test.ts
import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  it('should handle concurrent user creation', async () => {
    const startTime = performance.now();

    const promises = Array.from({ length: 100 }, (_, i) => {
      const createUserDto = {
        email: `test${i}@example.com`,
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      return request(app.getHttpServer()).post('/users').send(createUserDto);
    });

    await Promise.all(promises);

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });

  it('should handle large dataset queries', async () => {
    const startTime = performance.now();

    const response = await request(app.getHttpServer())
      .get('/users')
      .query({ limit: 1000 });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
  });
});
```

### Memory Testing

```typescript
describe('Memory Tests', () => {
  it('should not have memory leaks', async () => {
    const initialMemory = process.memoryUsage();

    // Perform operations that might cause memory leaks
    for (let i = 0; i < 1000; i++) {
      await request(app.getHttpServer()).get('/users');
    }

    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

    // Memory increase should be reasonable
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
  });
});
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/main.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testTimeout: 10000,
};
```

### Test Setup

```typescript
// test/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up test data
  await prisma.user.deleteMany();
  await prisma.merchant.deleteMany();
});
```

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: mint_platform_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/mint_platform_test

      - name: Run e2e tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/mint_platform_test

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v1
        with:
          file: ./coverage/lcov.info
```

## Test Best Practices

### Writing Effective Tests

1. **Test Behavior, Not Implementation**

   - Focus on what the code does, not how it does it
   - Test public interfaces and expected outcomes

2. **Use Descriptive Test Names**

   - Test names should clearly describe what is being tested
   - Include the expected behavior in the name

3. **Arrange-Act-Assert Pattern**

   - Arrange: Set up test data and conditions
   - Act: Execute the code being tested
   - Assert: Verify the expected outcome

4. **Keep Tests Independent**

   - Tests should not depend on each other
   - Each test should be able to run in isolation

5. **Mock External Dependencies**
   - Mock external services and APIs
   - Use dependency injection for testability

### Test Data Management

1. **Use Test Factories**

   - Create test data factories for consistent test data
   - Use builders for complex object creation

2. **Clean Up Test Data**

   - Clean up test data after each test
   - Use database transactions for isolation

3. **Use Realistic Test Data**
   - Use data that reflects real-world scenarios
   - Include edge cases and boundary conditions

### Performance Considerations

1. **Optimize Test Speed**

   - Use mocks for slow operations
   - Parallelize tests where possible
   - Use in-memory databases for testing

2. **Monitor Test Performance**
   - Track test execution times
   - Identify and optimize slow tests
   - Use performance budgets

## Troubleshooting

### Common Issues

#### Tests Failing Intermittently

- Check for race conditions
- Ensure proper test isolation
- Use proper async/await handling

#### Slow Test Execution

- Use mocks for external dependencies
- Optimize database operations
- Consider test parallelization

#### Memory Issues

- Clean up test data properly
- Avoid memory leaks in tests
- Monitor memory usage

### Debugging Tests

1. **Use Debug Logging**

   - Add console.log statements for debugging
   - Use debugger statements for step-by-step debugging

2. **Isolate Failing Tests**

   - Run individual tests to isolate issues
   - Use test.only() to focus on specific tests

3. **Check Test Environment**
   - Verify test environment setup
   - Check database connections and configurations

---

This testing guide provides comprehensive information about testing strategies and procedures for the Mint Platform. Follow these guidelines to ensure high-quality, reliable tests that provide confidence in the platform's functionality.
