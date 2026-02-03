-- Insert all staff members from the contact list
-- Run this script after setup_division_tables.sql

-- Clear existing staff data to avoid duplicates
DELETE FROM staff_members;

-- Executive Division
INSERT INTO staff_members (name, email, job_title, department, mobile, business_phone, office_location, division_id)
VALUES
  ('Andy Ambulu', 'aambulu@scpng.gov.pg', 'General Counsel', 'Secretariat Unit', '+675 74235369', '+675 321 2223', 'Executive Division', 'executive-division'),
  ('James Joshua', 'jjoshua@scpng.gov.pg', 'Acting Chief Executive Officer', 'Executive Division', 'N/A', '+675 321 2223', 'Office of the Chairman', 'executive-division'),
  ('Robert Salmon Minak', 'rminak@scpng.gov.pg', 'Acting Executive Chairman', 'Executive Unit', 'N/A', 'N/A', 'Securities Commission of Papua New Guinea', 'executive-division');

-- Corporate Services Division
INSERT INTO staff_members (name, email, job_title, department, mobile, business_phone, office_location, division_id)
VALUES
  ('Anita Kosnga', 'akosnga@scpng.gov.pg', 'Finance Officer', 'Finance Unit', '+675 79632655', '+675 3212223', 'Corporate Services Division', 'corporate-services-division'),
  ('Anderson Yambe', 'ayambe@scpng.gov.pg', 'Senior Finance Officer', 'Finance Unit', '70980208/81528285', '321 2223', 'Corporate Service Division', 'corporate-services-division'),
  ('Eric Kipongi', 'ekipongi@scpng.gov.pg', 'Manager Information Technology', 'IT Unit', '+675 75652192', '+675 321 2223', 'Corporate Service Division', 'corporate-services-division'),
  ('John Sarwom', 'jsarwom@scpng.gov.pg', 'Senior IT Database Officer', 'IT Unit', '+675 77508555', '+675 321 2223', 'Corporate Services Division', 'corporate-services-division'),
  ('Joel Johnny Waiya', 'jwaiya@scpng.gov.pg', 'Senior Human Resource Officer', 'Human Resources Unit', '+675 71882467', '+675 321 2223', 'Corporate Services Division', 'corporate-services-division'),
  ('Lenome Rex MBalupa', 'lrmbalupa@scpng.gov.pg', 'Administrative Driver', 'Corporate Services Unit', 'N/A', '+675 3212223', 'Corporate Services Division', 'corporate-services-division'),
  ('Monica Mackey', 'mmackey@scpng.gov.pg', 'Senior Payroll Officer', 'Human Resource Unit', '+675 73497301/76100860', '+675 3212223', 'Coporate Services Divsion', 'corporate-services-division'),
  ('Monica Abau-Sapulai', 'msapulai@scpng.gov.pg', 'Senior Systems Analyst Consultant', 'Information Technology', '+675 81620231', 'N/A', 'Securities Commission of Papua New Guinea', 'corporate-services-division'),
  ('Mark Timea', 'mtimea@scpng.gov.pg', 'Admin Officer', 'Human Resources Unit', '+675 71233953', '+675 321 2223', 'Corporate Service Division', 'corporate-services-division'),
  ('Mercy Tipitap', 'mtipitap@scpng.gov.pg', 'Senior Finance Officer', 'Finance Unit', '+675 72103762', '+675 321 2223', 'Corporate Services Division', 'corporate-services-division'),
  ('Sisia Asigau', 'sasigau@scpng.gov.pg', 'Receptionist', 'Corporate Service Division', '+675 71823186', '321 2223', 'MRD Builiding Level 3', 'corporate-services-division'),
  ('Sulluh Kamitu', 'skamitu@scpng.gov.pg', 'Senior HR Officer', 'HR Department', 'N/A', 'N/A', 'N/A', 'corporate-services-division'),
  ('Sophia Marai', 'smarai@scpng.gov.pg', 'Receptionist', 'Human Resources Unit', '+675 70118699', 'Corporate Services Division', 'Corporate Services Division', 'corporate-services-division'),
  ('Sam Taki', 'staki@scpng.gov.pg', 'Acting Director Corporate Service', 'Finance Unit', 'N/A', '+675 321 2223', 'Corporate Services Division', 'corporate-services-division'),
  ('Thomas Mondaya', 'tmondaya@scpng.gov.pg', 'Senior Payroll Officer', 'Human Resources Unit', '+675 71208950', '+675 3212223', 'Corporate Services Division', 'corporate-services-division');

