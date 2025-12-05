-- =============================================================================
-- C4DENCE — Row Level Security (RLS) Policies
-- =============================================================================
-- À exécuter dans Supabase SQL Editor après la migration Prisma initiale.
-- 
-- IMPORTANT : Toutes les tables sont dans le schema 'c4dence', pas 'public'.
-- Le CRM existant utilise le schema 'crm' — isolation complète.
-- 
-- Ces policies garantissent l'isolation multi-tenant :
-- - Un utilisateur ne voit que les données de ses organisations
-- - Les rôles (OWNER, ADMIN, MEMBER) définissent les permissions
-- =============================================================================

-- 1. CRÉER LE SCHEMA (si pas déjà fait par Prisma migrate)
-- --------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS c4dence;

-- 2. ACTIVE RLS SUR TOUTES LES TABLES
-- -----------------------------------
ALTER TABLE c4dence.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE c4dence.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE c4dence.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE c4dence.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE c4dence.lead_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE c4dence.weekly_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE c4dence.engagements ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PROFILES
-- =============================================================================
-- Un utilisateur ne peut voir/modifier que son propre profil

-- Lecture : Seulement son propre profil
CREATE POLICY "profiles_select_own" ON c4dence.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Mise à jour : Seulement son propre profil
CREATE POLICY "profiles_update_own" ON c4dence.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert : Géré par le trigger on_auth_user_created (service role)
-- Delete : Non autorisé (désactivation via Supabase Auth)

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================
-- Visible si l'utilisateur est membre

-- Lecture : Membre de l'organisation
CREATE POLICY "organizations_select_member" ON c4dence.organizations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM c4dence.memberships
      WHERE c4dence.memberships.organization_id = c4dence.organizations.id
      AND c4dence.memberships.profile_id = auth.uid()
    )
  );

-- Mise à jour : OWNER ou ADMIN uniquement
CREATE POLICY "organizations_update_admin" ON c4dence.organizations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM c4dence.memberships
      WHERE c4dence.memberships.organization_id = c4dence.organizations.id
      AND c4dence.memberships.profile_id = auth.uid()
      AND c4dence.memberships.role IN ('OWNER', 'ADMIN')
    )
  );

-- Insert : Tout utilisateur authentifié peut créer une organisation
-- (Il devient automatiquement OWNER via trigger ou application logic)
CREATE POLICY "organizations_insert_authenticated" ON c4dence.organizations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Delete : OWNER uniquement
CREATE POLICY "organizations_delete_owner" ON c4dence.organizations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM c4dence.memberships
      WHERE c4dence.memberships.organization_id = c4dence.organizations.id
      AND c4dence.memberships.profile_id = auth.uid()
      AND c4dence.memberships.role = 'OWNER'
    )
  );

-- =============================================================================
-- MEMBERSHIPS
-- =============================================================================

-- Lecture : Voir les membres de ses propres organisations
CREATE POLICY "memberships_select_org_member" ON c4dence.memberships
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM c4dence.memberships AS my_membership
      WHERE my_membership.organization_id = c4dence.memberships.organization_id
      AND my_membership.profile_id = auth.uid()
    )
  );

-- Insert : OWNER ou ADMIN peuvent ajouter des membres
CREATE POLICY "memberships_insert_admin" ON c4dence.memberships
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM c4dence.memberships AS admin_membership
      WHERE admin_membership.organization_id = c4dence.memberships.organization_id
      AND admin_membership.profile_id = auth.uid()
      AND admin_membership.role IN ('OWNER', 'ADMIN')
    )
    -- Exception : Premier membre (OWNER) lors de la création d'org
    OR NOT EXISTS (
      SELECT 1 FROM c4dence.memberships AS existing
      WHERE existing.organization_id = c4dence.memberships.organization_id
    )
  );

-- Update : OWNER peut changer les rôles (sauf le sien)
CREATE POLICY "memberships_update_owner" ON c4dence.memberships
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM c4dence.memberships AS owner_membership
      WHERE owner_membership.organization_id = c4dence.memberships.organization_id
      AND owner_membership.profile_id = auth.uid()
      AND owner_membership.role = 'OWNER'
    )
    AND c4dence.memberships.profile_id != auth.uid() -- Ne peut pas modifier son propre rôle
  );

-- Delete : OWNER/ADMIN peuvent retirer des membres, membre peut se retirer lui-même
CREATE POLICY "memberships_delete" ON c4dence.memberships
  FOR DELETE
  USING (
    -- OWNER/ADMIN peut retirer (sauf OWNER lui-même)
    (
      EXISTS (
        SELECT 1 FROM c4dence.memberships AS admin_membership
        WHERE admin_membership.organization_id = c4dence.memberships.organization_id
        AND admin_membership.profile_id = auth.uid()
        AND admin_membership.role IN ('OWNER', 'ADMIN')
      )
      AND c4dence.memberships.role != 'OWNER' -- Ne peut pas retirer le OWNER
    )
    -- Ou le membre se retire lui-même (sauf OWNER)
    OR (
      c4dence.memberships.profile_id = auth.uid()
      AND c4dence.memberships.role != 'OWNER'
    )
  );

