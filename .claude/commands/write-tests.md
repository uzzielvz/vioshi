Your goal is to write comprehensive tests for the specified code. Follow these guidelines:

## Test Framework
- Use Jest with React Testing Library for component tests
- Use Jest for unit tests on utilities and hooks

## What to Test

### Components
- Rendering with different props combinations
- User interactions (clicks, inputs, form submissions)
- Conditional rendering logic
- Error states and edge cases
- Accessibility (screen reader compatibility)

### Hooks
- Initial state values
- State updates after actions
- Side effects and cleanup
- Edge cases and error handling

### Utilities/Functions
- Expected outputs for various inputs
- Edge cases (empty arrays, null values, etc.)
- Error throwing conditions

## Test Structure
```typescript
describe('ComponentName', () => {
  describe('rendering', () => {
    it('should render correctly with default props', () => {});
    it('should render correctly with custom props', () => {});
  });

  describe('interactions', () => {
    it('should handle click events', () => {});
  });

  describe('edge cases', () => {
    it('should handle empty data', () => {});
  });
});
```

## Best Practices
- Use descriptive test names that explain the expected behavior
- Follow the Arrange-Act-Assert pattern
- Mock external dependencies and API calls
- Test behavior, not implementation details
- Aim for meaningful coverage, not 100% coverage
- Use `data-testid` attributes sparingly, prefer accessible queries

## Output
Create test files following the pattern `ComponentName.test.tsx` or `utilityName.test.ts` in the same directory as the source file, or in a `__tests__` folder.
