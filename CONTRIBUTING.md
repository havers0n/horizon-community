# Contributing Guide

Thank you for your interest in the RolePlay Identity project! We welcome your contributions.

## 🎯 How to Contribute

### Reporting Bugs

If you found a bug:

1. Check if it hasn't already been reported in [Issues](https://github.com/your-username/roleplay-identity/issues)
2. Create a new Issue with a detailed description:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Node.js version, OS, and other relevant information

### Suggesting New Features

1. Create an Issue with the `enhancement` label
2. Describe the problem the feature solves
3. Suggest a possible implementation (if you have ideas)

### Pull Requests

1. **Fork the repository**
2. **Create a branch** for your feature/fix:
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-description
   ```
3. **Make changes** following code standards
4. **Test** your changes
5. **Commit** changes:
   ```bash
   git commit -m "feat: add amazing feature"
   # or
   git commit -m "fix: resolve bug description"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Create a Pull Request** with a detailed description of changes

## 📝 Code Standards

### TypeScript

- Use strict typing
- Avoid `any` - use specific types
- Always use types from `@roleplay-identity/db-types` for database work

### Naming

- **Files**: `kebab-case` for files, `PascalCase` for components
- **Variables/Functions**: `camelCase`
- **Classes/Interfaces**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`

### Code Structure

```typescript
// ✅ Correct - service layer
export class CharacterService {
  async createCharacter(data: CreateCharacterInput): Promise<Character> {
    // Business logic here
  }
}

// ❌ Incorrect - business logic in route
router.post('/characters', async (req, res) => {
  // Business logic should not be here
});
```

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - new feature
- `fix:` - bug fix
- `docs:` - documentation changes
- `style:` - formatting, missing semicolons, etc.
- `refactor:` - code refactoring
- `test:` - adding tests
- `chore:` - updating build tasks, settings, etc.

Examples:
```
feat: add character search functionality
fix: resolve authentication token expiration
docs: update API documentation
refactor: simplify character service
```

## 🧪 Testing

- Write tests for new features
- Ensure all existing tests pass
- Strive for code coverage

```bash
# Run tests before committing
npm run test
```

## 📋 Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows project standards
- [ ] All tests pass
- [ ] Tests added for new features
- [ ] Documentation updated (if necessary)
- [ ] Commits follow Conventional Commits
- [ ] No conflicts with main branch
- [ ] Code checked with linter (`npm run lint`)

## 🔍 Review Process

1. Your PR will be reviewed by the team
2. Changes may be requested
3. After approval, the PR will be merged into the main branch

## 🏗️ Architectural Principles

### "Golden Rules"

1. **UUID for all IDs**: All identifiers are strings (UUID)
2. **Service Layer**: All business logic in services
3. **Types from db-types**: Use centralized types
4. **Per-request Clients**: Supabase clients are created per request
5. **RLS Compatibility**: All queries must work with Row Level Security

### Project Structure

- `apps/server/src/core/services/` - business logic
- `apps/server/src/api/routes/` - HTTP routes (validation and service calls only)
- `apps/server/src/api/middleware/` - Express middleware
- `libs/shared-types/` - shared types
- `packages/db-types/` - database types (auto-generated)

## ❓ Questions?

If you have questions:

1. Check the [documentation](docs/)
2. Create an Issue with your question
3. Contact the project maintainers

Thank you for your contribution! 🎉
