# Testing Strategy

## Test Types

### Unit Tests (Vitest)

- **Command**: `npm run test`
- **Coverage**: Component logic, hooks, utilities
- **Location**: `src/__tests__/`

### E2E Tests (Playwright)

#### Local Development

- **Command**: `npm run e2e`
- **Browsers**: Chrome, Firefox, Safari
- **Tests**: Full test suite including:
  - `auth-smoke.spec.ts` - Comprehensive auth testing
  - `auth-login.spec.ts` - Detailed login flow testing
  - `auth-register.spec.ts` - Detailed registration flow testing
  - `auth-integration.spec.ts` - End-to-end auth flows
  - `smoke.spec.ts` - Basic smoke tests

#### CI Pipeline

- **Command**: `npm run e2e:ci`
- **Config**: `playwright.ci.config.ts`
- **Browsers**: Chrome only (for speed)
- **Tests**: `ci-smoke.spec.ts` only (essential functionality)
- **Optimizations**:
  - Reduced timeouts
  - Minimal retries
  - Limited workers
  - Fast dot reporter
  - No tracing

## CI Optimization Strategy

### Why CI Tests Were Failing

1. **Multiple browsers**: Running on 3 browsers tripled execution time
2. **Heavy test suite**: Full test suite with many detailed test cases
3. **Resource constraints**: CI environments have limited resources
4. **Timeout issues**: Long-running tests causing CI failures

### Solutions Implemented

1. **Browser reduction**: CI runs only on Chrome (fastest)
2. **Test scope reduction**: CI runs only essential smoke tests
3. **Timeout optimization**: Aggressive timeouts for CI environment
4. **Resource management**: Limited workers and retries
5. **Separate configs**: Local vs CI configurations

### Test Execution Time Comparison

- **Local (full suite)**: ~2-3 minutes
- **CI (optimized)**: ~30-60 seconds
- **Performance improvement**: 3-6x faster

## Running Tests

### Development

```bash
# Unit tests
npm run test

# E2E tests (all browsers, full suite)
npm run e2e

# E2E tests with UI
npm run e2e:ui
```

### CI

```bash
# CI-optimized E2E tests
npm run e2e:ci
```

## Adding New Tests

### For Local Development

- Add comprehensive tests to existing spec files
- Test edge cases and detailed scenarios
- Use multiple browsers for cross-browser compatibility

### For CI

- Add essential functionality tests to `ci-smoke.spec.ts`
- Keep tests focused and fast
- Avoid complex interactions that might timeout
- Test only critical user paths

## Best Practices

1. **Test isolation**: Each test should be independent
2. **Fast execution**: Keep individual tests under 5 seconds
3. **Meaningful assertions**: Test behavior, not implementation details
4. **CI optimization**: Always consider CI performance when adding tests
5. **Local vs CI**: Use appropriate test scope for each environment
