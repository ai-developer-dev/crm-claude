-- Add user role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL;

-- Add check constraint for valid roles
ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (role IN ('admin', 'user'));

-- Create index on role for faster lookups
CREATE INDEX idx_users_role ON users(role);

-- Update existing users - make the first user an admin
UPDATE users SET role = 'admin' WHERE id = (SELECT id FROM users ORDER BY created_at LIMIT 1);