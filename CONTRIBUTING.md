# Contributing to ANT AGENT

First off, thank you for considering contributing to ANT AGENT! It's people like you that make ANT AGENT such a great project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Coding Guidelines](#coding-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@antagent.io.

### Our Pledge

We pledge to make participation in ANT AGENT a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

---

## Getting Started

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page, then clone your fork:

```bash
git clone https://github.com/your-username/ant-agent.git
cd ant-agent
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Run the Project

```bash
# Development mode
npm run dev

# Build
npm run build

# Tests
npm test
```

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues to see if the problem has already been reported.

**When creating a bug report, include:**

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs. actual behavior
- Environment details (OS, Node.js version, etc.)
- Screenshots or logs if applicable

**Example:**

```markdown
**Description**
Scout agent fails to detect new pools on devnet.

**Steps to Reproduce**
1. Deploy scout agent with targets: ['new_pools']
2. Wait for new pool creation
3. Check agent logs

**Expected Behavior**
Agent should detect and log new pool creation within 5 seconds.

**Actual Behavior**
No detection occurs, agent shows "scanning" indefinitely.

**Environment**
- OS: macOS 14.0
- Node.js: 18.17.0
- Network: Solana devnet
```

### ✨ Suggesting Features

Feature suggestions are tracked as GitHub issues. When creating a feature suggestion:

- Use a clear and descriptive title
- Provide a detailed description of the proposed functionality
- Explain why this feature would be useful
- Include examples of how it would be used

### 📝 Pull Requests

Pull requests are the primary mechanism for contributing code changes. See the [Pull Request Process](#pull-request-process) section for details.

### 📖 Documentation

Documentation improvements are always welcome! This includes:

- Fixing typos or unclear explanations
- Adding examples
- Translating documentation
- Improving code comments

---

## Development Workflow

### 1. Create a Branch

```bash
# Make sure you're on main and up to date
git checkout main
git pull upstream main

# Create your feature branch
git checkout -b feature/amazing-feature
```

**Branch naming conventions:**

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications
- `chore/` - Maintenance tasks

### 2. Make Changes

Make your changes following our [Coding Guidelines](#coding-guidelines).

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Check code style
npm run lint

# Build the project
npm run build
```

### 4. Commit Your Changes

Follow our [Commit Guidelines](#commit-guidelines).

```bash
git add .
git commit -m "feat: add amazing feature"
```

### 5. Push and Create PR

```bash
git push origin feature/amazing-feature
```

Then go to GitHub and create a Pull Request.

---

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Use meaningful type names
- Avoid `any` - use proper types or `unknown`

```typescript
// ✅ Good
interface AgentConfig {
  name: string;
  targets: string[];
  interval: number;
}

// ❌ Bad
interface AgentConfig {
  name: any;
  targets: any;
}
```

### Code Style

- Use 2 spaces for indentation
- Maximum line length: 100 characters
- Use single quotes for strings
- Always use semicolons
- Use arrow functions for callbacks

```typescript
// ✅ Good
const processSignal = (signal: Signal): Promise<void> => {
  return handler.process(signal);
};

// ❌ Bad
function processSignal(signal) {
  return handler.process(signal)
}
```

### Error Handling

- Always handle errors explicitly
- Use custom error classes for domain-specific errors
- Include context in error messages

```typescript
// ✅ Good
class AgentError extends Error {
  constructor(agentName: string, message: string) {
    super(`[${agentName}] ${message}`);
    this.name = 'AgentError';
  }
}

try {
  await agent.execute();
} catch (error) {
  logger.error(`Agent execution failed: ${error.message}`);
  throw new AgentError(agent.name, 'Execution failed');
}
```

### Logging

- Use appropriate log levels (debug, info, warn, error)
- Include context in log messages
- Never log sensitive information

```typescript
// ✅ Good
logger.info({ agent: 'Scout-01', action: 'scan', duration: 150 }, 'Scan completed');

// ❌ Bad
console.log('done');
logger.debug(privateKey); // Never log secrets!
```

---

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/config changes
- `perf:` - Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(scout): add whale detection capability"

# Bug fix
git commit -m "fix(executor): resolve slippage calculation overflow"

# Documentation
git commit -m "docs(readme): update installation instructions"

# With body
git commit -m "feat(analyst): implement momentum indicator

- Add RSI calculation
- Add MACD analysis
- Integrate with signal processor

Closes #123"
```

---

## Pull Request Process

### Before Submitting

1. **Rebase on main**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all tests**

   ```bash
   npm test
   ```

3. **Check code style**

   ```bash
   npm run lint
   ```

4. **Update documentation** if needed

5. **Add tests** for new features

### PR Template

When creating a PR, fill out the template:

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested these changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No linting errors
```

### Review Process

1. Maintainers will review your PR
2. Address any feedback
3. Once approved, your PR will be merged

---

## Testing

### Running Tests

```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Specific file
npm test -- tests/agents/scout.test.ts

# Watch mode
npm run test:watch
```

### Writing Tests

- Write tests for all new features
- Aim for >80% code coverage
- Use descriptive test names
- Test edge cases

```typescript
describe('ScoutAgent', () => {
  describe('scanNewPools', () => {
    it('should detect new liquidity pools', async () => {
      // Test implementation
    });

    it('should handle empty results', async () => {
      // Test implementation
    });

    it('should respect rate limits', async () => {
      // Test implementation
    });
  });
});
```

---

## Documentation

### Documentation Standards

- Use clear, concise language
- Include code examples
- Keep documentation up to date with code changes
- Use proper markdown formatting

### File Locations

- User documentation: `docs/`
- API documentation: JSDoc comments in code
- Examples: `examples/`
- Changelog: `CHANGELOG.md`

---

## Community

### Get Involved

- 💬 Join our [Discord](https://discord.gg/antagent)
- 🐦 Follow us on [Twitter](https://twitter.com/antagent_io)
- 📧 Contact: conduct@antagent.io

### Need Help?

- Check existing issues and discussions
- Ask in Discord #contributors channel
- Create a GitHub discussion

---

## Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- Annual community report

Thank you for contributing to ANT AGENT! 🐜

---

<div align="center">

**🐜 Built with ❤️ by the ANT AGENT Community**

*You don't control the market. You deploy intelligence.*

</div>
