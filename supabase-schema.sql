-- Health Tracker Database Schema for Supabase
-- Run this SQL in the Supabase SQL Editor to create all necessary tables

-- ============================================
-- USER SETTINGS TABLE
-- ============================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  units TEXT DEFAULT 'kg',
  name TEXT,
  theme JSONB DEFAULT '{
    "primaryColor": "#2D5F4F",
    "primaryDark": "#1F4438",
    "secondaryColor": "#E8A87C",
    "accentCoral": "#F4A896",
    "beige100": "#FBF8F3",
    "beige200": "#F5E6D3",
    "beige300": "#E8D4BC"
  }'::jsonb,
  background_image JSONB DEFAULT '{
    "url": "",
    "opacity": 0.1,
    "fit": "cover",
    "position": "center",
    "enabled": false
  }'::jsonb,
  hero_image JSONB DEFAULT '{
    "url": "",
    "opacity": 0.3,
    "fit": "cover",
    "position": "center",
    "enabled": false
  }'::jsonb,
  card_image JSONB DEFAULT '{
    "url": "",
    "opacity": 0.05,
    "fit": "cover",
    "position": "center",
    "enabled": false
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- WEIGHT LOGS TABLE
-- ============================================
CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight NUMERIC NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MOOD LOGS TABLE
-- ============================================
CREATE TABLE mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NUTRITION NOTES TABLE
-- ============================================
CREATE TABLE nutrition_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT NOT NULL,
  notes TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HEALTH CONNECTION TABLE
-- ============================================
CREATE TABLE health_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'disconnected',
  last_sync_at TIMESTAMPTZ,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_weight_logs_user_date ON weight_logs(user_id, date DESC);
CREATE INDEX idx_mood_logs_user_date ON mood_logs(user_id, date DESC);
CREATE INDEX idx_nutrition_notes_user_date ON nutrition_notes(user_id, date DESC);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_health_connections_user_id ON health_connections(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_connections ENABLE ROW LEVEL SECURITY;

-- User Settings Policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Weight Logs Policies
CREATE POLICY "Users can view their own weight logs"
  ON weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weight logs"
  ON weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight logs"
  ON weight_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight logs"
  ON weight_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Mood Logs Policies
CREATE POLICY "Users can view their own mood logs"
  ON mood_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood logs"
  ON mood_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood logs"
  ON mood_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood logs"
  ON mood_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Nutrition Notes Policies
CREATE POLICY "Users can view their own nutrition notes"
  ON nutrition_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition notes"
  ON nutrition_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition notes"
  ON nutrition_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition notes"
  ON nutrition_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Health Connections Policies
CREATE POLICY "Users can view their own health connections"
  ON health_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health connections"
  ON health_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health connections"
  ON health_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health connections"
  ON health_connections FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weight_logs_updated_at
  BEFORE UPDATE ON weight_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mood_logs_updated_at
  BEFORE UPDATE ON mood_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_notes_updated_at
  BEFORE UPDATE ON nutrition_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_connections_updated_at
  BEFORE UPDATE ON health_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize user settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Health Tracker User')
  );

  INSERT INTO public.health_connections (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
