import express from 'express';
import { UserService } from '../services/userService';
import { generateToken } from '../utils/auth';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// Register new user
router.post('/register', async (req: any, res: any) => {
  try {
    const { name, email, password, extension } = req.body;
    
    // Validation
    if (!name || !email || !password || !extension) {
      return res.status(400).json({
        error: 'All fields are required: name, email, password, extension'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Please provide a valid email address'
      });
    }
    
    // Extension validation (alphanumeric, 2-10 characters)
    const extensionRegex = /^[a-zA-Z0-9]{2,10}$/;
    if (!extensionRegex.test(extension)) {
      return res.status(400).json({
        error: 'Extension must be 2-10 alphanumeric characters'
      });
    }
    
    const user = await UserService.createUser({ name, email, password, extension });
    
    const token = generateToken({
      userId: user.id,
      email: user.email
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        extension: user.extension,
        is_active: user.is_active
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }
    
    const user = await UserService.authenticateUser(email, password);
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }
    
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account is disabled. Please contact administrator.'
      });
    }
    
    const token = generateToken({
      userId: user.id,
      email: user.email
    });
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        extension: user.extension,
        is_active: user.is_active
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req: any, res: any) => {
  try {
    const user = await UserService.findById(req.user!.userId);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        extension: user.extension,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req: any, res: any) => {
  try {
    const user = await UserService.findById(req.user!.userId);
    
    if (!user || !user.is_active) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }
    
    const token = generateToken({
      userId: user.id,
      email: user.email
    });
    
    res.json({
      message: 'Token refreshed successfully',
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;