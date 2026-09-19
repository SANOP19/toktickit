import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/auth.js";

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware: Authenticate Bearer JWT token from Authorization header.
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Missing or invalid authorization header.",
      },
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Token has expired or is invalid.",
      },
    });
    return;
  }

  req.user = payload;
  next();
}

/**
 * Middleware: Ensure the authenticated user account is active.
 */
export function requireActive(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || !req.user.isActive) {
    res.status(401).json({
      error: {
        code: "ACCOUNT_INACTIVE",
        message: "Account is inactive. Please contact your system administrator.",
      },
    });
    return;
  }
  next();
}

/**
 * Middleware: Intercept users who must change their initial password.
 * Blocks all routes except password change and logout.
 */
export function requirePasswordChanged(req: Request, res: Response, next: NextFunction): void {
  if (req.user && req.user.mustChangePassword) {
    // Whitelist path for password change or logout
    const path = req.path;
    if (path === "/api/auth/change-password" || path === "/api/auth/logout" || path === "/change-password" || path === "/logout") {
      next();
      return;
    }

    res.status(403).json({
      error: {
        code: "PASSWORD_CHANGE_REQUIRED",
        message: "You must change your initial password before accessing the system.",
      },
    });
    return;
  }
  next();
}

/**
 * Middleware: Require one or more permitted roles.
 */
export function requireRole(...allowedRoles: Array<"REQUESTER" | "IT_STAFF" | "ADMINISTRATOR">) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required.",
        },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to perform this action.",
        },
      });
      return;
    }

    next();
  };
}
