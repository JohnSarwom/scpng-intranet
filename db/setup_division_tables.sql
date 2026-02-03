-- Create divisions table
CREATE TABLE divisions (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  code VARCHAR(10),
  manager VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create staff_members table
CREATE TABLE staff_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  job_title VARCHAR(255),
  department VARCHAR(255),
  mobile VARCHAR(50),
  business_phone VARCHAR(50),
  office_location VARCHAR(255),
  division_id VARCHAR(100) REFERENCES divisions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create division_memberships table
CREATE TABLE division_memberships (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  division_id VARCHAR(100) REFERENCES divisions(id),
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, division_id)
);

-- Insert divisions data
INSERT INTO divisions (id, name, description, code)
VALUES 
  ('executive-division', 'Executive Division', 'Responsible for overall leadership and management of the organization', 'EXEC'),
  ('corporate-services-division', 'Corporate Services Division', 'Handles internal corporate operations including HR, Finance, and IT', 'CSD'),
  ('licensing-market-supervision-division', 'Licensing Market & Supervision Division', 'Responsible for licensing, market supervision, and investigations', 'LMSD'),
  ('legal-services-division', 'Legal Services Division', 'Provides legal advisory and enforcement services', 'LSD'),
  ('research-publication-division', 'Research & Publication Division', 'Responsible for research, publications, and media relations', 'RPD'),
  ('secretariat-unit', 'Secretariat Unit', 'Supports the executive with administrative functions', 'SU');

-- Insert sample staff data (first few entries)
INSERT INTO staff_members (name, email, job_title, department, mobile, business_phone, office_location, division_id)
VALUES
  ('Andy Ambulu', 'aambulu@scpng.gov.pg', 'General Counsel', 'Secretariat Unit', '+675 74235369', '+675 321 2223', 'Executive Division', 'executive-division'),
  ('Anita Kosnga', 'akosnga@scpng.gov.pg', 'Finance Officer', 'Finance Unit', '+675 79632655', '+675 3212223', 'Corporate Services Division', 'corporate-services-division'),
  ('Anderson Yambe', 'ayambe@scpng.gov.pg', 'Senior Finance Officer', 'Finance Unit', '70980208/81528285', '321 2223', 'Corporate Service Division', 'corporate-services-division'),
  ('Esther Alia', 'ealia@scpng.gov.pg', 'Market Data Officer', 'Market Data Unit', '+675 74410228', '+675 321 2223', 'Licensing Market & Supervision Division', 'licensing-market-supervision-division'),
  ('Eric Kipongi', 'ekipongi@scpng.gov.pg', 'Manager Information Technology', 'IT Unit', '+675 75652192', '+675 321 2223', 'Corporate Service Division', 'corporate-services-division');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_divisions_updated_at
BEFORE UPDATE ON divisions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_members_updated_at
BEFORE UPDATE ON staff_members
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 