## Development Progress (Eric Liu)

So far, the following modules and features have been implemented:

1. **User Authentication**
   - Implemented local email registration, login, and logout using **Passport.js** and **passport-local-mongoose**.
   - User schema includes email verification fields (`emailVerified`, `emailVerificationToken`) and password security rules.

2. **Email Verification Flow**
   - Generates a random token after registration and sends a verification email.
   - `/api/auth/verify/:token` endpoint verifies the email and updates user status upon success.

3. **Session Management**
   - Configured **express-session** with **connect-mongo** to store sessions in MongoDB.
   - `SESSION_SECRET` is used to sign cookies for security.
   - Handles user login state and access to protected routes.

4. **API Routes**
   - `/api/auth` includes:
     - `/register` → registration
     - `/login` → login
     - `/logout` → logout
     - `/verify/:token` → email verification
     - `/user` → get current user info
   - Input validation is implemented using **express-validator**.

5. **Backend Structure**
   - Organized following the **MVC pattern**:
     - `models/User.js` → data model
     - `routes/auth.js` → authentication routes
     - `config/passport.js` → authentication strategy
     - `services/server.js` → server initialization and route registration

---

## Environment Variables

To run the project locally, create a `.env` file in the root directory with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SESSION_SECRET` | Secret key for signing session cookies | `supersecretkey` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://localhost:27017/mystikraft` |
| `PORT` | Server listening port | `3000` |

> Note: Do **not** commit the `.env` file to the repository. Each developer should create their own `.env` based on the above example.