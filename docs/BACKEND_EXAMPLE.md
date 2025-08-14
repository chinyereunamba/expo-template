# Backend Implementation Example

This document provides example implementations for the required API endpoints using Node.js/Express.js and TypeScript.

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   └── userController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── validation.ts
│   ├── models/
│   │   └── User.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   └── user.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── response.ts
│   └── app.ts
├── package.json
└── tsconfig.json
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.9.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.8.1",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/bcryptjs": "^2.4.2",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/cors": "^2.8.13",
    "@types/multer": "^1.4.7",
    "typescript": "^5.1.6",
    "ts-node": "^10.9.1"
  }
}
```

## 🔧 Core Setup

### app.ts

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:19006',
    ],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);

// Error handling
app.use(errorHandler);

export default app;
```

## 🔐 Authentication Controller

### controllers/authController.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { createResponse, createErrorResponse } from '../utils/response';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';

export class AuthController {
  // POST /auth/login
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res
          .status(401)
          .json(
            createErrorResponse(
              'Invalid credentials',
              'INVALID_CREDENTIALS',
              401
            )
          );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res
          .status(401)
          .json(
            createErrorResponse(
              'Invalid credentials',
              'INVALID_CREDENTIALS',
              401
            )
          );
      }

      // Generate tokens
      const { token, refreshToken } = generateTokens(user.id);

      // Save refresh token
      await User.updateRefreshToken(user.id, refreshToken);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json(
        createResponse(
          {
            user: userWithoutPassword,
            token,
            refreshToken,
          },
          'Login successful'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/register
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res
          .status(409)
          .json(
            createErrorResponse('Email already exists', 'EMAIL_EXISTS', 409)
          );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      // Generate tokens
      const { token, refreshToken } = generateTokens(user.id);

      // Save refresh token
      await User.updateRefreshToken(user.id, refreshToken);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json(
        createResponse(
          {
            user: userWithoutPassword,
            token,
            refreshToken,
          },
          'Registration successful'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/refresh
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res
          .status(401)
          .json(
            createErrorResponse('Refresh token required', 'TOKEN_REQUIRED', 401)
          );
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) {
        return res
          .status(401)
          .json(
            createErrorResponse('Invalid refresh token', 'INVALID_TOKEN', 401)
          );
      }

      // Check if user exists and token matches
      const user = await User.findById(decoded.userId);
      if (!user || user.refreshToken !== refreshToken) {
        return res
          .status(401)
          .json(
            createErrorResponse('Invalid refresh token', 'INVALID_TOKEN', 401)
          );
      }

      // Generate new tokens
      const tokens = generateTokens(user.id);

      // Update refresh token
      await User.updateRefreshToken(user.id, tokens.refreshToken);

      res.json(createResponse(tokens, 'Token refreshed'));
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/logout
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (userId) {
        // Clear refresh token
        await User.updateRefreshToken(userId, null);
      }

      res.json(createResponse(null, 'Logged out successfully'));
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/forgot-password
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        return res.json(createResponse(null, 'Password reset email sent'));
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password-reset' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      // Save reset token
      await User.updatePasswordResetToken(user.id, resetToken);

      // TODO: Send email with reset link
      // await sendPasswordResetEmail(user.email, resetToken);

      res.json(createResponse(null, 'Password reset email sent'));
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/reset-password
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      // Verify reset token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      if (decoded.type !== 'password-reset') {
        return res
          .status(400)
          .json(
            createErrorResponse('Invalid reset token', 'INVALID_TOKEN', 400)
          );
      }

      // Find user and verify token
      const user = await User.findById(decoded.userId);
      if (!user || user.passwordResetToken !== token) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              'Invalid or expired reset token',
              'INVALID_TOKEN',
              400
            )
          );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update password and clear reset token
      await User.updatePassword(user.id, hashedPassword);
      await User.updatePasswordResetToken(user.id, null);

      res.json(createResponse(null, 'Password reset successfully'));
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res
          .status(400)
          .json(
            createErrorResponse('Reset token expired', 'TOKEN_EXPIRED', 400)
          );
      }
      next(error);
    }
  }
}
```

## 👤 User Controller

### controllers/userController.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { createResponse, createErrorResponse } from '../utils/response';
import { uploadToCloudinary } from '../utils/upload';

export class UserController {
  // GET /user/profile
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json(createErrorResponse('User not found', 'USER_NOT_FOUND', 404));
      }

      // Remove sensitive data
      const { password, refreshToken, passwordResetToken, ...userProfile } =
        user;

      res.json(createResponse(userProfile, 'Profile retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  // PUT /user/profile
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const updates = req.body;

      // Remove fields that shouldn't be updated this way
      delete updates.password;
      delete updates.email; // Require separate email change flow
      delete updates.id;

      const updatedUser = await User.update(userId, updates);
      if (!updatedUser) {
        return res
          .status(404)
          .json(createErrorResponse('User not found', 'USER_NOT_FOUND', 404));
      }

      // Remove sensitive data
      const { password, refreshToken, passwordResetToken, ...userProfile } =
        updatedUser;

      res.json(createResponse(userProfile, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  // POST /user/change-password
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json(createErrorResponse('User not found', 'USER_NOT_FOUND', 404));
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isValidPassword) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              'Current password is incorrect',
              'INVALID_PASSWORD',
              400
            )
          );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await User.updatePassword(userId, hashedPassword);

      res.json(createResponse(null, 'Password changed successfully'));
    } catch (error) {
      next(error);
    }
  }

  // POST /user/avatar
  static async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        return res
          .status(400)
          .json(createErrorResponse('No file uploaded', 'FILE_REQUIRED', 400));
      }

      // Upload to cloud storage (e.g., Cloudinary, AWS S3)
      const avatarUrl = await uploadToCloudinary(file.buffer, {
        folder: 'avatars',
        public_id: `avatar_${userId}`,
        transformation: [
          { width: 200, height: 200, crop: 'fill' },
          { quality: 'auto' },
        ],
      });

      // Update user avatar
      await User.update(userId, { avatar: avatarUrl });

      res.json(createResponse({ avatarUrl }, 'Avatar uploaded successfully'));
    } catch (error) {
      next(error);
    }
  }

  // DELETE /user/account
  static async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { password } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json(createErrorResponse('User not found', 'USER_NOT_FOUND', 404));
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              'Password is incorrect',
              'INVALID_PASSWORD',
              400
            )
          );
      }

      // Delete user account
      await User.delete(userId);

      res.json(createResponse(null, 'Account deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}
```

