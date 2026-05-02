-- ─────────────────────────────────────────────────────────────────────────────
-- Insert a manual "Hold" signal (Strategy + TPI tab only).
--
-- WHEN TO USE: market has no clear trend and users should sit in cash instead
-- of trading. Hold appears ONLY on the "Strategy + TPI" tab — the Strategy
-- Only tab filters Hold rows out (Hold is a TPI-layer concept, not a raw
-- strategy signal).
--
-- The CHECK constraint `crypto_signals_signal_type_check` enforces that
-- signal_type must be one of: 'Long', 'Short', 'Hold'.
--
-- Hold contributes 0% return — the cumulative balance does not move on a
-- Hold row, and Hold is excluded from any future win-rate calculation.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Close any currently active BTC signal (mirrors what the webhook does
--    automatically for Long/Short — keeps "active" pointing to one row).
UPDATE crypto_signals
SET status = 'closed'
WHERE coin = 'BTC' AND status = 'active';

-- 2. Insert the Hold signal.
--    - signal_price = price at the moment the Hold call started (still required;
--      it's used as the exit price of the previous trade and as the entry "marker"
--      shown on the card).
--    - tpi_medium_term / tpi_value_indicator are usually 'Neutral' for a Hold
--      but stay editable — set whatever reflects the call.
--    - market_analysis is optional.
INSERT INTO crypto_signals (
  coin,
  signal_type,
  signal_price,
  status,
  tpi_medium_term,
  tpi_value_indicator,
  market_analysis,
  confidence
) VALUES (
  'BTC',
  'Hold',
  /* signal_price */     0,           -- ← REPLACE with current BTC price
  'active',
  /* tpi_medium_term */  'Neutral',   -- ← optionally 'Positive' / 'Negative'
  /* tpi_value_indicator */ 'Neutral', -- ← optionally 'Positive' / 'Negative'
  /* market_analysis */  NULL,         -- ← optional explanation, premium-only
  /* confidence */       50
);
