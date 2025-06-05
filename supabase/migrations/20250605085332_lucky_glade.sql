/*
  # Create forest nursery schema

  1. New Tables
    - `parcelle` - Plot details
    - `espece` - Species details
    - `parcelle_espece` - Junction table for parcelle-espece relationship
    - `type_activite` - Activity types
    - `activite` - Activities with JSON details

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Parcelle (Plot) table
CREATE TABLE IF NOT EXISTS parcelle (
  parcelle_id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  surface_m2 NUMERIC NOT NULL,
  type_sol TEXT NOT NULL,
  pente_deg NUMERIC NOT NULL DEFAULT 0,
  exposition TEXT NOT NULL,
  date_creation TIMESTAMP WITH TIME ZONE NOT NULL,
  geom_coordonnee JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Espece (Species) table
CREATE TABLE IF NOT EXISTS espece (
  espece_id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  variete TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Parcelle_Espece junction table
CREATE TABLE IF NOT EXISTS parcelle_espece (
  parcelle_espece_id SERIAL PRIMARY KEY,
  parcelle_id INTEGER NOT NULL REFERENCES parcelle(parcelle_id) ON DELETE CASCADE,
  espece_id INTEGER NOT NULL REFERENCES espece(espece_id) ON DELETE CASCADE,
  quantite INTEGER NOT NULL DEFAULT 0,
  date_plantation TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(parcelle_id, espece_id)
);

-- Type_Activite (Activity Type) table
CREATE TABLE IF NOT EXISTS type_activite (
  type_activite_id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  libelle TEXT NOT NULL,
  description TEXT
);

-- Activite (Activity) table
CREATE TABLE IF NOT EXISTS activite (
  activite_id SERIAL PRIMARY KEY,
  parcelle_id INTEGER NOT NULL REFERENCES parcelle(parcelle_id) ON DELETE CASCADE,
  type_activite_id INTEGER NOT NULL REFERENCES type_activite(type_activite_id) ON DELETE CASCADE,
  date_activite TIMESTAMP WITH TIME ZONE NOT NULL,
  operateur TEXT NOT NULL,
  commentaire_general TEXT,
  zone_concernee TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on JSONB column
CREATE INDEX IF NOT EXISTS idx_activite_details ON activite USING GIN (details);

-- Enable Row Level Security on all tables
ALTER TABLE parcelle ENABLE ROW LEVEL SECURITY;
ALTER TABLE espece ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelle_espece ENABLE ROW LEVEL SECURITY;
ALTER TABLE type_activite ENABLE ROW LEVEL SECURITY;
ALTER TABLE activite ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read parcelles"
  ON parcelle
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert parcelles"
  ON parcelle
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update parcelles"
  ON parcelle
  FOR UPDATE
  TO authenticated
  USING (true);

-- Similar policies for other tables
CREATE POLICY "Allow authenticated users to read especes"
  ON espece
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert especes"
  ON espece
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update especes"
  ON espece
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read parcelle_espece"
  ON parcelle_espece
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert parcelle_espece"
  ON parcelle_espece
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update parcelle_espece"
  ON parcelle_espece
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read type_activite"
  ON type_activite
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read activite"
  ON activite
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert activite"
  ON activite
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update activite"
  ON activite
  FOR UPDATE
  TO authenticated
  USING (true);

-- Insert predefined activity types
INSERT INTO type_activite (code, libelle, description)
VALUES 
  ('PLANTATION', 'Plantation', 'Plantation de nouveaux arbres'),
  ('TAILLE', 'Taille', 'Taille des arbres existants'),
  ('FERTILISATION', 'Fertilisation', 'Application d''engrais'),
  ('PHYTOSANITAIRE', 'Phytosanitaire', 'Traitements phytosanitaires'),
  ('IRRIGATION', 'Irrigation', 'Arrosage des parcelles'),
  ('DESHERBAGE', 'Désherbage', 'Élimination des mauvaises herbes'),
  ('RECOLTE', 'Récolte', 'Récolte des arbres'),
  ('OBSERVATION', 'Observation', 'Observation et suivi des parcelles')
ON CONFLICT (code) DO NOTHING;