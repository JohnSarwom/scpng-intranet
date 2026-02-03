// Define the divisions based on the staff contact information
import { Division as TypeDivision, DivisionRole } from '@/types';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  mobile: string;
  businessPhone: string;
  officeLocation: string;
  divisionId: string;
}

// Use Division type from types/index.ts
export const divisions: TypeDivision[] = [
  {
    id: "executive-division",
    name: "Executive Division",
    description: "Responsible for overall leadership and management of the organization",
    code: "EXEC",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "corporate-services-division",
    name: "Corporate Services Division",
    description: "Handles internal corporate operations including HR, Finance, and IT",
    code: "CSD",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "licensing-market-supervision-division",
    name: "Licensing Market & Supervision Division",
    description: "Responsible for licensing, market supervision, and investigations",
    code: "LMSD",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "legal-services-division",
    name: "Legal Services Division",
    description: "Provides legal advisory and enforcement services",
    code: "LSD",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "research-publication-division",
    name: "Research & Publication Division",
    description: "Responsible for research, publications, and media relations",
    code: "RPD",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "secretariat-unit",
    name: "Secretariat Unit",
    description: "Supports the executive with administrative functions",
    code: "SU",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Map each staff member to their respective division
export const staffMembers: StaffMember[] = [
  {
    id: "1",
    name: "Andy Ambulu",
    email: "aambulu@scpng.gov.pg",
    jobTitle: "General Counsel",
    department: "Secretariat Unit",
    mobile: "+675 74235369",
    businessPhone: "+675 321 2223",
    officeLocation: "Executive Division",
    divisionId: "executive-division"
  },
  {
    id: "2",
    name: "Anita Kosnga",
    email: "akosnga@scpng.gov.pg",
    jobTitle: "Finance Officer",
    department: "Finance Unit",
    mobile: "+675 79632655",
    businessPhone: "+675 3212223",
    officeLocation: "Corporate Services Division",
    divisionId: "corporate-services-division"
  },
  {
    id: "3",
    name: "Anderson Yambe",
    email: "ayambe@scpng.gov.pg",
    jobTitle: "Senior Finance Officer",
    department: "Finance Unit",
    mobile: "70980208/81528285",
    businessPhone: "321 2223",
    officeLocation: "Corporate Service Division",
    divisionId: "corporate-services-division"
  },
  {
    id: "4",
    name: "Esther Alia",
    email: "ealia@scpng.gov.pg",
    jobTitle: "Market Data Officer",
    department: "Market Data Unit",
    mobile: "+675 74410228",
    businessPhone: "+675 321 2223",
    officeLocation: "Licensing Market & Supervision Division",
    divisionId: "licensing-market-supervision-division"
  },
  {
    id: "5",
    name: "Eric Kipongi",
    email: "ekipongi@scpng.gov.pg",
    jobTitle: "Manager Information Technology",
    department: "IT Unit",
    mobile: "+675 75652192",
    businessPhone: "+675 321 2223",
    officeLocation: "Corporate Service Division",
    divisionId: "corporate-services-division"
  },
  {
    id: "6",
    name: "Howard Bando",
    email: "hbando@scpng.gov.pg",
    jobTitle: "Publication Officer",
    department: "Media & Publication Unit",
    mobile: "+675 72017516",
    businessPhone: "+675 321 2223",
    officeLocation: "Research & Publication Division",
    divisionId: "research-publication-division"
  },
  {
    id: "7",
    name: "Isaac Mel",
    email: "imel@scpng.gov.pg",
    jobTitle: "Senior Legal Officer Enforcement & Compliance",
    department: "Legal Advisory Unit",
    mobile: "+675 74301320",
    businessPhone: "+675 321 2223",
    officeLocation: "Legal Services Division",
    divisionId: "legal-services-division"
  },
  {
    id: "8",
    name: "Immanuel Minoga",
    email: "iminoga@scpng.gov.pg",
    jobTitle: "Legal Officer",
    department: "Legal Advisory Unit",
    mobile: "+675 71105474",
    businessPhone: "+675 321 2223",
    officeLocation: "Legal Services Division",
    divisionId: "legal-services-division"
  },
  {
    id: "9",
    name: "James Joshua",
    email: "jjoshua@scpng.gov.pg",
    jobTitle: "Acting Chief Executive Officer",
    department: "Executive Division",
    mobile: "N/A",
    businessPhone: "+675 321 2223",
    officeLocation: "Office of the Chairman",
    divisionId: "executive-division"
  },
  {
    id: "10",
    name: "Jacob Kom",
    email: "jkom@scpng.gov.pg",
    jobTitle: "Senior Investigations Officer",
    department: "Investigations Unit",
    mobile: "N/A",
    businessPhone: "+675 321 2223",
    officeLocation: "Licensing Market & Supervision Division",
    divisionId: "licensing-market-supervision-division"
  },
  {
    id: "11",
    name: "Joy Komba",
    email: "jkomba@scpng.gov.pg",
    jobTitle: "Director Research & Publication",
    department: "Research & Publication",
    mobile: "+675 78188586/71183624",
    businessPhone: "+675 321 2223",
    officeLocation: "Research & Publication",
    divisionId: "research-publication-division"
  },
  {
    id: "12",
    name: "Joyce Nii",
    email: "jnii@scpng.gov.pg",
    jobTitle: "Executive Secretary",
    department: "Secretariat Unit",
    mobile: "+675 72326848",
    businessPhone: "+675 321 2223",
    officeLocation: "Office of the Chairaman",
    divisionId: "secretariat-unit"
  },
  {
    id: "13",
    name: "John Sarwom",
    email: "jsarwom@scpng.gov.pg",
    jobTitle: "Senior IT Database Officer",
    department: "IT Unit",
    mobile: "+675 77508555",
    businessPhone: "+675 321 2223",
    officeLocation: "Corporate Services Division",
    divisionId: "corporate-services-division"
  },
  {
    id: "14",
    name: "Johnson Tengere",
    email: "jtengere@scpng.gov.pg",
    jobTitle: "Legal Clark",
    department: "Legal Advisory Unit",
    mobile: "+675 72417196",
    businessPhone: "+675 321 2223",
    officeLocation: "Legal Division",
    divisionId: "legal-services-division"
  },
  {
    id: "15",
    name: "Joel Johnny Waiya",
    email: "jwaiya@scpng.gov.pg",
    jobTitle: "Senior Human Resource Officer",
    department: "Human Resource Unit",
    mobile: "+675 71882467",
    businessPhone: "+675 321 2223",
    officeLocation: "Corporate Services Division",
    divisionId: "corporate-services-division"
  },
  {
    id: "16",
    name: "Lovelyn Karlyo",
    email: "lkarlyo@scpng.gov.pg",
    jobTitle: "Divisional Secretary",
    department: "Secretariat Unit",
    mobile: "+675 71723255",
    businessPhone: "+675 321 2223",
    officeLocation: "Office of the Chairman",
    divisionId: "secretariat-unit"
  },
  {
    id: "17",
    name: "Lenome Rex MBalupa",
    email: "lrmbalupa@scpng.gov.pg",
    jobTitle: "Administrative Driver",
    department: "Corporate Services Unit",
    mobile: "N/A",
    businessPhone: "+675 3212223",
    officeLocation: "Corporate Services Division",
    divisionId: "corporate-services-division"
  },
  {
    id: "18",
    name: "Leeroy Wambillie",
    email: "lwambillie@scpng.gov.pg",
    jobTitle: "Senior Licensing Officer",
    department: "Licensing Unit",
    mobile: "+675 70287992",
    businessPhone: "+675 321 2223",
    officeLocation: "Licensing Market & Supervision Division",
    divisionId: "licensing-market-supervision-division"
  },
  {
    id: "19",
    name: "Monica Mackey",
    email: "mmackey@scpng.gov.pg",
    jobTitle: "Senior Payroll Officer",
    department: "Human Resource Unit",
    mobile: "+675 73497301/76100860",
    businessPhone: "+675 3212223",
    officeLocation: "Coporate Services Divsion",
    divisionId: "corporate-services-division"
  },
  {
    id: "20",
    name: "Monica Abau-Sapulai",
    email: "msapulai@scpng.gov.pg",
    jobTitle: "Senior Systems Analyst Consultant",
    department: "Information Technology",
    mobile: "+675 81620231",
    businessPhone: "N/A",
    officeLocation: "Securities Commission of Papua New Guinea",
    divisionId: "corporate-services-division"
  },
  {
    id: "21",
    name: "Max Siwi",
    email: "msiwi@scpng.gov.pg",
    jobTitle: "Inestigation Officer",
    department: "Investigation Unit",
    mobile: "+675 79540288",
    businessPhone: "+675 321 2223",
    officeLocation: "Licensing Market & Supervision Division",
    divisionId: "licensing-market-supervision-division"
  },
  {
    id: "22",
    name: "Mark Timea",
    email: "mtimea@scpng.gov.pg",
    jobTitle: "Admin Officer",
    department: "Human Resource Unit",
    mobile: "+675 71233953",
    businessPhone: "+675 321 2223",
    officeLocation: "Corporate Service Division",
    divisionId: "corporate-services-division"
  },
  {
    id: "23",
    name: "Mercy Tipitap",
    email: "mtipitap@scpng.gov.pg",
    jobTitle: "Senior Finance Officer",
    department: "Finance Unit",
    mobile: "+675 72103762",
    businessPhone: "+675 321 2223",
    officeLocation: "Corporate Services Division",
    divisionId: "corporate-services-division"
  },
  {
    id: "24",
    name: "Newman Tandawai",
    email: "ntandawai@scpng.gov.pg",
    jobTitle: "Research Officer",
    department: "Research Unit",
    mobile: "+675 73721873",
    businessPhone: "+675 321 2223",
    officeLocation: "Research & Publication Division",
    divisionId: "research-publication-division"
  },
  {
    id: "25",
    name: "Robert Salmon Minak",
    email: "rminak@scpng.gov.pg",
    jobTitle: "Acting Executive Chairman",
    department: "Executive Unit",
    mobile: "N/A",
    businessPhone: "N/A",
    officeLocation: "Securities Commission of Papua New Guinea",
    divisionId: "executive-division"
  },
  {
    id: "26",
    name: "Regina Wai",
    email: "rwai@scpng.gov.pg",
    jobTitle: "Senior Supervision Officer",
    department: "Supervision Unit",
    mobile: "+675 72818920/75709357",
    businessPhone: "+675 321 2223",
    officeLocation: "Licensing Market & Supervision Division",
    divisionId: "licensing-market-supervision-division"
  },
  {
    id: "27",
    name: "Sisia Asigau",
    email: "sasigau@scpng.gov.pg",
    jobTitle: "Receptionist",
    department: "Corporate Service Division",
    mobile: "+675 71823186",
    businessPhone: "321 2223",
    officeLocation: "MRD Builiding Level 3",
    divisionId: "corporate-services-division"
  },
  {
    id: "28",
    name: "Sulluh Kamitu",
    email: "skamitu@scpng.gov.pg",
    jobTitle: "Senior HR Officer",
    department: "HR Department",
    mobile: "N/A",
    businessPhone: "N/A",
    officeLocation: "N/A",
    divisionId: "corporate-services-division"
  },
  {
    id: "29",
    name: "Sophia Marai",
    email: "smarai@scpng.gov.pg",
    jobTitle: "Receptionist",
    department: "Human Resource Unit",
    mobile: "+675 70118699",
    businessPhone: "Corporate Services Division",
    officeLocation: "Corporate Services Division",
    divisionId: "corporate-services-division"
  },
  {
    id: "30",
    name: "Sam Taki",
    email: "staki@scpng.gov.pg",
    jobTitle: "Acting Director Corporate Service",
    department: "Finance Unit",
    mobile: "N/A",
    businessPhone: "+675 321 2223",
    officeLocation: "Corporate Services Division",
    divisionId: "corporate-services-division"
  },
  {
    id: "31",
    name: "Titus Angu",
    email: "tangu@scpng.gov.pg",
    jobTitle: "Supervision Officer",
    department: "Supervision Unit",
    mobile: "N/A",
    businessPhone: "+675 321 2223",
    officeLocation: "Licensing Market & Supervision Division",
    divisionId: "licensing-market-supervision-division"
  },
  {
    id: "32",
    name: "Tony Kawas",
    email: "tkawas@scpng.gov.pg",
    jobTitle: "Senior Legal Officer",
    department: "Legal Advisory Unit",
    mobile: "N/A",
    businessPhone: "+675 321 2223",
    officeLocation: "Legal Services Division",
    divisionId: "legal-services-division"
  },
  {
    id: "33",
    name: "Thomas Mondaya",
    email: "tmondaya@scpng.gov.pg",
    jobTitle: "Senior Payroll Officer",
    department: "Human Resource Unit",
    mobile: "+675 71208950",
    businessPhone: "+675 3212223",
    officeLocation: "Corporate Services Division",
    divisionId: "corporate-services-division"
  },
  {
    id: "34",
    name: "Tyson Yapao",
    email: "tyapao@scpng.gov.pg",
    jobTitle: "Legal Manager - Compliance & Enforcement",
    department: "Legal Advisory Unit",
    mobile: "+675 78314741",
    businessPhone: "+675 321 2223",
    officeLocation: "Legal Advisory Division",
    divisionId: "legal-services-division"
  },
  {
    id: "35",
    name: "Zomay Apini",
    email: "zapini@scpng.gov.pg",
    jobTitle: "Market Data Manager",
    department: "Market Data Unit",
    mobile: "+675 70553451",
    businessPhone: "+675 321 2223",
    officeLocation: "Licensing Market & Supervision Division",
    divisionId: "licensing-market-supervision-division"
  }
];

// Helper function to get staff members by division
export const getStaffMembersByDivision = (divisionId: string): StaffMember[] => {
  return staffMembers.filter(staff => staff.divisionId === divisionId);
};

// Helper function to find a staff member by email
export const getStaffMemberByEmail = (email: string): StaffMember | undefined => {
  return staffMembers.find(staff => staff.email.toLowerCase() === email.toLowerCase());
};

// Export DivisionRole from types
export type { DivisionRole };

export interface DivisionMembership {
  id: string;
  userId: string;
  divisionId: string;
  role: DivisionRole;
} 