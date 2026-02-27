module FinancialRules where

import Prelude
import Data.Maybe (Maybe(..))

-- A pure function to validate a transaction amount.
-- Demonstrates the "Concise Expression" required for Juspay's backend logic.
validateAmount :: Number -> Maybe String
validateAmount amount
  | amount <= 0.0     = Just "Amount must be positive"
  | amount > 100000.0 = Just "Amount exceeds single transaction limit"
  | otherwise         = Nothing
