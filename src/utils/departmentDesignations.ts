/**
 * Department to Manager/Director Designation Mapping
 * Maps department names to their respective manager and director titles
 */

export interface DepartmentDesignations {
  manager: string;
  director: string;
}

export const DEPARTMENT_DESIGNATIONS: Record<string, DepartmentDesignations> = {
  // IT Department
  'IT': {
    manager: 'Manager IT',
    director: 'Director Corporate Service',
  },
  'Information Technology': {
    manager: 'Manager IT',
    director: 'Director Corporate Service',
  },

  // Add more departments as needed
  'HR': {
    manager: 'Manager HR',
    director: 'Director Corporate Service',
  },
  'Human Resources': {
    manager: 'Manager HR',
    director: 'Director Corporate Service',
  },
  'Finance': {
    manager: 'Manager Finance',
    director: 'Director Corporate Service',
  },
  'Operations': {
    manager: 'Manager Operations',
    director: 'Director Operations',
  },

  // Default fallback
  'DEFAULT': {
    manager: 'Manager',
    director: 'Director',
  },
};

/**
 * Get manager designation based on department
 */
export const getManagerDesignation = (department?: string): string => {
  if (!department) return DEPARTMENT_DESIGNATIONS.DEFAULT.manager;

  // Try exact match first
  if (DEPARTMENT_DESIGNATIONS[department]) {
    return DEPARTMENT_DESIGNATIONS[department].manager;
  }

  // Try case-insensitive match
  const departmentKey = Object.keys(DEPARTMENT_DESIGNATIONS).find(
    key => key.toLowerCase() === department.toLowerCase()
  );

  if (departmentKey) {
    return DEPARTMENT_DESIGNATIONS[departmentKey].manager;
  }

  return DEPARTMENT_DESIGNATIONS.DEFAULT.manager;
};

/**
 * Get director designation based on department
 */
export const getDirectorDesignation = (department?: string): string => {
  if (!department) return DEPARTMENT_DESIGNATIONS.DEFAULT.director;

  // Try exact match first
  if (DEPARTMENT_DESIGNATIONS[department]) {
    return DEPARTMENT_DESIGNATIONS[department].director;
  }

  // Try case-insensitive match
  const departmentKey = Object.keys(DEPARTMENT_DESIGNATIONS).find(
    key => key.toLowerCase() === department.toLowerCase()
  );

  if (departmentKey) {
    return DEPARTMENT_DESIGNATIONS[departmentKey].director;
  }

  return DEPARTMENT_DESIGNATIONS.DEFAULT.director;
};
