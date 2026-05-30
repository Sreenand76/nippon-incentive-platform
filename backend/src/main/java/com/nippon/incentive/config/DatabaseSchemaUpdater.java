package com.nippon.incentive.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSchemaUpdater implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaUpdater.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaUpdater(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        addColumnIfMissing("incentive_slabs", "car_model_id", "BIGINT");
        addColumnIfMissing("sales_submission_items", "incentive_per_car", "NUMERIC(19,2) DEFAULT 0");
        addColumnIfMissing("sales_submission_items", "line_incentive", "NUMERIC(19,2) DEFAULT 0");
        linkOrphanSlabsToFirstCarModel();
    }

    private void linkOrphanSlabsToFirstCarModel() {
        try {
            int updated = jdbcTemplate.update(
                    """
                    UPDATE incentive_slabs
                    SET car_model_id = (SELECT id FROM car_models ORDER BY id LIMIT 1)
                    WHERE car_model_id IS NULL
                      AND EXISTS (SELECT 1 FROM car_models LIMIT 1)
                    """);
            if (updated > 0) {
                log.info("Linked {} orphan incentive slab(s) to the first car model", updated);
            }
        } catch (Exception e) {
            log.warn("Could not link orphan slabs: {}", e.getMessage());
        }
    }

    private void addColumnIfMissing(String table, String column, String type) {
        try {
            Boolean exists = jdbcTemplate.queryForObject(
                    """
                    SELECT COUNT(*) > 0 FROM information_schema.columns
                    WHERE table_name = ? AND column_name = ?
                    """,
                    Boolean.class,
                    table,
                    column);

            if (Boolean.FALSE.equals(exists)) {
                jdbcTemplate.execute("ALTER TABLE " + table + " ADD COLUMN " + column + " " + type);
                log.info("Added column {}.{}", table, column);
            }
        } catch (Exception e) {
            log.warn("Could not add column {}.{}: {}", table, column, e.getMessage());
        }
    }
}