-- =============================================================================
-- OBJECTIVES
-- =============================================================================

-- Lecture : Membre de l'organisation
CREATE POLICY "objectives_select_member" ON c4dence.objectives
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM c4dence.memberships
      WHERE c4dence.memberships.organization_id = c4dence.objectives.organization_id
      AND c4dence.memberships.profile_id = auth.uid()
    )
  );

-- Insert : OWNER ou ADMIN
CREATE POLICY "objectives_insert_admin" ON c4dence.objectives
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM c4dence.memberships
      WHERE c4dence.memberships.organization_id = c4dence.objectives.organization_id
      AND c4dence.memberships.profile_id = auth.uid()
      AND c4dence.memberships.role IN ('OWNER', 'ADMIN')
    )
  );

-- Update : OWNER ou ADMIN
CREATE POLICY "objectives_update_admin" ON c4dence.objectives
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM c4dence.memberships
      WHERE c4dence.memberships.organization_id = c4dence.objectives.organization_id
      AND c4dence.memberships.profile_id = auth.uid()
      AND c4dence.memberships.role IN ('OWNER', 'ADMIN')
    )
  );

-- Delete : OWNER ou ADMIN (soft delete préféré via is_archived)
CREATE POLICY "objectives_delete_admin" ON c4dence.objectives
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM c4dence.memberships
      WHERE c4dence.memberships.organization_id = c4dence.objectives.organization_id
      AND c4dence.memberships.profile_id = auth.uid()
      AND c4dence.memberships.role IN ('OWNER', 'ADMIN')
    )
  );

-- =============================================================================
-- LEAD_MEASURES
-- =============================================================================

-- Lecture : Membre de l'organisation du WIG
CREATE POLICY "lead_measures_select_member" ON c4dence.lead_measures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM c4dence.objectives
      JOIN c4dence.memberships ON c4dence.memberships.organization_id = c4dence.objectives.organization_id
      WHERE c4dence.objectives.id = c4dence.lead_measures.objective_id
      AND c4dence.memberships.profile_id = auth.uid()
    )
  );

-- Insert : OWNER ou ADMIN
CREATE POLICY "lead_measures_insert_admin" ON c4dence.lead_measures
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM c4dence.objectives
      JOIN c4dence.memberships ON c4dence.memberships.organization_id = c4dence.objectives.organization_id
      WHERE c4dence.objectives.id = c4dence.lead_measures.objective_id
      AND c4dence.memberships.profile_id = auth.uid()
      AND c4dence.memberships.role IN ('OWNER', 'ADMIN')
    )
  );

-- Update : OWNER ou ADMIN
CREATE POLICY "lead_measures_update_admin" ON c4dence.lead_measures
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM c4dence.objectives
      JOIN c4dence.memberships ON c4dence.memberships.organization_id = c4dence.objectives.organization_id
      WHERE c4dence.objectives.id = c4dence.lead_measures.objective_id
      AND c4dence.memberships.profile_id = auth.uid()
      AND c4dence.memberships.role IN ('OWNER', 'ADMIN')
    )
  );

-- Delete : OWNER ou ADMIN
CREATE POLICY "lead_measures_delete_admin" ON c4dence.lead_measures
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM c4dence.objectives
      JOIN c4dence.memberships ON c4dence.memberships.organization_id = c4dence.objectives.organization_id
      WHERE c4dence.objectives.id = c4dence.lead_measures.objective_id
      AND c4dence.memberships.profile_id = auth.uid()
      AND c4dence.memberships.role IN ('OWNER', 'ADMIN')
    )
  );

-- =============================================================================
-- WEEKLY_MEASURES
-- =============================================================================

-- Lecture : Membre de l'organisation
CREATE POLICY "weekly_measures_select_member" ON c4dence.weekly_measures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM c4dence.lead_measures
      JOIN c4dence.objectives ON c4dence.objectives.id = c4dence.lead_measures.objective_id
      JOIN c4dence.memberships ON c4dence.memberships.organization_id = c4dence.objectives.organization_id
      WHERE c4dence.lead_measures.id = c4dence.weekly_measures.lead_measure_id
      AND c4dence.memberships.profile_id = auth.uid()
    )
  );

-- Insert : Tout membre peut enregistrer une mesure
CREATE POLICY "weekly_measures_insert_member" ON c4dence.weekly_measures
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM c4dence.lead_measures
      JOIN c4dence.objectives ON c4dence.objectives.id = c4dence.lead_measures.objective_id
      JOIN c4dence.memberships ON c4dence.memberships.organization_id = c4dence.objectives.organization_id
      WHERE c4dence.lead_measures.id = c4dence.weekly_measures.lead_measure_id
      AND c4dence.memberships.profile_id = auth.uid()
    )
  );

-- Update : Tout membre peut modifier une mesure
CREATE POLICY "weekly_measures_update_member" ON c4dence.weekly_measures
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM c4dence.lead_measures
      JOIN c4dence.objectives ON c4dence.objectives.id = c4dence.lead_measures.objective_id
      JOIN c4dence.memberships ON c4dence.memberships.organization_id = c4dence.objectives.organization_id
      WHERE c4dence.lead_measures.id = c4dence.weekly_measures.lead_measure_id
      AND c4dence.memberships.profile_id = auth.uid()
    )
  );

