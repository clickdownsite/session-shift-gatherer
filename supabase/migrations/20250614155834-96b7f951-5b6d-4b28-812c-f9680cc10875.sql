
-- Enable Row Level Security and add policies for public session pages

-- 1. Allow public read access to sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to sessions" ON public.sessions FOR SELECT USING (true);

-- 2. Allow public read access to main_pages
ALTER TABLE public.main_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to main pages" ON public.main_pages FOR SELECT USING (true);

-- 3. Allow public read access to sub_pages
ALTER TABLE public.sub_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to sub pages" ON public.sub_pages FOR SELECT USING (true);

-- 4. Allow public insert access to session_data
ALTER TABLE public.session_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert access to session_data" ON public.session_data FOR INSERT WITH CHECK (true);

-- 5. Allow authenticated users to read data from their own sessions
CREATE POLICY "Allow authenticated users to read their session data" ON public.session_data FOR SELECT USING (
  session_id IN (
    SELECT id FROM public.sessions WHERE user_id = auth.uid()
  )
);
