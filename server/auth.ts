import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import { User } from '@shared/schema';
import { Request, Response, NextFunction } from 'express';

// Configure passport to use a local strategy
export function setupPassport() {
  // Serialize user for the session
  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Local strategy for username/password authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Find the user by username
        const user = await storage.getUserByUsername(username);

        // If user not found
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        // Authentication succeeded
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  return passport;
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // For TypeScript - add the isAuthenticated method from passport
  interface AuthenticatedRequest extends Request {
    isAuthenticated(): boolean;
    user?: any;
  }
  
  const authReq = req as AuthenticatedRequest;
  
  if (authReq.isAuthenticated && authReq.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: 'Unauthorized' });
}

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Check if a user is already registered with the given username
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const user = await storage.getUserByUsername(username);
  return !user;
}