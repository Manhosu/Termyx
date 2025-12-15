-- Migration: Add notifications table
-- Date: 2025-12-13

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'info', 'success', 'warning', 'error', 'system'
    title VARCHAR(200) NOT NULL,
    message TEXT,
    link VARCHAR(500), -- Optional link to navigate to
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
ON public.notifications (user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
ON public.notifications (user_id, read)
WHERE read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
ON public.notifications (created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Only system can insert notifications (via service role)
CREATE POLICY "Service role can insert notifications"
ON public.notifications FOR INSERT
TO service_role
WITH CHECK (true);

-- Add cloned_from column to templates if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'templates'
        AND column_name = 'cloned_from'
    ) THEN
        ALTER TABLE public.templates
        ADD COLUMN cloned_from UUID REFERENCES public.templates(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create index for cloned templates
CREATE INDEX IF NOT EXISTS idx_templates_cloned_from
ON public.templates (cloned_from)
WHERE cloned_from IS NOT NULL;

-- Comments
COMMENT ON TABLE public.notifications IS 'In-app notifications for users';
COMMENT ON COLUMN public.notifications.type IS 'Notification type: info, success, warning, error, system';
COMMENT ON COLUMN public.notifications.link IS 'Optional URL to navigate when notification is clicked';
COMMENT ON COLUMN public.templates.cloned_from IS 'Reference to original template if this is a clone';
