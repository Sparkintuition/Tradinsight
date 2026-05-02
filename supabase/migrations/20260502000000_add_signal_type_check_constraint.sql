-- Restrict crypto_signals.signal_type to the three valid values: 'Long', 'Short', 'Hold'.
-- 'Hold' represents a no-trade / sit-in-cash period (manual TPI signals only — never via webhook).
--
-- Existing 47 rows are all 'Long' or 'Short' (Title Case), so this constraint is safe to apply.
-- If any row violates it, the ALTER will fail and you can find the offender via:
--   SELECT id, signal_type FROM crypto_signals WHERE signal_type NOT IN ('Long','Short','Hold');

ALTER TABLE crypto_signals
  ADD CONSTRAINT crypto_signals_signal_type_check
  CHECK (signal_type IN ('Long', 'Short', 'Hold'));

-- Rollback (paste this into the SQL editor to revert):
-- ALTER TABLE crypto_signals DROP CONSTRAINT crypto_signals_signal_type_check;
