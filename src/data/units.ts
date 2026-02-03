export interface Unit {
  id: string;
  name: string;
}

export const units: Unit[] = [
  { id: "it-unit", name: "IT Unit" },
  { id: "finance-unit", name: "Finance Unit" },
  { id: "hr-unit", name: "Human Resource Unit" },
  { id: "legal-advisory-unit", name: "Legal Advisory Unit" },
  { id: "market-data-unit", name: "Market Data Unit" },
  { id: "investigations-unit", name: "Investigations Unit" },
  { id: "media-publication-unit", name: "Media & Publication Unit" },
  { id: "research-unit", name: "Research Unit" },
  { id: "supervision-unit", name: "Supervision Unit" },
  { id: "licensing-unit", name: "Licensing Unit" },
  // Add more units as needed
];

// Optional: Helper function if needed elsewhere
export const getUnitById = (id: string): Unit | undefined => {
  return units.find(unit => unit.id === id);
};

export const getUnitByName = (name: string): Unit | undefined => {
  return units.find(unit => unit.name.toLowerCase() === name.toLowerCase());
}; 