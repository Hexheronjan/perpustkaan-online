-- Script untuk memperbaiki schema database
-- Jalankan ini di PostgreSQL jika kolom is_approved tidak ada

-- Check if is_approved column exists, if not add it
DO $$
BEGIN
    -- Add is_approved column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'buku' AND column_name = 'is_approved'
    ) THEN
        ALTER TABLE buku ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT false;
        RAISE NOTICE 'Added is_approved column to buku table';
    ELSE
        RAISE NOTICE 'is_approved column already exists';
    END IF;
END $$;

-- Update existing records to have is_approved = true (for sample data)
UPDATE buku SET is_approved = true WHERE is_approved IS NULL OR is_approved = false;

-- Verify the column exists and has data
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'buku' 
AND column_name = 'is_approved';

-- Show sample data
SELECT id, judul, is_approved FROM buku LIMIT 5;




