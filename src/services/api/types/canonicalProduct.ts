export type SynonymStat = {
  synonym: string;
  count: number;
};

export type CanonicalProduct = {
  _id: string;
  canonical_name: string;
  canonical_name_normalized: string;
  brand?: string | null;
  brand_normalized?: string | null;
  category?: string | null;
  subcategory?: string | null;
  category_key?: string | null;
  package_size?: string | null;
  unit?: string | null;
  quantity?: number | null;
  package_description?: string | null;
  gtin?: string | null;
  ncm?: string | null;
  origin?: string | null;
  synonyms: string[];
  synonyms_normalized: string[];
  synonyms_stats: SynonymStat[];
  is_alcoholic?: boolean | null;
  is_fresh_produce?: boolean | null;
  is_bulk?: boolean | null;
  confidence: number;
  source: string;
  embedding?: number[] | null;
  scope: "global" | "group";
  group_id?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  created_by: string;
  updated_by: string;
};