-- Delete : OWNER ou ADMIN seulement
CREATE POLICY "weekly_measures_delete_admin" ON c4dence.weekly_measures
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM c4dence.lead_measures
      JOIN c4dence.objectives ON c4dence.objectives.id = c4dence.lead_measures.objective_id
      JOIN c4dence.memberships ON c4dence.memberships.organization_id = c4dence.objectives.organization_id
      WHERE c4dence.lead_measures.id = c4dence.weekly_measures.lead_measure_id
      AND c4dence.memberships.profile_id = auth.uid()
      AND c4dence.memberships.role IN ('OWNER', 'ADMIN')
    )
  );

-- =============================================================================
-- ENGAGEMENTS
-- =============================================================================

-- Lecture : Membre de l'organisation (voir tous les engagements)
CREATE POLICY "engagements_select_org_member" ON c4dence.engagements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM c4dence.memberships
      WHERE c4dence.memberships.organization_id = c4dence.engagements.organization_id
      AND c4dence.memberships.profile_id = auth.uid()
    )
  );

-- Insert : Seulement pour soi-même, dans une org dont on est membre
CREATE POLICY "engagements_insert_own" ON c4dence.engagements
  FOR INSERT
  WITH CHECK (
    c4dence.engagements.profile_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM c4dence.memberships
      WHERE c4dence.memberships.organization_id = c4dence.engagements.organization_id
      AND c4dence.memberships.profile_id = auth.uid()
    )
  );

-- Update : Seulement ses propres engagements
CREATE POLICY "engagements_update_own" ON c4dence.engagements
  FOR UPDATE
  USING (c4dence.engagements.profile_id = auth.uid());

-- Delete : Seulement ses propres engagements, ou ADMIN
CREATE POLICY "engagements_delete" ON c4dence.engagements
  FOR DELETE
  USING (
    c4dence.engagements.profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM c4dence.memberships
      WHERE c4dence.memberships.organization_id = c4dence.engagements.organization_id
      AND c4dence.memberships.profile_id = auth.uid()
      AND c4dence.memberships.role IN ('OWNER', 'ADMIN')
    )
  );

-- =============================================================================
-- FONCTION HELPER : get_my_organizations()
-- =============================================================================
-- Utilisée pour optimiser les queries avec RLS

CREATE OR REPLACE FUNCTION c4dence.get_my_organization_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id 
  FROM c4dence.memberships 
  WHERE profile_id = auth.uid();
$$;

-- =============================================================================
-- TRIGGER : Créer un Profile C4DENCE quand un utilisateur s'inscrit
-- =============================================================================
-- Note : Ce trigger crée un profile dans c4dence.profiles
-- Il n'affecte pas le schema CRM existant.

CREATE OR REPLACE FUNCTION c4dence.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = c4dence
AS $$
BEGIN
  INSERT INTO c4dence.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger sur auth.users (table Supabase)
-- Note : Un seul trigger par événement est permis, donc on nomme spécifiquement
DROP TRIGGER IF EXISTS on_auth_user_created_c4dence ON auth.users;
CREATE TRIGGER on_auth_user_created_c4dence
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION c4dence.handle_new_user();

-- =============================================================================
-- CRÉER LE PROFILE POUR L'UTILISATEUR EXISTANT
-- =============================================================================
-- Exécuter UNE SEULE FOIS pour créer le profile de l'utilisateur Google Auth existant

INSERT INTO c4dence.profiles (id, email, full_name, avatar_url)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name'),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM c4dence.profiles WHERE c4dence.profiles.id = auth.users.id
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- NOTES
-- =============================================================================
-- 
-- 1. Ces policies utilisent auth.uid() qui est fourni par Supabase Auth.
--    En développement local, vous devez être authentifié pour que RLS fonctionne.
--
-- 2. ISOLATION CRM / C4DENCE :
--    - CRM utilise le schema 'crm' (tables: prospects, interactions)
--    - C4DENCE utilise le schema 'c4dence' (tables: profiles, organizations, etc.)
--    - Les deux partagent auth.users pour l'authentification Google
--    - Aucune interférence entre les deux applications
--
-- 3. Pour bypasser RLS en dev (DANGEREUX en prod) :
--    ALTER TABLE c4dence.table_name DISABLE ROW LEVEL SECURITY;
--
-- 4. Pour tester les policies :
--    SET LOCAL role TO 'authenticated';
--    SET LOCAL request.jwt.claim.sub TO 'user-uuid-here';
--    SELECT * FROM c4dence.objectives;
--
-- 5. Les policies JOIN sont plus coûteuses. Pour les tables fréquemment
--    accédées, considérer la dénormalisation ou des fonctions SECURITY DEFINER.
--
-- 6. ORDRE D'EXÉCUTION :
--    1. Exécuter `prisma migrate dev` pour créer les tables
--    2. Exécuter ce fichier SQL pour les policies RLS
--    3. Le profile de l'utilisateur existant sera créé automatiquement
