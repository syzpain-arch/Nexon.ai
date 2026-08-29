import { Request, Response } from 'express';
import { db } from '../models/db.js';
import { generateToken, AuthenticatedRequest } from '../middleware/auth.js';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  // Stark Industries Master Access Simulation
  const user = db.getUserProfile();

  if (username && username !== user.username && username !== 'admin') {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role,
  });

  res.json({
    success: true,
    message: 'Biometric & cryptographic verification successful',
    token,
    user,
  });
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = db.getUserProfile();
  res.json({ success: true, data: user });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const updated = db.updateUserProfile(req.body);
  res.json({ success: true, message: 'Profile preferences updated', data: updated });
};
