-- Run this SQL in Supabase SQL Editor to set up the affiliate system

-- 1. Create affiliates table
CREATE TABLE affiliates (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ref_code VARCHAR(20) UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create affiliate_commissions table
CREATE TABLE affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  ref_code VARCHAR(20) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- 'reveal' or 'landlord_subscription'
  transaction_amount INTEGER NOT NULL, -- amount paid by user
  commission_amount INTEGER NOT NULL, -- amount earned by affiliate
  paystack_reference TEXT,
  referred_user_id UUID,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' or 'paid'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Enable RLS on affiliates table
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own affiliate profile"
  ON affiliates FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all affiliates"
  ON affiliates FOR SELECT
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Users can insert own affiliate record once"
  ON affiliates FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. Enable RLS on affiliate_commissions table
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can read own commissions"
  ON affiliate_commissions FOR SELECT
  USING (
    affiliate_id = auth.uid() OR
    auth.jwt()->>'role' = 'admin'
  );

-- 5. Create indexes for performance
CREATE INDEX idx_affiliates_ref_code ON affiliates(ref_code);
CREATE INDEX idx_affiliates_status ON affiliates(status);
CREATE INDEX idx_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX idx_commissions_status ON affiliate_commissions(status);
CREATE INDEX idx_commissions_created_at ON affiliate_commissions(created_at DESC);
