---
name: schema-migration
description: Zero-downtime DDL patterns, migration sequencing, and rollback strategy for Oracle schema changes. Use when planning or reviewing schema changes on a live system.
license: MIT
---

# Schema Migration Patterns

**Tradeoff:** Schema changes that work on a dev DB can lock a 100M-row production table for hours. Test with production-scale data.

## 1. Column Changes

**Never add a NOT NULL column without a default in a single step.**

```sql
-- Phase 1 (deploy): add nullable
ALTER TABLE orders ADD note VARCHAR2(500);

-- Phase 2 (backfill — run in batches during low traffic):
UPDATE orders SET note = 'migrated' WHERE note IS NULL;
COMMIT;

-- Phase 3 (next release): enforce constraint
ALTER TABLE orders MODIFY note NOT NULL;
```

Dropping a column: mark deprecated in code in release N, drop the column in release N+1. Never same-release.

## 2. Index Creation

**`CREATE INDEX` without `ONLINE` locks the table for writes.**

```sql
CREATE INDEX idx_orders_status ON orders(status) ONLINE;
```

`ONLINE` builds without blocking DML. Takes longer but safe on live tables. On partitioned tables, create per-partition during low-traffic windows.

## 3. Renames (Expand-Contract)

Direct rename breaks running application code. Use expand-contract:

1. Add `new_name` column
2. Sync data: trigger or batch backfill
3. Update application code to use `new_name`
4. Drop `old_name` in next release

## 4. Pre-Migration Checklist

- [ ] Tested on staging with production-scale row counts
- [ ] Lock duration estimated — use `ONLINE` clause where possible
- [ ] Rollback script written and tested
- [ ] Maintenance window scheduled for non-ONLINE DDL
- [ ] Application can run against both old and new schema during the rollout window

## 5. Rollback

Every migration needs a matching rollback script, stored alongside:

```sql
-- V42__rollback_add_orders_note.sql
ALTER TABLE orders DROP COLUMN note;
```

The test: Can the rollback script run immediately after the migration without data loss?
