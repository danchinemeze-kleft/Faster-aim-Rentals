-- Add RLS policies to existing affiliates table

-- Enable RLS if not already enabled
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own affiliate profile
CREATE POLICY "Users can read own affiliate profile"
  ON affiliates FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Admins can read all affiliates
CREATE POLICY "Admins can read all affiliates"
  ON affiliates FOR SELECT
  USING (auth.jwt()->>'role' = 'admin');

-- Policy 3: Users can insert their own affiliate record (one-time only via signup)
CREATE POLICY "Users can insert own affiliate record"
  ON affiliates FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 4: Service role (backend) can update records
CREATE POLICY "Service role can update affiliates"
  ON affiliates FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
