
-- Add real-time session tracking capabilities
CREATE TABLE public.live_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users,
  page_url TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enhanced interaction tracking for live sessions
CREATE TABLE public.live_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'mouse_move', 'click', 'scroll', 'keystroke', 'focus', 'blur', etc.
  element_selector TEXT,
  element_content TEXT,
  coordinates JSONB, -- {x, y, viewport_width, viewport_height}
  timestamp_offset INTEGER NOT NULL, -- milliseconds from session start
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Screen recordings and snapshots
CREATE TABLE public.session_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  recording_type TEXT NOT NULL, -- 'dom_snapshot', 'video_chunk', 'screenshot'
  data JSONB NOT NULL,
  timestamp_offset INTEGER NOT NULL,
  file_path TEXT, -- for large files stored in Supabase Storage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- A/B test configurations
CREATE TABLE public.ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  variants JSONB NOT NULL, -- Array of variant configurations
  traffic_split JSONB NOT NULL, -- Percentage allocation per variant
  target_pages TEXT[], -- URLs where test should run
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- A/B test assignments
CREATE TABLE public.ab_test_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  variant_id TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Conversion goals and events
CREATE TABLE public.conversion_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL, -- 'page_visit', 'click_element', 'form_submit', 'time_on_page'
  target_selector TEXT, -- CSS selector for element-based goals
  target_value JSONB, -- Goal-specific configuration
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Conversion events
CREATE TABLE public.conversion_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES public.conversion_goals(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  ab_test_id UUID REFERENCES public.ab_tests(id),
  variant_id TEXT,
  event_data JSONB DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Heatmap data aggregation
CREATE TABLE public.heatmap_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL,
  element_selector TEXT,
  interaction_type TEXT NOT NULL, -- 'click', 'hover', 'scroll'
  coordinates JSONB NOT NULL, -- {x, y, viewport_width, viewport_height}
  count INTEGER NOT NULL DEFAULT 1,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page_url, element_selector, interaction_type, coordinates)
);

-- Enable RLS on all new tables
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heatmap_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for live_sessions
CREATE POLICY "Users can manage their live sessions" 
  ON public.live_sessions 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Public sessions can be viewed" 
  ON public.live_sessions 
  FOR SELECT 
  USING (true); -- For demo purposes, make sessions viewable

-- RLS policies for live_interactions
CREATE POLICY "Anyone can record live interactions" 
  ON public.live_interactions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Session owners can view interactions" 
  ON public.live_interactions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.live_sessions 
      WHERE live_sessions.id = live_interactions.session_id 
      AND (live_sessions.user_id = auth.uid() OR live_sessions.user_id IS NULL)
    )
  );

-- RLS policies for session_recordings
CREATE POLICY "Anyone can create recordings" 
  ON public.session_recordings 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Session owners can view recordings" 
  ON public.session_recordings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.live_sessions 
      WHERE live_sessions.id = session_recordings.session_id 
      AND (live_sessions.user_id = auth.uid() OR live_sessions.user_id IS NULL)
    )
  );

-- RLS policies for A/B tests
CREATE POLICY "Users can manage their A/B tests" 
  ON public.ab_tests 
  FOR ALL 
  USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view active A/B tests" 
  ON public.ab_tests 
  FOR SELECT 
  USING (is_active = true);

-- RLS policies for A/B test assignments
CREATE POLICY "Anyone can create A/B test assignments" 
  ON public.ab_test_assignments 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Test creators can view assignments" 
  ON public.ab_test_assignments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.ab_tests 
      WHERE ab_tests.id = ab_test_assignments.test_id 
      AND ab_tests.created_by = auth.uid()
    )
  );

-- RLS policies for conversion goals
CREATE POLICY "Users can manage their conversion goals" 
  ON public.conversion_goals 
  FOR ALL 
  USING (auth.uid() = created_by);

-- RLS policies for conversion events
CREATE POLICY "Anyone can record conversion events" 
  ON public.conversion_events 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Goal creators can view conversion events" 
  ON public.conversion_events 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversion_goals 
      WHERE conversion_goals.id = conversion_events.goal_id 
      AND conversion_goals.created_by = auth.uid()
    )
  );

-- RLS policies for heatmap data
CREATE POLICY "Anyone can contribute to heatmap data" 
  ON public.heatmap_data 
  FOR ALL 
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_live_sessions_token ON public.live_sessions(session_token);
CREATE INDEX idx_live_sessions_active ON public.live_sessions(is_active);
CREATE INDEX idx_live_interactions_session ON public.live_interactions(session_id);
CREATE INDEX idx_live_interactions_timestamp ON public.live_interactions(timestamp_offset);
CREATE INDEX idx_session_recordings_session ON public.session_recordings(session_id);
CREATE INDEX idx_ab_test_assignments_session ON public.ab_test_assignments(session_id);
CREATE INDEX idx_conversion_events_goal ON public.conversion_events(goal_id);
CREATE INDEX idx_heatmap_data_page ON public.heatmap_data(page_url);

-- Enable realtime for live interaction tracking
ALTER TABLE public.live_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.live_interactions REPLICA IDENTITY FULL;
ALTER TABLE public.session_recordings REPLICA IDENTITY FULL;
ALTER TABLE public.conversion_events REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER publication supabase_realtime ADD TABLE public.live_sessions;
ALTER publication supabase_realtime ADD TABLE public.live_interactions;
ALTER publication supabase_realtime ADD TABLE public.session_recordings;
ALTER publication supabase_realtime ADD TABLE public.conversion_events;
