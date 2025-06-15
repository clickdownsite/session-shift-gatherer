
-- 1. Add a flow_id column to the sessions table (links a session to a flow).
ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS flow_id uuid;

-- 2. Add a current_flow_step column to the sessions table to track user progress.
ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS current_flow_step integer DEFAULT 0 NOT NULL;

-- 3. Add/alter the "steps" field (jsonb) to page_flows if not already present, to store an array of step metadata and subpage IDs.
ALTER TABLE public.page_flows
ADD COLUMN IF NOT EXISTS steps JSONB DEFAULT '[]'::jsonb;

-- Optionally, add a name if missing for clarity (already exists but safety included).
ALTER TABLE public.page_flows
ADD COLUMN IF NOT EXISTS name TEXT;

-- 4. Update RLS policies only if you want to restrict editing flows to admins later.