-- Licensing Market & Supervision Division
INSERT INTO staff_members (name, email, job_title, department, mobile, business_phone, office_location, division_id)
VALUES
  ('Esther Alia', 'ealia@scpng.gov.pg', 'Market Data Officer', 'Market Data Unit', '+675 74410228', '+675 321 2223', 'Licensing Market & Supervision Division', 'licensing-market-supervision-division'),
  ('Jacob Kom', 'jkom@scpng.gov.pg', 'Senior Investigations Officer', 'Investigations Unit', 'N/A', '+675 321 2223', 'Licensing Market & Supervision Division', 'licensing-market-supervision-division'),
  ('Leeroy Wambillie', 'lwambillie@scpng.gov.pg', 'Senior Licensing Officer', 'Licensing Unit', '+675 70287992', '+675 321 2223', 'Licensing Market & Supervision Division', 'licensing-market-supervision-division'),
  ('Max Siwi', 'msiwi@scpng.gov.pg', 'Inestigation Officer', 'Investigation Unit', '+675 79540288', '+675 321 2223', 'Licensing Market & Supervision Division', 'licensing-market-supervision-division'),
  ('Regina Wai', 'rwai@scpng.gov.pg', 'Senior Supervision Officer', 'Supervision Unit', '+675 72818920/75709357', '+675 321 2223', 'Licensing Market & Supervision Division', 'licensing-market-supervision-division'),
  ('Titus Angu', 'tangu@scpng.gov.pg', 'Supervision Officer', 'Supervision Unit', 'N/A', '+675 321 2223', 'Licensing Market & Supervision Division', 'licensing-market-supervision-division'),
  ('Zomay Apini', 'zapini@scpng.gov.pg', 'Market Data Manager', 'Market Data Unit', '+675 70553451', '+675 321 2223', 'Licensing Market & Supervision Division', 'licensing-market-supervision-division');

-- Legal Services Division
INSERT INTO staff_members (name, email, job_title, department, mobile, business_phone, office_location, division_id)
VALUES
  ('Isaac Mel', 'imel@scpng.gov.pg', 'Senior Legal Officer Enforcement & Compliance', 'Legal Advisory Unit', '+675 74301320', '+675 321 2223', 'Legal Services Division', 'legal-services-division'),
  ('Immanuel Minoga', 'iminoga@scpng.gov.pg', 'Legal Officer', 'Legal Advisory Unit', '+675 71105474', '+675 321 2223', 'Legal Services Division', 'legal-services-division'),
  ('Johnson Tengere', 'jtengere@scpng.gov.pg', 'Legal Clark', 'Legal Advisory Unit', '+675 72417196', '+675 321 2223', 'Legal Division', 'legal-services-division'),
  ('Tony Kawas', 'tkawas@scpng.gov.pg', 'Senior Legal Officer', 'Legal Advisory Unit', 'N/A', '+675 321 2223', 'Legal Services Division', 'legal-services-division'),
  ('Tyson Yapao', 'tyapao@scpng.gov.pg', 'Legal Manager - Compliance & Enforcement', 'Legal Advisory Unit', '+675 78314741', '+675 321 2223', 'Legal Advisory Division', 'legal-services-division');

