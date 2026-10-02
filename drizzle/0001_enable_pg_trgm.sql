-- pg_trgm powers typo-tolerant name search; must exist before the gin_trgm_ops indexes.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
