-- RLS Policies for Mr. Rent Platform
-- Created: 2026-09-19
-- Purpose: Row-Level Security policies for data protection and multi-tenancy

-- ============================================
-- 1. AFFILIATES TABLE RLS
-- ============================================

-- Enable RLS on affiliates table
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert only their own affiliate record
CREATE POLICY "Users can insert own affiliate record"
ON affiliates FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy: Users can read only their own affiliate profile
CREATE POLICY "Users can read own affiliate profile"
ON affiliates FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy: Users can update only their own affiliate record
CREATE POLICY "Users can update own affiliate record"
ON affiliates FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Admins can view all affiliate records
CREATE POLICY "Admins can read all affiliates"
ON affiliates FOR SELECT
TO authenticated
USING (auth.jwt()->>'role' = 'admin');

-- Policy: Service role (backend APIs) can manage all affiliates
CREATE POLICY "Service role can manage affiliates"
ON affiliates FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 2. AFFILIATE_COMMISSIONS TABLE RLS
-- ============================================

-- Enable RLS on affiliate_commissions table
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- Policy: Affiliates can view only their own commissions
CREATE POLICY "Affiliates can read own commissions"
ON affiliate_commissions FOR SELECT
TO authenticated
USING (affiliate_id = auth.uid());

-- Policy: Admins can view all commissions
CREATE POLICY "Admins can read all commissions"
ON affiliate_commissions FOR SELECT
TO authenticated
USING (auth.jwt()->>'role' = 'admin');

-- Policy: Service role (backend APIs) can manage all commissions
CREATE POLICY "Service role can manage commissions"
ON affiliate_commissions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 3. FEEDBACK TABLE RLS (if applicable)
-- ============================================

-- Enable RLS on Feedback table
ALTER TABLE "Feedback" ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert feedback
CREATE POLICY "Authenticated users can insert feedback"
ON "Feedback" FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view only their own feedback
CREATE POLICY "Users can view own feedback"
ON "Feedback" FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can update only their own feedback
CREATE POLICY "Users can update own feedback"
ON "Feedback" FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own feedback
CREATE POLICY "Users can delete own feedback"
ON "Feedback" FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
ON "Feedback" FOR SELECT
TO authenticated
USING (auth.jwt()->>'role' = 'admin');

-- Policy: Service role (backend) can manage all feedback
CREATE POLICY "Service role can manage feedback"
ON "Feedback" FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- NOTES
-- ============================================
--
-- RLS Strategy:
-- - authenticated: Users can only access their own data
-- - admin role: Admins can view all data
-- - service_role: Backend APIs have full access
--
-- Security Model:
-- - No anonymous access (all policies use TO authenticated or service_role)
-- - User data isolation via auth.uid()
-- - Admin override for moderation
-- - Service role for backend operations
--
-- Testing RLS:
-- 1. Create test users
-- 2. Try to access other user's data (should fail)
-- 3. Try with admin role (should succeed)
-- 4. Test service_role APIs (should work)
