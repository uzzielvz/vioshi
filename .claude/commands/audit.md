Your goal is to audit the codebase for potential issues. Review the following areas:

## Security
- Check for hardcoded secrets, API keys, or sensitive data
- Validate that user inputs are properly sanitized
- Ensure proper authentication/authorization patterns

## Performance
- Identify unnecessary re-renders in React components
- Check for missing `"use client"` directives or overuse of client components
- Look for unoptimized images or missing Next.js Image component usage
- Identify potential memory leaks or inefficient data fetching

## Accessibility
- Verify proper semantic HTML usage
- Check for missing alt text on images
- Ensure proper ARIA labels and keyboard navigation

## Code Quality
- Identify unused imports, variables, or dead code
- Check for consistent TypeScript typing (avoid `any`)
- Look for code duplication that could be refactored
- Verify adherence to project patterns defined in CLAUDE.md

## Best Practices
- Ensure proper error handling
- Check for missing loading and error states
- Verify localStorage operations have proper fallbacks

Provide a structured report with findings organized by severity (Critical, Warning, Info) and include specific file paths and line numbers where issues are found.