## 🛡️ Middleware

### middleware/auth.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { createErrorResponse } from '../utils/response';

interface JwtPayload {
  userId: string;
  type: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res
        .status(401)
        .json(
          createErrorResponse('Access token required', 'TOKEN_REQUIRED', 401)
        );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (decoded.type !== 'access') {
      return res
        .status(401)
        .json(createErrorResponse('Invalid token type', 'INVALID_TOKEN', 401));
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res
        .status(401)
        .json(createErrorResponse('User not found', 'USER_NOT_FOUND', 401));
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json(createErrorResponse('Token expired', 'TOKEN_EXPIRED', 401));
    }

    return res
      .status(401)
      .json(createErrorResponse('Invalid token', 'INVALID_TOKEN', 401));
  }
};
```

### middleware/validation.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createErrorResponse } from '../utils/response';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res
        .status(400)
        .json(
          createErrorResponse('Validation error', 'VALIDATION_ERROR', 400, {
            details,
          })
        );
    }

    next();
  };
};

// Validation schemas
export const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),

  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).required(),
  }),
};
```

## 🔧 Utilities

### utils/response.ts

```typescript
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
  requestId?: string;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
  timestamp: string;
  path?: string;
  requestId?: string;
}

export const createResponse = <T>(
  data: T,
  message: string = 'Success',
  requestId?: string
): ApiResponse<T> => ({
  data,
  message,
  success: true,
  timestamp: new Date().toISOString(),
  requestId,
});

export const createErrorResponse = (
  message: string,
  code: string,
  statusCode: number,
  details?: any,
  path?: string,
  requestId?: string
): ApiError => ({
  message,
  code,
  statusCode,
  details,
  timestamp: new Date().toISOString(),
  path,
  requestId,
});
```

### utils/jwt.ts

```typescript
import jwt from 'jsonwebtoken';

export const generateTokens = (userId: string) => {
  const token = jwt.sign({ userId, type: 'access' }, process.env.JWT_SECRET!, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  return { token, refreshToken };
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
  } catch {
    return null;
  }
};
```

## 🗄️ Database Model Example

### models/User.ts (using Prisma)

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserData {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isEmailVerified: boolean;
  refreshToken?: string;
  passwordResetToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  static async findByEmail(email: string): Promise<UserData | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  static async findById(id: string): Promise<UserData | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  static async create(data: Partial<UserData>): Promise<UserData> {
    return prisma.user.create({ data });
  }

  static async update(id: string, data: Partial<UserData>): Promise<UserData> {
    return prisma.user.update({ where: { id }, data });
  }

  static async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  static async updateRefreshToken(
    id: string,
    refreshToken: string | null
  ): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

  static async updatePassword(id: string, password: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { password },
    });
  }

  static async updatePasswordResetToken(
    id: string,
    token: string | null
  ): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { passwordResetToken: token },
    });
  }
}
```

## 🚀 Routes Setup

### routes/auth.ts

```typescript
import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validate, schemas } from '../middleware/validation';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts',
});

router.post(
  '/login',
  authLimiter,
  validate(schemas.login),
  AuthController.login
);
router.post('/register', validate(schemas.register), AuthController.register);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.post(
  '/forgot-password',
  validate(schemas.forgotPassword),
  AuthController.forgotPassword
);
router.post(
  '/reset-password',
  validate(schemas.resetPassword),
  AuthController.resetPassword
);

export default router;
```

### routes/user.ts

```typescript
import { Router } from 'express';
import multer from 'multer';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// All user routes require authentication
router.use(authenticateToken);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.post(
  '/change-password',
  validate(schemas.changePassword),
  UserController.changePassword
);
router.post('/avatar', upload.single('avatar'), UserController.uploadAvatar);
router.delete('/account', UserController.deleteAccount);

export default router;
```

## 🌍 Environment Variables

Create a `.env` file:

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mydb"

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# CORS
ALLOWED_ORIGINS=http://localhost:19006,http://localhost:3000

# File Upload (if using Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🚀 Running the Server

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Run production
npm start
```

This example provides a complete backend implementation that matches the mobile app's API requirements. Adapt it to your specific database and deployment needs.
