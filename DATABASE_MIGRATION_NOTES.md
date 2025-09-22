# Database Migration for Enhanced Auth Security

## Required Schema Changes

For the account lockout feature to work properly, you need to add the following columns to your `user` table:

### Prisma Schema Updates

Add these fields to your `User` model in `schema.prisma`:

```prisma
model User {
  id                 Int       @id @default(autoincrement())
  name               String
  email              String    @unique
  password           String
  rtHash             String?
  rtExpiredAt        DateTime?
  
  // New fields for account lockout
  failedLoginAttempts Int?      @default(0)
  lastFailedLogin     DateTime?
  lockedUntil         DateTime?
  
  // Timestamps
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  @@map("users")
}
```

### Manual SQL Migration (if not using Prisma migrate)

If you're managing migrations manually, run these SQL commands:

```sql
-- Add account lockout columns to users table
ALTER TABLE users 
ADD COLUMN failedLoginAttempts INT DEFAULT 0,
ADD COLUMN lastFailedLogin DATETIME NULL,
ADD COLUMN lockedUntil DATETIME NULL;

-- Add indexes for performance
CREATE INDEX idx_users_locked_until ON users(lockedUntil);
CREATE INDEX idx_users_failed_attempts ON users(failedLoginAttempts);
CREATE INDEX idx_users_last_failed_login ON users(lastFailedLogin);
```

### Using Prisma Migrate

1. Update your `schema.prisma` file with the new fields above
2. Generate and apply the migration:

```bash
npx prisma db push
# or for production:
npx prisma migrate dev --name add-account-lockout
npx prisma generate
```

## Environment Variables

Add these optional environment variables to configure lockout behavior:

```env
# Account lockout configuration
MAX_FAILED_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=30
SLIDING_WINDOW_MINUTES=15

# Rate limiting
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=5

# Security
NODE_ENV=production
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

## Indexes for Performance

The following indexes are recommended for optimal performance:

```sql
-- Indexes for auth queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rt_hash ON users(rtHash);
CREATE INDEX idx_users_rt_expired ON users(rtExpiredAt);

-- Indexes for lockout queries
CREATE INDEX idx_users_locked_until ON users(lockedUntil);
CREATE INDEX idx_users_failed_attempts ON users(failedLoginAttempts);
CREATE INDEX idx_users_last_failed_login ON users(lastFailedLogin);

-- Composite index for lockout checks
CREATE INDEX idx_users_lockout_check ON users(email, lockedUntil, failedLoginAttempts);
```

## Data Cleanup Jobs (Optional)

Consider setting up cleanup jobs to remove old audit logs and expired lockouts:

```sql
-- Clean up expired lockouts (run periodically)
UPDATE users 
SET failedLoginAttempts = 0, lastFailedLogin = NULL, lockedUntil = NULL 
WHERE lockedUntil < NOW();

-- Clean up old refresh tokens (run daily)
UPDATE users 
SET rtHash = NULL, rtExpiredAt = NULL 
WHERE rtExpiredAt < NOW();
```

## Migration Checklist

- [ ] Update Prisma schema with new fields
- [ ] Run database migration
- [ ] Update environment variables
- [ ] Test account lockout functionality
- [ ] Verify existing user accounts still work
- [ ] Test rate limiting on auth endpoints
- [ ] Verify audit logging is working
- [ ] Test password strength validation
- [ ] Check cookie-based refresh token flow

## Rollback Plan

If you need to rollback these changes:

```sql
-- Remove lockout columns
ALTER TABLE users 
DROP COLUMN failedLoginAttempts,
DROP COLUMN lastFailedLogin,
DROP COLUMN lockedUntil;

-- Drop associated indexes
DROP INDEX IF EXISTS idx_users_locked_until;
DROP INDEX IF EXISTS idx_users_failed_attempts;
DROP INDEX IF EXISTS idx_users_last_failed_login;
DROP INDEX IF EXISTS idx_users_lockout_check;
```

## Testing the New Features

### Account Lockout Testing

```bash
# Test account lockout with curl
for i in {1..6}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}'
  echo "Attempt $i"
done
```

### Rate Limiting Testing

```bash
# Test rate limiting
for i in {1..7}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}'
  echo "Request $i"
done
```

### Password Strength Testing

```bash
# Test weak password
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123"}'

# Test strong password
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test2@example.com","password":"MyStr0ng!Pass"}'
```