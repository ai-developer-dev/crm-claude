import express from 'express';
import { UserService } from '../services/userService';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all users
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const users = await UserService.getAllUsers();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const user = await UserService.findById(id);
    
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
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { name, email, extension, is_active, role } = req.body;
    
    // Basic validation
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          error: 'Please provide a valid email address'
        });
        return;
      }
    }
    
    if (extension) {
      const extensionRegex = /^[a-zA-Z0-9]{2,10}$/;
      if (!extensionRegex.test(extension)) {
        res.status(400).json({
          error: 'Extension must be 2-10 alphanumeric characters'
        });
        return;
      }
    }
    
    const updatedUser = await UserService.updateUser(id, {
      name,
      email,
      extension,
      is_active,
      role
    });
    
    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        extension: updatedUser.extension,
        is_active: updatedUser.is_active,
        role: updatedUser.role,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await UserService.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Prevent user from deleting themselves
    if (req.user!.userId === id) {
      res.status(400).json({ 
        error: 'Cannot delete your own account' 
      });
      return;
    }
    
    const deleted = await UserService.deleteUser(id);
    
    if (deleted) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update current user profile
router.put('/me/profile', authenticateToken, async (req: any, res: any) => {
  try {
    const { name, email, extension } = req.body;
    
    // Basic validation
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          error: 'Please provide a valid email address'
        });
        return;
      }
    }
    
    if (extension) {
      const extensionRegex = /^[a-zA-Z0-9]{2,10}$/;
      if (!extensionRegex.test(extension)) {
        res.status(400).json({
          error: 'Extension must be 2-10 alphanumeric characters'
        });
        return;
      }
    }
    
    const updatedUser = await UserService.updateUser(req.user!.userId, {
      name,
      email,
      extension
    });
    
    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        extension: updatedUser.extension,
        is_active: updatedUser.is_active,
        role: updatedUser.role,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;