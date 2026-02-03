/**
 * CSV Helper Functions
 * Utility functions for working with CSV data
 */

/**
 * Convert an array of objects to CSV string
 * @param data Array of objects to convert
 * @param headers Optional array of headers, if not provided will use the keys of the first object
 * @returns CSV string representation
 */
export const objectsToCSV = (data: Record<string, any>[], headers?: string[]): string => {
  if (!data || data.length === 0) {
    return headers ? headers.join(',') + '\n' : '';
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create CSV header row
  let csvString = csvHeaders.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = csvHeaders.map(header => {
      const value = item[header];
      
      // Handle values that need quotes (contain commas or quotes)
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      
      // Handle undefined/null values
      return value === null || value === undefined ? '' : String(value);
    });
    
    csvString += row.join(',') + '\n';
  });
  
  return csvString;
};

/**
 * Parse CSV string to array of objects
 * @param csvString CSV string to parse
 * @param headerRow Whether the first row contains headers (default: true)
 * @returns Array of objects parsed from CSV
 */
export const csvToObjects = (csvString: string, headerRow: boolean = true): Record<string, string>[] => {
  if (!csvString) return [];
  
  // Split into rows
  const rows = csvString.split(/\r?\n/).filter(row => row.trim() !== '');
  
  if (rows.length === 0) return [];
  
  // Extract headers
  const headers = headerRow 
    ? parseCSVRow(rows[0]) 
    : rows[0].split(',').map((_, i) => `column${i}`);
  
  // Process data rows
  const startRow = headerRow ? 1 : 0;
  const objects: Record<string, string>[] = [];
  
  for (let i = startRow; i < rows.length; i++) {
    const values = parseCSVRow(rows[i]);
    const obj: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    objects.push(obj);
  }
  
  return objects;
};

/**
 * Parse a CSV row, handling quoted values
 * @param row The CSV row to parse
 * @returns Array of values
 */
const parseCSVRow = (row: string): string[] => {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Double quotes inside quotes - add a single quote
        currentValue += '"';
        i++; // Skip the next quote
      } else {
        // Toggle the insideQuotes flag
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of value
      values.push(currentValue);
      currentValue = '';
    } else {
      // Add character to current value
      currentValue += char;
    }
  }
  
  // Add the last value
  values.push(currentValue);
  return values;
};

/**
 * Validate CSV structure and content
 * @param csvString CSV string to validate
 * @param requiredHeaders Required headers that should exist
 * @returns Object with isValid and error properties
 */
export const validateCSV = (csvString: string, requiredHeaders: string[] = []): { isValid: boolean; error?: string } => {
  if (!csvString) {
    return { isValid: false, error: 'CSV content is empty' };
  }
  
  try {
    // Split into rows
    const rows = csvString.split(/\r?\n/).filter(row => row.trim() !== '');
    
    if (rows.length === 0) {
      return { isValid: false, error: 'CSV has no rows' };
    }
    
    // Validate headers
    const headers = parseCSVRow(rows[0]);
    
    if (requiredHeaders.length > 0) {
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      
      if (missingHeaders.length > 0) {
        return { 
          isValid: false, 
          error: `Missing required headers: ${missingHeaders.join(', ')}` 
        };
      }
    }
    
    // Validate that all rows have the same number of columns
    const headerCount = headers.length;
    for (let i = 1; i < rows.length; i++) {
      const rowValues = parseCSVRow(rows[i]);
      if (rowValues.length !== headerCount) {
        return { 
          isValid: false, 
          error: `Row ${i + 1} has ${rowValues.length} columns, expected ${headerCount}` 
        };
      }
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: `Validation error: ${error.message}` };
  }
}; 