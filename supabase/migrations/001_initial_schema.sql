-- ─────────────────────────────────────────────────────────────────────────────
-- 001_initial_schema.sql
-- Fairy Garden — initial database schema
-- ─────────────────────────────────────────────────────────────────────────────

-- ── profiles ──────────────────────────────────────────────────────────────────
-- One row per authenticated user, auto-created on sign-up via trigger below.

CREATE TABLE IF NOT EXISTS profiles (
  id                     uuid        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name           text,
  measurement_preference text        NOT NULL DEFAULT 'imperial',
  created_at             timestamptz NOT NULL DEFAULT now()
);

-- ── properties ────────────────────────────────────────────────────────────────
-- A user can own multiple properties (city lot, cottage, etc.)

CREATE TABLE IF NOT EXISTS properties (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name             text        NOT NULL,
  address_region   text,
  postal_prefix    text,
  hardiness_zone   text,
  lot_width_ft     numeric,
  lot_depth_ft     numeric,
  facing_direction text,
  is_default       boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS properties_user_id_idx ON properties(user_id);

-- ── map_elements ──────────────────────────────────────────────────────────────
-- Buildings, yard zones, plants placed on the canvas, text labels, etc.

CREATE TABLE IF NOT EXISTS map_elements (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  uuid        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  element_type text        NOT NULL,  -- 'building' | 'zone' | 'plant' | 'text' | 'custom'
  name         text,
  x_ft         numeric,
  y_ft         numeric,
  width_ft     numeric,
  height_ft    numeric,
  colour       text,
  label        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS map_elements_property_id_idx ON map_elements(property_id);

-- ── plants ────────────────────────────────────────────────────────────────────
-- Plant inventory for a property.

CREATE TABLE IF NOT EXISTS plants (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id      uuid        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  common_name      text        NOT NULL,
  latin_name       text,
  plant_type       text,
  status           text        NOT NULL DEFAULT 'keep', -- 'keep' | 'remove' | 'maybe'
  sun_needs        text,
  water_needs      text,
  is_pet_safe      boolean,
  juglone_tolerant boolean,
  notes            text,
  known            boolean     NOT NULL DEFAULT false,
  quantity         text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plants_property_id_idx ON plants(property_id);

-- ── seeds ─────────────────────────────────────────────────────────────────────
-- Seed inventory for a property.

CREATE TABLE IF NOT EXISTS seeds (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id       uuid        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name              text        NOT NULL,
  variety           text,
  quantity          text,
  sowing_depth      text,
  spacing           text,
  days_to_maturity  integer,
  sun_needs         text,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS seeds_property_id_idx ON seeds(property_id);

-- ── garden_tasks ──────────────────────────────────────────────────────────────
-- Seasonal tasks / to-do items scoped to a property.

CREATE TABLE IF NOT EXISTS garden_tasks (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id    uuid        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name           text        NOT NULL,
  zone           text,
  year           integer,
  season         text,
  estimated_cost numeric,
  completed      boolean     NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS garden_tasks_property_id_idx ON garden_tasks(property_id);

-- ── growth_log ────────────────────────────────────────────────────────────────
-- Journal entries attached to a specific plant.

CREATE TABLE IF NOT EXISTS growth_log (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id   uuid        NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  entry_date date        NOT NULL,
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS growth_log_plant_id_idx ON growth_log(plant_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties   ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeds        ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_log   ENABLE ROW LEVEL SECURITY;

-- ── profiles policies ─────────────────────────────────────────────────────────

CREATE POLICY "profiles: owner full access"
  ON profiles
  FOR ALL
  USING     (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── properties policies ───────────────────────────────────────────────────────

CREATE POLICY "properties: owner full access"
  ON properties
  FOR ALL
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── helper: is the given property_id owned by the current user? ───────────────
-- Used as an inline subquery in child-table policies to avoid a function dep.

-- ── map_elements policies ─────────────────────────────────────────────────────

CREATE POLICY "map_elements: owner full access"
  ON map_elements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id      = map_elements.property_id
        AND properties.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id      = map_elements.property_id
        AND properties.user_id = auth.uid()
    )
  );

-- ── plants policies ───────────────────────────────────────────────────────────

CREATE POLICY "plants: owner full access"
  ON plants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id      = plants.property_id
        AND properties.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id      = plants.property_id
        AND properties.user_id = auth.uid()
    )
  );

-- ── seeds policies ────────────────────────────────────────────────────────────

CREATE POLICY "seeds: owner full access"
  ON seeds
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id      = seeds.property_id
        AND properties.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id      = seeds.property_id
        AND properties.user_id = auth.uid()
    )
  );

-- ── garden_tasks policies ─────────────────────────────────────────────────────

CREATE POLICY "garden_tasks: owner full access"
  ON garden_tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id      = garden_tasks.property_id
        AND properties.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id      = garden_tasks.property_id
        AND properties.user_id = auth.uid()
    )
  );

-- ── growth_log policies ───────────────────────────────────────────────────────
-- growth_log is attached to plants, so we walk two levels up to check ownership.

CREATE POLICY "growth_log: owner full access"
  ON growth_log
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM plants
      JOIN properties ON properties.id = plants.property_id
      WHERE plants.id           = growth_log.plant_id
        AND properties.user_id  = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM plants
      JOIN properties ON properties.id = plants.property_id
      WHERE plants.id           = growth_log.plant_id
        AND properties.user_id  = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-create profile on sign-up
-- ─────────────────────────────────────────────────────────────────────────────
-- Creates a profiles row the moment a user is confirmed in auth.users.
-- This avoids a missing-profile edge case for all downstream queries.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
