-- RLS Policies for Mr. Rent Platform (Complete)
-- Generated: 2026-09-19
-- Source: Supabase pg_policies export (accurate, production-verified)
-- Purpose: Row-Level Security policies for multi-tenancy and data protection

-- ============================================
-- 1. CONTACT_REVEALS TABLE
-- ============================================

ALTER TABLE "Contact_reveals" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can check own reveal" ON "Contact_reveals";
CREATE POLICY "Anyone can check own reveal"
ON "Contact_reveals" FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can insert contact reveal" ON "Contact_reveals";
CREATE POLICY "Anyone can insert contact reveal"
ON "Contact_reveals" FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "landlord_read_reveals" ON "Contact_reveals";
CREATE POLICY "landlord_read_reveals"
ON "Contact_reveals" FOR SELECT
TO authenticated
USING (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "tenant_insert_reveal" ON "Contact_reveals";
CREATE POLICY "tenant_insert_reveal"
ON "Contact_reveals" FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = tenant_id);

DROP POLICY IF EXISTS "tenant_read_own_reveals" ON "Contact_reveals";
CREATE POLICY "tenant_read_own_reveals"
ON "Contact_reveals" FOR SELECT
TO authenticated
USING (auth.uid() = tenant_id);

-- ============================================
-- 2. FEEDBACK TABLE
-- ============================================

ALTER TABLE "Feedback" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all feedback" ON "Feedback";
CREATE POLICY "Admins can view all feedback"
ON "Feedback" FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);

DROP POLICY IF EXISTS "Authenticated users can insert feedback" ON "Feedback";
CREATE POLICY "Authenticated users can insert feedback"
ON "Feedback" FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage feedback" ON "Feedback";
CREATE POLICY "Service role can manage feedback"
ON "Feedback" FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own feedback" ON "Feedback";
CREATE POLICY "Users can delete own feedback"
ON "Feedback" FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own feedback" ON "Feedback";
CREATE POLICY "Users can update own feedback"
ON "Feedback" FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own feedback" ON "Feedback";
CREATE POLICY "Users can view own feedback"
ON "Feedback" FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- 3. PROFILES TABLE
-- ============================================

ALTER TABLE "Profiles" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Landlord can update own profile" ON "Profiles";
CREATE POLICY "Landlord can update own profile"
ON "Profiles" FOR UPDATE
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Landlord can view own profile" ON "Profiles";
CREATE POLICY "Landlord can view own profile"
ON "Profiles" FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON "Profiles";
CREATE POLICY "Users can insert own profile"
ON "Profiles" FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "authenticated_read_landlord_profiles" ON "Profiles";
CREATE POLICY "authenticated_read_landlord_profiles"
ON "Profiles" FOR SELECT
TO authenticated
USING (role = 'landlord'::text);

-- ============================================
-- 4. SUBSCRIPTION TABLE
-- ============================================

ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Landlord can insert own subscription" ON "Subscription";
CREATE POLICY "Landlord can insert own subscription"
ON "Subscription" FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "Landlord can view own subscription" ON "Subscription";
CREATE POLICY "Landlord can view own subscription"
ON "Subscription" FOR SELECT
TO authenticated
USING (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "landlords_insert_own_subscription" ON "Subscription";
CREATE POLICY "landlords_insert_own_subscription"
ON "Subscription" FOR INSERT
TO authenticated
WITH CHECK ((auth.uid())::text = (landlord_id)::text);

DROP POLICY IF EXISTS "landlords_read_own_subscription" ON "Subscription";
CREATE POLICY "landlords_read_own_subscription"
ON "Subscription" FOR SELECT
TO authenticated
USING ((auth.uid())::text = (landlord_id)::text);

-- ============================================
-- 5. AFFILIATES TABLE
-- ============================================

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read all affiliates" ON affiliates;
CREATE POLICY "Admins can read all affiliates"
ON affiliates FOR SELECT
TO public
USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);

DROP POLICY IF EXISTS "Service role can insert affiliates" ON affiliates;
CREATE POLICY "Service role can insert affiliates"
ON affiliates FOR INSERT
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update affiliates" ON affiliates;
CREATE POLICY "Service role can update affiliates"
ON affiliates FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert own affiliate record" ON affiliates;
CREATE POLICY "Users can insert own affiliate record"
ON affiliates FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own affiliate record once" ON affiliates;
CREATE POLICY "Users can insert own affiliate record once"
ON affiliates FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read own affiliate profile" ON affiliates;
CREATE POLICY "Users can read own affiliate profile"
ON affiliates FOR SELECT
TO public
USING (auth.uid() = id);

-- ============================================
-- 6. LISTINGS TABLE
-- ============================================

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can update listing status" ON listings;
CREATE POLICY "Anyone can update listing status"
ON listings FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Landlords can insert listings" ON listings;
CREATE POLICY "Landlords can insert listings"
ON listings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "Landlords can view own listings" ON listings;
CREATE POLICY "Landlords can view own listings"
ON listings FOR SELECT
TO authenticated
USING (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "Public can view approved listings" ON listings;
CREATE POLICY "Public can view approved listings"
ON listings FOR SELECT
TO public
USING (status = 'approved'::text);

-- ============================================
-- 7. PROPERTY_SALES TABLE
-- ============================================

ALTER TABLE property_sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can insert their own listings" ON property_sales;
CREATE POLICY "Authenticated users can insert their own listings"
ON property_sales FOR INSERT
TO public
WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Authenticated users can insert their own sales listings" ON property_sales;
CREATE POLICY "Authenticated users can insert their own sales listings"
ON property_sales FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Public can view active and approved sales" ON property_sales;
CREATE POLICY "Public can view active and approved sales"
ON property_sales FOR SELECT
TO public
USING (status = ANY (ARRAY['approved'::text, 'active'::text]));

DROP POLICY IF EXISTS "Public can view approved listings" ON property_sales;
CREATE POLICY "Public can view approved listings"
ON property_sales FOR SELECT
TO public
USING ((status = 'approved'::text) AND (listing_fee_paid = true) AND (available = true));

DROP POLICY IF EXISTS "Public can view available listings" ON property_sales;
CREATE POLICY "Public can view available listings"
ON property_sales FOR SELECT
TO public
USING ((available = true) AND (status = 'approved'::text));

DROP POLICY IF EXISTS "Sellers can insert own listings" ON property_sales;
CREATE POLICY "Sellers can insert own listings"
ON property_sales FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can update own listings" ON property_sales;
CREATE POLICY "Sellers can update own listings"
ON property_sales FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can update their own listings" ON property_sales;
CREATE POLICY "Sellers can update their own listings"
ON property_sales FOR UPDATE
TO public
USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can view own listings" ON property_sales;
CREATE POLICY "Sellers can view own listings"
ON property_sales FOR SELECT
TO authenticated
USING (auth.uid() = seller_id);

-- ============================================
-- 8. VERYLAND_SUBMISSIONS TABLE
-- ============================================

ALTER TABLE veryland_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can submit" ON veryland_submissions;
CREATE POLICY "Authenticated users can submit"
ON veryland_submissions FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- SUMMARY
-- ============================================
-- Tables covered: 8
-- Policies: 35+
-- Access model: public (open), authenticated (user-specific), service_role (backend)
-- Strategy: Column-level isolation via auth.uid(), status-based visibility for public
