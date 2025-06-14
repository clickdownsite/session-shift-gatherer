
-- Create static_forms table for standalone data collection
CREATE TABLE public.static_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  html TEXT DEFAULT '',
  css TEXT DEFAULT '',
  javascript TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create static_form_submissions table for form responses
CREATE TABLE public.static_form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES public.static_forms(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_interactions table for detailed tracking
CREATE TABLE public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  form_id UUID REFERENCES public.static_forms(id),
  interaction_type TEXT NOT NULL, -- 'click', 'keypress', 'mousemove', 'scroll', etc.
  element_selector TEXT,
  interaction_data JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_url TEXT,
  ip_address TEXT
);

-- Create page_flows table for conditional navigation
CREATE TABLE public.page_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_page_id TEXT,
  flow_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Contains rules and conditions
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.static_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.static_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_flows ENABLE ROW LEVEL SECURITY;

-- RLS policies for static_forms
CREATE POLICY "Users can view active static forms" 
  ON public.static_forms 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage their static forms" 
  ON public.static_forms 
  FOR ALL 
  USING (auth.uid() = created_by);

-- RLS policies for static_form_submissions
CREATE POLICY "Anyone can submit to static forms" 
  ON public.static_form_submissions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Form creators can view submissions" 
  ON public.static_form_submissions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.static_forms 
      WHERE static_forms.id = static_form_submissions.form_id 
      AND static_forms.created_by = auth.uid()
    )
  );

-- RLS policies for user_interactions
CREATE POLICY "Anyone can record interactions" 
  ON public.user_interactions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Form creators can view interactions" 
  ON public.user_interactions 
  FOR SELECT 
  USING (
    form_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.static_forms 
      WHERE static_forms.id = user_interactions.form_id 
      AND static_forms.created_by = auth.uid()
    )
  );

-- RLS policies for page_flows
CREATE POLICY "Users can manage their page flows" 
  ON public.page_flows 
  FOR ALL 
  USING (auth.uid() = created_by);
