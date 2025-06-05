export interface Parcelle {
  parcelle_id: number;
  code: string;
  nom: string;
  surface_m2: number;
  type_sol: string;
  pente_deg: number;
  exposition: string;
  date_creation: string;
  geom_coordonnee: GeoCoordinate;
  created_at: string;
  updated_at: string;
  especes?: Espece[];
  activites?: Activite[];
}

export interface GeoCoordinate {
  type: string;
  coordinates: number[][][];
}

export interface Espece {
  espece_id: number;
  nom: string;
  variete: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  quantite?: number;
  date_plantation?: string | null;
}

export interface ParcelleEspece {
  parcelle_espece_id: number;
  parcelle_id: number;
  espece_id: number;
  quantite: number;
  date_plantation: string | null;
  created_at: string;
  updated_at: string;
}

export interface TypeActivite {
  type_activite_id: number;
  code: string;
  libelle: string;
  description: string | null;
}

export interface Activite {
  activite_id: number;
  parcelle_id: number;
  type_activite_id: number;
  date_activite: string;
  operateur: string;
  commentaire_general: string | null;
  zone_concernee: string | null;
  details: ActiviteDetails | null;
  created_at: string;
  updated_at: string;
  typeActivite?: TypeActivite;
  parcelle?: Parcelle;
}

export type ActiviteDetails = 
  | PlantationDetails
  | FertilisationDetails
  | PhytosanitaireDetails
  | IrrigationDetails
  | DesherbageDetails
  | RecolteDetails
  | ObservationDetails;

export interface PlantationDetails {
  fournisseur: string;
  nbr_plants: number;
  variete: string;
  prix_unitaire: number;
  zone_precise: string;
}

export interface FertilisationDetails {
  type_engrais: string;
  dose_kg_ha: number;
  quantite_totale_kg: number;
  commentaire_fertil: string;
}

export interface PhytosanitaireDetails {
  produit_utilise: string;
  dosage_l_ha: number;
  zone_ciblee: string;
  commentaire_phytosan: string;
}

export interface IrrigationDetails {
  type_irrigation: string;
  duree_minutes: number;
  frequence_semaine: number;
}

export interface DesherbageDetails {
  methode: string;
  frequence_mois: number;
  operateur_detail: string;
}

export interface RecolteDetails {
  nbr_arbres: number;
  taille_moy_cm: number;
  destination: string;
  qualite: string;
}

export interface ObservationDetails {
  texte_observation: string;
  photo_url: string;
}