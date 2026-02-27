module Security where

-- Pure Haskell function to verify a transaction hash
-- Demonstrates the 'First Principles' security logic Juspay values.
verifySignature :: String -> String -> Bool
verifySignature receivedHash calculatedHash = 
    receivedHash == calculatedHash

-- Idempotency check logic (simplified for PayOS)
isDuplicate :: String -> [String] -> Bool
isDuplicate txnId history = txnId \elem\ history
