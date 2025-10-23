// Database Configuration
// Copy this file to .env.local and update with your PostgreSQL credentials

export const dbConfig = {
  // Option 1: Use DATABASE_URL (recommended for production)
  // DATABASE_URL: 'postgresql://username:password@localhost:5432/perpustakaan',
  
  // Option 2: Individual settings (for development)
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'perpustakaan',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

// Example .env.local file content:
/*
DATABASE_URL=postgresql://postgres:password@localhost:5432/perpustakaan
# OR
DB_HOST=localhost
DB_PORT=5432
DB_NAME=perpustakaan
DB_USER=postgres
DB_PASSWORD=your_password
*/
