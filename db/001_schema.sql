-- Trust-First V2: Database Schema for Supabase (Postgres)
-- Run this in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

--------------------------------------
-- CORE TABLES
--------------------------------------

-- Canonical ingredients
CREATE TABLE ingredient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN (
        'protein', 'vegetable', 'sauce', 'staple', 'dairy', 'grain', 'seafood', 'fruit', 'other'
    )),
    is_temple_safe BOOLEAN DEFAULT false,
    display_emoji TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ingredient aliases for search & normalization
CREATE TABLE ingredient_alias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id UUID REFERENCES ingredient(id) ON DELETE CASCADE NOT NULL,
    alias_name TEXT NOT NULL,
    alias_type TEXT NOT NULL CHECK (alias_type IN ('search', 'misspelling', 'regional')),
    locale TEXT NOT NULL DEFAULT 'ko',
    UNIQUE(alias_name, locale)
);

-- Trigram index for fuzzy search
CREATE INDEX idx_alias_trgm ON ingredient_alias USING GIN (alias_name gin_trgm_ops);
CREATE INDEX idx_alias_ingredient ON ingredient_alias (ingredient_id);

--------------------------------------
-- RECIPE TABLES
--------------------------------------

CREATE TABLE recipe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_ko TEXT NOT NULL,
    description TEXT,
    description_ko TEXT,
    image_url TEXT,
    is_temple_friendly BOOLEAN DEFAULT false,
    qa_status TEXT NOT NULL DEFAULT 'draft' CHECK (qa_status IN ('draft', 'verified', 'published', 'deprecated')),
    version INT DEFAULT 1,
    base_servings INT NOT NULL DEFAULT 2,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    cook_time_minutes INT,
    variant_group_id UUID,
    variant_label TEXT,
    source_url TEXT,
    source_type TEXT CHECK (source_type IN ('youtube', 'website', 'original', 'manual')),
    -- Pre-computed array for GIN-indexed fast matching
    core_ingredient_ids UUID[] DEFAULT '{}',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- GIN index for fast ingredient overlap queries
CREATE INDEX idx_recipe_core_ingredients ON recipe USING GIN (core_ingredient_ids);
CREATE INDEX idx_recipe_qa_status ON recipe (qa_status);
CREATE INDEX idx_recipe_variant_group ON recipe (variant_group_id) WHERE variant_group_id IS NOT NULL;

CREATE TABLE recipe_ingredient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipe(id) ON DELETE CASCADE NOT NULL,
    ingredient_id UUID REFERENCES ingredient(id) NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('core', 'optional', 'garnish')),
    quantity NUMERIC(8,2),
    unit TEXT DEFAULT 'whole',
    note TEXT,
    UNIQUE(recipe_id, ingredient_id)
);

CREATE INDEX idx_recipe_ingredient_recipe ON recipe_ingredient (recipe_id);
CREATE INDEX idx_recipe_ingredient_ingredient ON recipe_ingredient (ingredient_id);

-- Recipe steps (ordered)
CREATE TABLE recipe_step (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipe(id) ON DELETE CASCADE NOT NULL,
    step_number INT NOT NULL,
    instruction_ko TEXT NOT NULL,
    instruction TEXT,
    tip TEXT,
    UNIQUE(recipe_id, step_number)
);

--------------------------------------
-- SUBSTITUTION TABLE
--------------------------------------

CREATE TABLE substitution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_ingredient_id UUID REFERENCES ingredient(id) NOT NULL,
    substitute_ingredient_id UUID REFERENCES ingredient(id) NOT NULL,
    confidence TEXT NOT NULL CHECK (confidence IN ('high', 'medium')),
    note_short TEXT NOT NULL,
    allowed_for TEXT DEFAULT 'core_only',
    max_depth INT DEFAULT 1 CHECK (max_depth <= 1),
    UNIQUE(original_ingredient_id, substitute_ingredient_id)
);

--------------------------------------
-- USER TABLES
--------------------------------------

CREATE TABLE app_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name TEXT,
    default_servings INT DEFAULT 2,
    has_completed_onboarding BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Mutable pantry (single current pantry per user)
CREATE TABLE pantry_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app_user(id) ON DELETE CASCADE NOT NULL,
    ingredient_id UUID REFERENCES ingredient(id) NOT NULL,
    quantity NUMERIC(8,2) NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'whole',
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, ingredient_id)
);

CREATE INDEX idx_pantry_user ON pantry_item (user_id);

-- User staples (always assumed available)
CREATE TABLE user_staple (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app_user(id) ON DELETE CASCADE NOT NULL,
    ingredient_id UUID REFERENCES ingredient(id) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    UNIQUE(user_id, ingredient_id)
);

-- Favorites
CREATE TABLE favorite (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app_user(id) ON DELETE CASCADE NOT NULL,
    recipe_id UUID REFERENCES recipe(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, recipe_id)
);

-- User feedback
CREATE TABLE user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app_user(id) NOT NULL,
    recipe_id UUID REFERENCES recipe(id) NOT NULL,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN (
        'not_relevant', 'missing_too_much', 'dont_like_ingredient', 'too_hard', 'loved_it'
    )),
    created_at TIMESTAMPTZ DEFAULT now()
);

--------------------------------------
-- ANALYTICS EVENTS
--------------------------------------

CREATE TABLE analytics_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app_user(id),
    event_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_type ON analytics_event (event_type);
CREATE INDEX idx_events_user ON analytics_event (user_id);

--------------------------------------
-- GOVERNANCE
--------------------------------------

CREATE TABLE qa_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipe(id),
    action TEXT NOT NULL,
    notes TEXT,
    performed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