-- Research & Publication Division
INSERT INTO staff_members (name, email, job_title, department, mobile, business_phone, office_location, division_id)
VALUES
  ('Howard Bando', 'hbando@scpng.gov.pg', 'Publication Officer', 'Media & Publication Unit', '+675 72017516', '+675 321 2223', 'Research & Publication Division', 'research-publication-division'),
  ('Joy Komba', 'jkomba@scpng.gov.pg', 'Director Research & Publication', 'Research & Publication', '+675 78188586/71183624', '+675 321 2223', 'Research & Publication', 'research-publication-division'),
  ('Newman Tandawai', 'ntandawai@scpng.gov.pg', 'Research Officer', 'Research Unit', '+675 73721873', '+675 321 2223', 'Research & Publication Division', 'research-publication-division');

-- Secretariat Unit
INSERT INTO staff_members (name, email, job_title, department, mobile, business_phone, office_location, division_id)
VALUES
  ('Joyce Nii', 'jnii@scpng.gov.pg', 'Executive Secretary', 'Secretariat Unit', '+675 72326848', '+675 321 2223', 'Office of the Chairaman', 'secretariat-unit'),
  ('Lovelyn Karlyo', 'lkarlyo@scpng.gov.pg', 'Divisional Secretary', 'Secretariat Unit', '+675 71723255', '+675 321 2223', 'Office of the Chairman', 'secretariat-unit');

-- Add admin and service accounts 
INSERT INTO staff_members (name, email, job_title, department, mobile, business_phone, office_location, division_id)
VALUES
  ('Administrator', 'admin@scpng.gov.pg', 'System Administrator', 'IT Unit', 'N/A', 'N/A', 'Corporate Services Division', 'corporate-services-division'),
  ('Administrator', 'admin@scpng1.onmicrosoft.com', 'System Administrator', 'IT Unit', 'N/A', '675 72287868', 'Corporate Services Division', 'corporate-services-division'),
  ('General Enquiries', 'ask@scpng.gov.pg', 'Information Service', 'Public Relations', 'N/A', 'N/A', 'Secretariat Unit', 'secretariat-unit'),
  ('SCPNG Board Room', 'boardroom@scpng.gov.pg', 'Facility', 'Corporate Services Division', 'N/A', '+675 321 2223', 'Level 2 MRDC Haus, Downtown', 'corporate-services-division'),
  ('Duncan Iangalio', 'diangalio@scpng.gov.pg', 'IT Support', 'IT Unit', 'N/A', 'N/A', 'Corporate Services Division', 'corporate-services-division'),
  ('Ian Kariapa', 'ikariapa@scpng.gov.pg', 'Support Staff', 'Administrative Services', 'N/A', 'N/A', 'Corporate Services Division', 'corporate-services-division'),
  ('Jacob Pakao', 'jpakao@scpng.gov.pg', 'Support Staff', 'Administrative Services', 'N/A', 'N/A', 'Corporate Services Division', 'corporate-services-division'),
  ('Licenses Queries', 'license@scpng.gov.pg', 'Information Service', 'Licensing Unit', 'N/A', 'N/A', 'Licensing Market & Supervision Division', 'licensing-market-supervision-division'),
  ('Client/Investor Queries', 'queries@scpng.gov.pg', 'Information Service', 'Public Relations', 'N/A', 'N/A', 'Secretariat Unit', 'secretariat-unit'),
  ('Shirley Toongamena', 'stoongamena@scpng.gov.pg', 'Support Staff', 'Administrative Services', 'N/A', 'N/A', 'Corporate Services Division', 'corporate-services-division'),
  ('SCPNG Office Runs Bookings', 'SCPNGOfficeRunsBookings@scpng.gov.pg', 'Service Account', 'Administrative Services', 'N/A', 'N/A', 'Corporate Services Division', 'corporate-services-division');

-- Now run the assign_users_to_divisions.sql script to assign roles 