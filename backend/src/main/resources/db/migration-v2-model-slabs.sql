-- Model-based incentives: link each slab to a car model.
-- Run this once on your PostgreSQL database (e.g. Neon SQL editor).

-- 1) Add the column (nullable first so existing rows don't block the alter)
ALTER TABLE incentive_slabs
  ADD COLUMN IF NOT EXISTS car_model_id BIGINT;

-- 2) Link any orphan slabs to the first car model, or delete them
UPDATE incentive_slabs
SET car_model_id = (SELECT id FROM car_models ORDER BY id LIMIT 1)
WHERE car_model_id IS NULL
  AND EXISTS (SELECT 1 FROM car_models LIMIT 1);

DELETE FROM incentive_slabs WHERE car_model_id IS NULL;

-- If you prefer to keep old rows, assign them to a car instead of deleting:
-- UPDATE incentive_slabs
-- SET car_model_id = (SELECT id FROM car_models ORDER BY id LIMIT 1)
-- WHERE car_model_id IS NULL;

-- 3) Foreign key + required column
ALTER TABLE incentive_slabs
  ADD CONSTRAINT fk_incentive_slabs_car_model
  FOREIGN KEY (car_model_id) REFERENCES car_models(id);

ALTER TABLE incentive_slabs
  ALTER COLUMN car_model_id SET NOT NULL;
