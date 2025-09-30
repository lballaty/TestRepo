# Gemini Project Style Guide

This document outlines the preferred coding style and architectural choices for this project. Google Gemini will use this guide to ensure all generated and refactored code aligns with project standards.

---

## General Principles

1. **Clarity over Cleverness:** Code must be immediately readable. If a complex solution is needed, it must be thoroughly documented with clear explanations of the reasoning.

2. **Type Safety:** Use strict type checking and type hints wherever possible:
   - Python: Type hints for all function parameters and return values
   - JavaScript/TypeScript: TypeScript with strict mode enabled
   - Avoid `any` types unless absolutely necessary

3. **Comments:** Add comments to explain *why* code does something, not *what* it does (unless the 'what' is non-obvious or implements a complex algorithm).

4. **File Headers:** Every file MUST begin with a header comment:
   ```python
   # File: path/to/file.py
   # Purpose: Brief description of file's purpose and main functionality
   ```

5. **Security First:**
   - NEVER hardcode secrets, API keys, passwords, or credentials
   - Always use environment variables via `os.getenv()` or `process.env`
   - Scan for secret patterns before committing

6. **Test-Driven Development:**
   - Write tests BEFORE implementation
   - Minimum 80% code coverage
   - Tests must be independent and repeatable

---

## Python Specifics

### Style Standards
* **Standard:** PEP 8 compliant
* **Indentation:** 4 spaces (never tabs)
* **Line Length:** Maximum 88 characters (Black formatter default)
* **Imports:** Group in this order:
  1. Standard library imports
  2. Third-party imports
  3. Local application/library imports
  * Use absolute imports, separate groups with blank line

### Type Hints
```python
from typing import List, Dict, Optional, Union

def process_data(
    items: List[str],
    config: Dict[str, any],
    timeout: Optional[int] = None
) -> Union[Dict, None]:
    """Process items according to configuration.

    Args:
        items: List of items to process
        config: Configuration dictionary
        timeout: Optional timeout in seconds

    Returns:
        Processed result dictionary or None on failure

    Raises:
        ValueError: If items list is empty
    """
    pass
```

### Docstrings
* **Style:** Google-style docstrings for all public functions and classes
* **Include:** Parameter types, return values, exceptions raised
* **Example:**
```python
def calculate_total(prices: List[float], tax_rate: float) -> float:
    """Calculate total price including tax.

    Computes sum of all prices and applies the given tax rate.

    Args:
        prices: List of individual item prices
        tax_rate: Tax rate as decimal (e.g., 0.08 for 8%)

    Returns:
        Total price including tax, rounded to 2 decimal places

    Raises:
        ValueError: If tax_rate is negative
    """
    if tax_rate < 0:
        raise ValueError("Tax rate cannot be negative")
    subtotal = sum(prices)
    return round(subtotal * (1 + tax_rate), 2)
```

### Naming Conventions
* **Functions/Variables:** `snake_case`
* **Classes:** `PascalCase`
* **Constants:** `UPPER_SNAKE_CASE`
* **Private methods:** `_leading_underscore`
* **Business-friendly names:** Use descriptive names (e.g., `user_authentication.py`, not `auth.py`)

### Error Handling
```python
# Good - specific exceptions
try:
    result = process_payment(amount)
except PaymentError as e:
    logger.error(f"Payment failed: {e}")
    raise
except ValueError as e:
    logger.warning(f"Invalid amount: {e}")
    return None

# Bad - catching all exceptions
try:
    result = process_payment(amount)
except Exception:  # Too broad
    pass  # Silent failure
```

---

## JavaScript / TypeScript Specifics

### Style Standards
* **Standard:** ESLint recommended configuration
* **Indentation:** 2 spaces
* **Semicolons:** Always use semicolons
* **Quotes:** Single quotes for strings, double quotes for JSX attributes
* **Module System:** ES Modules (`import/export`)

### Naming Conventions
* **Variables/Functions:** `camelCase`
* **Components/Classes:** `PascalCase`
* **Constants:** `UPPER_SNAKE_CASE`
* **Private methods:** `#privateMethod` (ES2022) or `_privateMethod`
* **File names:**
  - Components: `PascalCase.tsx` or `PascalCase.jsx`
  - Utilities: `camelCase.ts` or `kebab-case.js`

