# Todo API – Express.js 🚀

**Enterprise-grade Todo API** dengan **advanced authentication system** dan **comprehensive security features**. API ini mengelola **Users**, **Todos**, dan **Todo Items** dengan **production-ready security**, **audit logging**, dan **rate limiting**.

---

## 🛡️ Advanced Security Features

### **Authentication & Authorization**
- **JWT-based Auth**: Access Token & Refresh Token dengan automatic rotation
- **Cookie-based Refresh**: HttpOnly cookies untuk enhanced security
- **Account Lockout**: Automatic lockout setelah 5 failed login attempts
- **Rate Limiting**: Protection terhadap brute force attacks

### **Security Monitoring**
- **Comprehensive Audit Logging**: 21+ security events dengan structured JSON
- **Attack Detection**: SQL injection, XSS, dan path traversal pattern detection
- **Request Metadata**: IP tracking, User-Agent analysis, session monitoring
- **Suspicious Activity Alerts**: Real-time security event logging

### **Password Security**
- **Strong Password Policy**: 8+ chars, uppercase, lowercase, numbers, special chars
- **Common Pattern Detection**: Protection against weak passwords (123456, password, etc.)
- **Password Strength Scoring**: 0-6 scale dengan detailed feedback
- **Bcrypt Hashing**: Industry-standard password hashing

### **API Security**
- **CSRF Protection**: Double submit cookie pattern (optional)
- **Environment-aware Cookies**: Secure cookies di production
- **Input Validation**: Comprehensive validation dengan express-validator
- **Error Handling**: Consistent error responses dengan proper status codes

## ✨ Core Features

- **🔐 Advanced Authentication**: JWT dengan refresh token rotation & account lockout
- **👥 User Management**: CRUD operations dengan enhanced security
- **📋 Todo Management**: Complete todo system dengan item management
- **📊 Audit Logging**: Comprehensive security event logging
- **⚡ Rate Limiting**: Protection terhadap abuse dan attacks
- **🔍 Validation**: Input validation dengan detailed error messages
- **📱 Cookie Support**: Dual support untuk body dan cookie-based auth

---

## ⚙️ Konfigurasi & Setup

### Database Migration (REQUIRED)

**IMPORTANT**: Enhanced auth system membutuhkan database schema updates untuk account lockout feature.

```sql
-- Add account lockout fields to users table
ALTER TABLE users 
ADD COLUMN failedLoginAttempts INT DEFAULT 0,
ADD COLUMN lastFailedLogin DATETIME NULL,
ADD COLUMN lockedUntil DATETIME NULL;

-- Add indexes for performance
CREATE INDEX idx_users_locked_until ON users(lockedUntil);
CREATE INDEX idx_users_failed_attempts ON users(failedLoginAttempts);
```

### Environment Variables

```env
# Server Configuration
APP_PORT=3000
NODE_ENV=production  # IMPORTANT: Set to 'production' for secure cookies
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# JWT Configuration
JWT_SECRET_ACCESS_TOKEN=your_strong_access_secret_here
JWT_SECRET_REFRESH_TOKEN=your_strong_refresh_secret_here

# Security Configuration
HASH_SECRET=your_crypto_hash_secret
API_KEY=your_api_key  # Optional: for API key authentication

# Account Lockout Configuration (Optional)
MAX_FAILED_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=30
SLIDING_WINDOW_MINUTES=15

# Rate Limiting Configuration (Optional)
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=5
TOKEN_REFRESH_LIMIT=10

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/todo_db?schema=public"
```

### Installation & Setup

```bash
# Install dependencies
npm install

# Required: Install rate limiting (if not already installed)
npm install express-rate-limit

# Database setup
npx prisma generate
npx prisma migrate dev --name add-account-lockout  # Run migration for new fields
# OR: npx prisma db push  # For development

# Run application
npm run dev              # development mode
npm start                # production mode
```

### Production Considerations

- **Set `NODE_ENV=production`** untuk secure cookies
- **Use Redis** untuk rate limiting di multi-instance deployments
- **Setup log rotation** untuk audit logs
- **Monitor security metrics** untuk account lockouts dan failed attempts

---

## 📚 API Endpoints

### 🔐 Authentication (Enhanced Security)

#### `POST /auth/login`
**Login with account lockout protection & rate limiting**
- **Rate Limit**: 5 requests per 15 minutes
- **Account Lockout**: After 5 failed attempts (30 min lockout)
- **Audit Logging**: All login attempts logged with IP/User-Agent
- **Cookie Support**: Sets HttpOnly refresh token cookie

```json
// Request
{
  "email": "user@example.com",
  "password": "MyStr0ng!Pass"
}

// Success Response (200)
{
  "success": true,
  "message": "login successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expired_in": 1640995200
  }
}

// Account Locked Response (423)
{
  "success": false,
  "error": "Account locked",
  "message": "Account temporarily locked due to multiple failed login attempts",
  "remainingTime": 25,
  "retryAfter": 1500
}

// Rate Limited Response (429)
{
  "success": false,
  "error": "Too many authentication attempts",
  "message": "Please try again after 15 minutes",
  "retryAfter": 900
}
```

#### `POST /auth/register`
**Register with strong password policy**
- **Password Requirements**: 8+ chars, uppercase, lowercase, numbers, special chars
- **Pattern Detection**: Blocks common weak passwords
- **Rate Limit**: 5 requests per 15 minutes

```json
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "MyStr0ng!Pass"
}

// Password Validation Error (400)
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter",
    "Password must contain at least one special character (!@#$%^&*...)"
  ]
}
```

