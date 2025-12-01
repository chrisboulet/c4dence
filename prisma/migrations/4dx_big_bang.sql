-- =============================================================================
-- C4DENCE — Migration 4DX Big Bang
-- =============================================================================
-- Ajoute les fonctionnalités 4DX avancées :
-- - ACHIEVED status pour WIGs
-- - BlockerStatus enum
-- - owner_id sur WIGs
-- - assigned_to_id sur Lead Measures
-- - lead_measure_id sur Engagements
-- - Table Blockers
-- =============================================================================

-- 1. Ajouter le statut ACHIEVED à l'enum WigStatus
ALTER TYPE c4dence."WigStatus" ADD VALUE IF NOT EXISTS 'ACHIEVED';

-- 2. Créer l'enum BlockerStatus
DO $$ BEGIN
  CREATE TYPE c4dence."BlockerStatus" AS ENUM ('OPEN', 'ESCALATED', 'RESOLVED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Ajouter owner_id sur la table wigs
ALTER TABLE c4dence.wigs
ADD COLUMN IF NOT EXISTS owner_id TEXT REFERENCES c4dence.profiles(id);

CREATE INDEX IF NOT EXISTS wigs_owner_id_idx ON c4dence.wigs(owner_id);

-- 4. Ajouter assigned_to_id sur la table lead_measures
ALTER TABLE c4dence.lead_measures
ADD COLUMN IF NOT EXISTS assigned_to_id TEXT REFERENCES c4dence.profiles(id);

CREATE INDEX IF NOT EXISTS lead_measures_assigned_to_id_idx ON c4dence.lead_measures(assigned_to_id);

-- 5. Ajouter lead_measure_id sur la table engagements
ALTER TABLE c4dence.engagements
ADD COLUMN IF NOT EXISTS lead_measure_id TEXT REFERENCES c4dence.lead_measures(id);

CREATE INDEX IF NOT EXISTS engagements_lead_measure_id_idx ON c4dence.engagements(lead_measure_id);

-- 6. Créer la table blockers
CREATE TABLE IF NOT EXISTS c4dence.blockers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Relations
  wig_id TEXT NOT NULL REFERENCES c4dence.wigs(id) ON DELETE CASCADE,
  reported_by_id TEXT NOT NULL REFERENCES c4dence.profiles(id),

  -- Contenu
  description TEXT NOT NULL,

  -- Suivi
  status c4dence."BlockerStatus" NOT NULL DEFAULT 'OPEN',
  escalated_to TEXT,
  resolved_at TIMESTAMPTZ,
  resolution TEXT
);

-- Index pour blockers
CREATE INDEX IF NOT EXISTS blockers_wig_id_idx ON c4dence.blockers(wig_id);
CREATE INDEX IF NOT EXISTS blockers_reported_by_id_idx ON c4dence.blockers(reported_by_id);
CREATE INDEX IF NOT EXISTS blockers_status_idx ON c4dence.blockers(status);

-- 7. Trigger pour updated_at sur blockers
CREATE OR REPLACE FUNCTION c4dence.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_blockers_updated_at ON c4dence.blockers;
CREATE TRIGGER update_blockers_updated_at
  BEFORE UPDATE ON c4dence.blockers
  FOR EACH ROW
  EXECUTE FUNCTION c4dence.update_updated_at_column();

-- =============================================================================
-- DONE! Exécuter dans Supabase SQL Editor
-- =============================================================================
