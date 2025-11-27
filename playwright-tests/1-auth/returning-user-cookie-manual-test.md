# Manual Test Guide: Returning User Cookie

## Quick Browser Console Test

Open your browser's developer console (F12) and run these commands to manually verify the cookie:

### 1. Check if cookie exists
```javascript
document.cookie.split(';').find(c => c.trim().startsWith('returning_user='))
```

### 2. Check cookie value
```javascript
document.cookie.split(';').find(c => c.trim().startsWith('returning_user='))?.split('=')[1]
```

### 3. List all cookies
```javascript
document.cookie.split(';').map(c => c.trim())
```

## Test Scenarios

### Scenario 1: Cookie set after login
1. Clear all cookies: `document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));`
2. Navigate to `/sign-in`
3. Log in with valid credentials
4. Check console: `document.cookie.includes('returning_user=true')` should return `true`

### Scenario 2: Cookie set after sign-up
1. Clear all cookies (same as above)
2. Navigate to `/sign-up`
3. Complete sign-up form
4. After successful sign-up, check: `document.cookie.includes('returning_user=true')` should return `true`

### Scenario 3: Cookie cleared after logout
1. Log in (cookie should exist)
2. Log out
3. Check: `document.cookie.includes('returning_user')` should return `false`

### Scenario 4: Redirect to sign-in when cookie exists but not logged in
1. Log in (sets cookie)
2. Manually clear auth token cookie but keep returning_user:
   ```javascript
   // Clear auth-token-data but keep returning_user
   document.cookie = "auth-token-data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
   ```
3. Navigate to home page (`/`)
4. Should automatically redirect to `/sign-in`




