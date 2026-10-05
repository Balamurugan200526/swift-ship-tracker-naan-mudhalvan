import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import AuditLog from '../models/AuditLog';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'swiftship_secret_key_2024', { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email and password are required' });
      return;
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }
    const user = await User.create({ name, email, password, role: role || 'CUSTOMER', phone });
    const token = generateToken(user._id.toString());
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    if (!user.isActive) {
      res.status(401).json({ message: 'Account is disabled. Contact support.' });
      return;
    }
    const token = generateToken(user._id.toString());
    await AuditLog.create({
      actor: user._id,
      actorName: user.name,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user._id.toString()
    });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
