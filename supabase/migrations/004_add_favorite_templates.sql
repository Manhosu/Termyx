-- Migration: Add favorite_templates column to users table
-- This column stores an array of template IDs that the user has favorited
-- Date: 2025-12-13

-- Add favorite_templates column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'favorite_templates'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN favorite_templates UUID[] DEFAULT '{}';
    END IF;
END $$;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_favorite_templates
ON public.users USING GIN (favorite_templates);

-- Add deleted_at column for soft deletes (used by account deletion feature)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
    END IF;
END $$;

-- Add index for deleted users (for cleanup queries)
CREATE INDEX IF NOT EXISTS idx_users_deleted_at
ON public.users (deleted_at)
WHERE deleted_at IS NOT NULL;

-- Create avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for avatars bucket - users can upload their own avatars
DO $$
BEGIN
    -- Policy for authenticated users to upload their own avatars
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Users can upload their own avatar'
    ) THEN
        CREATE POLICY "Users can upload their own avatar"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'avatars'
            AND (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    -- Policy for authenticated users to update their own avatars
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Users can update their own avatar'
    ) THEN
        CREATE POLICY "Users can update their own avatar"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (
            bucket_id = 'avatars'
            AND (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    -- Policy for authenticated users to delete their own avatars
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Users can delete their own avatar'
    ) THEN
        CREATE POLICY "Users can delete their own avatar"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
            bucket_id = 'avatars'
            AND (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    -- Policy for public avatar access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Avatars are publicly accessible'
    ) THEN
        CREATE POLICY "Avatars are publicly accessible"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'avatars');
    END IF;
END $$;

-- Comment on new columns
COMMENT ON COLUMN public.users.favorite_templates IS 'Array of template IDs that user has favorited (max 50)';
COMMENT ON COLUMN public.users.deleted_at IS 'Soft delete timestamp - account scheduled for deletion';