#### `POST /auth/token`
**Refresh token with cookie & body support**
- **Dual Support**: Reads from httpOnly cookie OR request body
- **Token Rotation**: Issues new refresh token on each refresh
- **Rate Limit**: 10 requests per 5 minutes

```json
// Request (body method)
{
  "grant_type": "refresh_token",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}

// OR: Cookie method (more secure)
// Reads from "rt" httpOnly cookie automatically
{
  "grant_type": "refresh_token"
}
```

#### `DELETE /auth/logout` 🔒
**Secure logout (requires authentication)**
- **Authentication Required**: Bearer token in Authorization header
- **Audit Logging**: Logout events logged
- **Cookie Cleanup**: Clears refresh token cookie

### 👥 User Management

- `GET /users` → List all users
- `GET /users/:id` → Get user by ID

### 📋 Todo Management

- `GET /todos` → List todos
- `POST /todos` → Create todo
- `GET /todos/:id` → Get todo details
- `PUT /todos/:id` → Update todo
- `DELETE /todos/:id` → Delete todo

### 📁 Todo Items

- `GET /todosItems` → List todo items
- `POST /todosItems` → Create todo item
- `GET /todosItems/:id` → Get todo item
- `PUT /todosItems/:id` → Update todo item
- `DELETE /todosItems/:id` → Delete todo item

---

## 🔒 Security Features Detail

### Rate Limiting
- **Login/Register**: 5 requests per 15 minutes per IP
- **Token Refresh**: 10 requests per 5 minutes per IP
- **Sensitive Operations**: 3 requests per hour per IP
- **Custom Headers**: `RateLimit-*` headers dalam response

### Account Lockout
- **Trigger**: 5 consecutive failed login attempts
- **Duration**: 30 minutes lockout
- **Sliding Window**: 15 minutes untuk reset failed attempts
- **Manual Unlock**: Admin function tersedia

### Audit Logging
**21+ Security Events Tracked:**
- `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`
- `REGISTER`, `TOKEN_REFRESH`, `TOKEN_REFRESH_FAILED`
- `UNAUTHORIZED_ACCESS`, `ACCOUNT_LOCKED`
- `SUSPICIOUS_ACTIVITY`, `CSRF_ATTACK`, `RATE_LIMIT_EXCEEDED`

**Logged Information:**
```json
{
  "level": "info",
  "message": "Authentication Success - LOGIN_SUCCESS",
  "event": "LOGIN_SUCCESS",
  "userId": 123,
  "email": "user@example.com",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "method": "POST",
  "url": "/auth/login"
}
```

### Attack Detection
**Automatically detects & logs:**
- SQL Injection attempts (`UNION`, `SELECT`, `DROP`, etc.)
- XSS attempts (`<script>`, `javascript:`, `onclick`, etc.)
- Path Traversal (`../`, `..\`)
- Common attack patterns

---

## 🧪 Testing & Verification

### Test Account Lockout
```bash
# Test account lockout (6 failed attempts)
for i in {1..6}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}'
  echo "Attempt $i"
done
```

### Test Rate Limiting
```bash
# Test rate limiting (7 requests quickly)
for i in {1..7}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}'
  echo "Request $i"
done
```

### Test Password Strength
```bash
# Test weak password (should fail)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123"}'

# Test strong password (should succeed)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test2@example.com","password":"MyStr0ng!Pass"}'
```

### Test Cookie-based Refresh
```bash
# 1. Login (receives httpOnly cookie)
curl -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"MyStr0ng!Pass"}'

# 2. Refresh token using cookie
curl -b cookies.txt -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"grant_type":"refresh_token"}'
```

---

## 📊 Monitoring & Logs

### Security Metrics to Track
- **Failed login attempts** per IP/user
- **Account lockouts** per day/week
- **Rate limit violations** by endpoint
- **Suspicious activity patterns**
- **Password strength distribution**
- **Token refresh frequency**

### Log Files Location
Berdasarkan winston configuration:
- **Error logs**: `./logs/error.log`
- **Combined logs**: `./logs/combined.log`
- **Console output**: Development mode

### Production Monitoring
Untuk production, consider:
- **ELK Stack** (Elasticsearch, Logstash, Kibana) untuk log analysis
- **Grafana + Prometheus** untuk real-time metrics
- **Alert notifications** untuk critical security events

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Set `NODE_ENV=production`
- [ ] Configure strong JWT secrets
- [ ] Run database migration untuk account lockout fields
- [ ] Install `express-rate-limit` dependency
- [ ] Setup log rotation
- [ ] Configure HTTPS untuk secure cookies

### Security Checklist
- [ ] Test rate limiting on all auth endpoints
- [ ] Verify account lockout functionality
- [ ] Check audit logging is working
- [ ] Test password strength validation
- [ ] Verify cookie security settings
- [ ] Test CSRF protection (if enabled)
- [ ] Confirm error handling doesn't leak sensitive info

### Performance Checklist
- [ ] Database indexes created
- [ ] Redis setup untuk production rate limiting (recommended)
- [ ] Log rotation configured
- [ ] Monitoring dashboards setup

---

## 📖 Additional Documentation

- [`AUTH_REFACTOR_NOTES.md`](./AUTH_REFACTOR_NOTES.md) - Detailed technical documentation
- [`DATABASE_MIGRATION_NOTES.md`](./DATABASE_MIGRATION_NOTES.md) - Database schema updates
- [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) - Complete implementation overview

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

**🎉 Production-Ready Authentication System**

Dengan implementasi ini, Anda memiliki enterprise-grade authentication system yang siap untuk production dengan comprehensive security features, detailed logging, dan proper monitoring capabilities.