### TypeScript
```typescript
// File: src/api/userService.ts
// Purpose: User management service with type-safe API interactions

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

// Good - explicit types
async function createUser(
  request: CreateUserRequest
): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.statusText}`);
  }

  return response.json();
}

// Bad - implicit any
async function createUser(request) {  // Missing types
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.json();  // Return type unknown
}
```

### Promises and Async
```typescript
// Good - async/await
async function fetchUserData(userId: string): Promise<User> {
  try {
    const user = await getUser(userId);
    const profile = await getUserProfile(user.id);
    const settings = await getUserSettings(user.id);

    return { ...user, profile, settings };
  } catch (error) {
    logger.error('Failed to fetch user data', error);
    throw error;
  }
}

// Bad - promise chains
function fetchUserData(userId) {
  return getUser(userId)
    .then(user => getUserProfile(user.id)
      .then(profile => getUserSettings(user.id)
        .then(settings => ({ ...user, profile, settings }))
      )
    )
    .catch(error => {
      logger.error('Failed to fetch user data', error);
      throw error;
    });
}
```

### React Components
```typescript
// File: src/components/UserProfile.tsx
// Purpose: User profile display component with edit functionality

import { useState, useEffect } from 'react';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

// Good - functional component with hooks
export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await fetchUser(userId);
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return null;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

### State Management
* **React Hooks:** Prefer `useState` and `useReducer` for component state
* **Complex State:** Use `useReducer` for state with multiple sub-values
* **Side Effects:** Use `useEffect` with proper dependency arrays
* **Context:** Use React Context for global state (auth, theme, etc.)

---

## Database & SQL

### Query Style
```sql
-- Good - readable formatting
SELECT
    u.id,
    u.email,
    u.name,
    p.avatar_url,
    COUNT(o.id) AS order_count
FROM users u
LEFT JOIN profiles p ON p.user_id = u.id
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.email, u.name, p.avatar_url
ORDER BY order_count DESC
LIMIT 10;

-- Bad - hard to read
select u.id,u.email,u.name,p.avatar_url,count(o.id) as order_count from users u left join profiles p on p.user_id=u.id left join orders o on o.user_id=u.id where u.created_at>='2024-01-01' group by u.id,u.email,u.name,p.avatar_url order by order_count desc limit 10;
```

### Migrations
* **Naming:** `YYYYMMDDHHMMSS_descriptive_name.sql`
* **Include:** Both UP and DOWN migrations
* **Idempotent:** Use `IF NOT EXISTS` and `IF EXISTS`
* **Tested:** Test locally before committing

---

## Security Standards

### Environment Variables
```python
# Good - environment variables
import os

DATABASE_URL = os.getenv('DATABASE_URL')
API_KEY = os.getenv('API_KEY')

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")
```

```javascript
// Good - environment variables
const DATABASE_URL = process.env.DATABASE_URL;
const API_KEY = process.env.API_KEY;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}
```

### Never Do This
```python
# BAD - hardcoded secrets
API_KEY = "sk-1234567890abcdef"  # NEVER DO THIS
DATABASE_URL = "postgresql://user:password@host/db"  # NEVER DO THIS
```

---

## Testing Standards

### Test Structure
```python
# File: tests/unit/test_user_service.py
# Purpose: Unit tests for user service functionality

import pytest
from src.services.user_service import create_user, get_user

def test_create_user_success():
    """Test successful user creation with valid data."""
    user_data = {
        'email': 'test@example.com',
        'name': 'Test User'
    }

    user = create_user(user_data)

    assert user.email == 'test@example.com'
    assert user.name == 'Test User'
    assert user.id is not None

def test_create_user_invalid_email():
    """Test user creation fails with invalid email."""
    user_data = {
        'email': 'invalid-email',
        'name': 'Test User'
    }

    with pytest.raises(ValueError, match="Invalid email format"):
        create_user(user_data)
```

### Test Naming
* **Pattern:** `test_<function>_<scenario>`
* **Descriptive:** Test name should describe what is being tested
* **Coverage:** Test happy path, edge cases, and error conditions

---

## Git Commit Format

```
<type>: <short description>

<detailed explanation if needed>

Files changed:
- path/to/file1.py: Added user authentication logic
- path/to/file2.js: Updated API endpoint handlers

Questions: libor@arionetworks.com
```

**Types:** feat, fix, docs, test, refactor, perf, chore

---

**Last Updated:** $(date +%Y-%m-%d)
**Project:** ${PROJECT_NAME}
