-- Script untuk menambahkan kolom yang hilang di database PostgreSQL
-- Jalankan ini di PostgreSQL

-- Add is_approved column to buku table if it doesn't exist
DO $$
BEGIN
    -- Add is_approved column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'buku' AND column_name = 'is_approved'
    ) THEN
        ALTER TABLE buku ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT true;
        RAISE NOTICE 'Added is_approved column to buku table';
    ELSE
        RAISE NOTICE 'is_approved column already exists in buku table';
    END IF;
END $$;

-- Add updated_at column to genre table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'genre' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE genre ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added updated_at column to genre table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in genre table';
    END IF;
END $$;

-- Add updated_at column to tags table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tags' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE tags ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added updated_at column to tags table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in tags table';
    END IF;
END $$;

-- Verify the changes
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('buku', 'genre', 'tags')
AND column_name IN ('is_approved', 'updated_at')
ORDER BY table_name, column_name;

-- Show current buku table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'buku'
ORDER BY ordinal_position;



