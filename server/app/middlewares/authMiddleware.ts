import type { Request, Response, NextFunction } from "express";

/**
 * @function authMiddleware
 * @param {Request} req - The Express request object containing the user session
 * @param {Response} res - The Express response object used to reject unauthorized requests
 * @param {NextFunction} next - The Express next function to pass control to the next middleware or controller
 * @returns {void} Proceed to the next handler if authenticated, otherwise returns a 401 JSON response
 * @description Intercepts incoming HTTP requests to verify if a valid session exists. Blocks access to protected routes if the identity payload is missing.
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const session = req.session;

  if (!session || !session.userId || !session.username) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};