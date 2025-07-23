# Testing Guide for Adventures on Wheels Blog

## Overview

This motorhome blog application includes comprehensive automated testing to ensure reliability and maintain quality during updates.

## Test Structure

### Test Types

1. **Unit Tests** (`tests/utils/`)
   - Schema validation tests
   - Utility function tests
   - Data transformation tests

2. **API Tests** (`tests/api/`)
   - Authentication endpoints
   - Posts CRUD operations
   - Contact form functionality
   - Admin features

3. **Integration Tests** (`tests/integration/`)
   - Database operations
   - Cross-component functionality
   - Data consistency checks

4. **End-to-End Tests** (`tests/e2e/`)
   - Complete user workflows
   - Full blog post lifecycle
   - Contact form submission flow

## Running Tests

### Local Development

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="should create post"
```

### Manual Test Setup

1. Make sure PostgreSQL is running locally
2. Create test database:
   ```bash
   createdb test_motorhome_blog
   ```
3. Set environment variables:
   ```bash
   export NODE_ENV=test
   export DATABASE_URL="postgresql://username:password@localhost:5432/test_motorhome_blog"
   ```
4. Run database migrations:
   ```bash
   npm run db:push
   ```
5. Run tests:
   ```bash
   npm test
   ```

## CI/CD Integration

### GitHub Actions

The project includes a comprehensive CI/CD pipeline (`.github/workflows/ci.yml`) that:

- Tests on multiple Node.js versions (18.x, 20.x)
- Sets up PostgreSQL service
- Runs all test suites
- Generates coverage reports
- Performs security audits
- Builds the application

### Automated Testing Triggers

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` branch
- Manual workflow dispatch

## Test Coverage

The test suite covers:

### Authentication
- ✅ Login/logout functionality
- ✅ User session management
- ✅ Admin permission checks
- ✅ Unauthorized access handling

### Blog Posts
- ✅ Creating new posts
- ✅ Reading post details
- ✅ Updating existing posts
- ✅ Deleting posts
- ✅ Category filtering
- ✅ Search functionality
- ✅ Published/draft status

### Contact System
- ✅ Form submission validation
- ✅ Email notifications
- ✅ Admin message review
- ✅ Data persistence

### Database
- ✅ Schema constraints
- ✅ Data relationships
- ✅ CRUD operations
- ✅ Query performance

## Writing New Tests

### Test File Structure

```typescript
import request from 'supertest';
import { createApp } from '../../server/index';

describe('Feature Name', () => {
  let app: any;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    // Cleanup test data
  });

  describe('Specific Functionality', () => {
    it('should perform expected behavior', async () => {
      // Test implementation
    });
  });
});
```

### Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data
3. **Descriptive Names**: Use clear, descriptive test names
4. **Setup/Teardown**: Use proper beforeAll/afterAll hooks
5. **Assertions**: Include meaningful assertions
6. **Coverage**: Aim for comprehensive test coverage

### Adding New Test Categories

1. Create new test file in appropriate directory
2. Follow existing naming conventions
3. Include in test suite configuration
4. Add to CI/CD pipeline if needed

## Test Configuration

### Jest Configuration (`jest.config.js`)

- TypeScript support via ts-jest
- Test timeout: 10 seconds
- Coverage reporting in HTML and LCOV formats
- Test setup file for environment configuration

### Environment Variables

Test environment uses:
- `NODE_ENV=test`
- Separate test database
- Mock email services
- Dummy authentication secrets

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL environment variable
   - Verify test database exists

2. **Port Conflicts**
   - Tests should not start the server on port 5000
   - Use `NODE_ENV=test` to prevent server startup

3. **Async/Timeout Issues**
   - Increase test timeout if needed
   - Ensure proper cleanup in afterAll hooks
   - Check for unresolved promises

### Debugging Tests

```bash
# Run tests with verbose output
npm test -- --verbose

# Run single test file with debugging
npm test -- --testPathPattern=auth.test.ts --verbose

# Run with coverage and see uncovered lines
npm run test:coverage
```

## Maintenance

### Regular Tasks

1. Update test dependencies monthly
2. Review test coverage reports
3. Add tests for new features
4. Remove obsolete tests
5. Update documentation

### Performance Monitoring

- Monitor test execution time
- Optimize slow tests
- Maintain database test data size
- Review CI/CD pipeline performance

## Integration with Development Workflow

1. **Pre-commit**: Run tests before committing
2. **Pull Requests**: All tests must pass
3. **Deployments**: Only deploy after successful test runs
4. **Monitoring**: Set up alerts for test failures

This testing framework ensures your motorhome blog remains reliable and maintainable as you add new features and make updates.