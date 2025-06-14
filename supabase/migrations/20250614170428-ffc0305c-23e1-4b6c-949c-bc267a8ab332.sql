
-- Add a flexible JSONB column to store various session settings
ALTER TABLE public.sessions
ADD COLUMN session_options JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Add a column to store the IP of the first viewer for IP locking
ALTER TABLE public.sessions
ADD COLUMN first_viewer_ip TEXT;

-- Add a column to store device information with session data
ALTER TABLE public.session_data
ADD COLUMN device_info JSONB;
