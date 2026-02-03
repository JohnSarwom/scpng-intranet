import { describe, it, expect } from 'vitest';
import { 
  objectsToCSV, 
  csvToObjects, 
  validateCSV 
} from '../utils/csv-helpers';

describe('CSV Helper Functions', () => {
  describe('objectsToCSV', () => {
    it('should convert an array of objects to a CSV string with headers', () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'San Francisco' }
      ];
      
      const result = objectsToCSV(data);
      
      // Should have a header row and two data rows
      expect(result.split('\n').length).toBe(3);
      expect(result).toContain('name,age,city');
      expect(result).toContain('John,30,New York');
      expect(result).toContain('Jane,25,San Francisco');
    });

    it('should handle empty arrays', () => {
      const result = objectsToCSV([]);
      expect(result).toBe('');
    });

    it('should escape quotes and commas in values', () => {
      const data = [
        { name: 'John "Johnny" Doe', description: 'Lives in New York, NY' }
      ];
      
      const result = objectsToCSV(data);
      
      // Quotes should be escaped by doubling them
      expect(result).toContain('John ""Johnny"" Doe');
      // Commas should cause the field to be quoted
      expect(result).toContain('"Lives in New York, NY"');
    });

    it('should use custom headers if provided', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ];
      
      const result = objectsToCSV(data, ['Full Name', 'Years']);
      
      expect(result).toContain('Full Name,Years');
      expect(result).toContain('John,30');
      expect(result).toContain('Jane,25');
    });
  });

  describe('csvToObjects', () => {
    it('should convert a CSV string to an array of objects', () => {
      const csv = 'name,age,city\nJohn,30,New York\nJane,25,San Francisco';
      
      const result = csvToObjects(csv);
      
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ name: 'John', age: '30', city: 'New York' });
      expect(result[1]).toEqual({ name: 'Jane', age: '25', city: 'San Francisco' });
    });

    it('should handle empty CSV strings', () => {
      const result = csvToObjects('');
      expect(result).toEqual([]);
    });

    it('should handle quoted values with commas', () => {
      const csv = 'name,address\nJohn,"123 Main St, Apt 4"\nJane,"456 Oak St, Suite 7"';
      
      const result = csvToObjects(csv);
      
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ name: 'John', address: '123 Main St, Apt 4' });
      expect(result[1]).toEqual({ name: 'Jane', address: '456 Oak St, Suite 7' });
    });

    it('should handle CSV without headers', () => {
      const csv = 'John,30,New York\nJane,25,San Francisco';
      
      const result = csvToObjects(csv, false);
      
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ column0: 'John', column1: '30', column2: 'New York' });
      expect(result[1]).toEqual({ column0: 'Jane', column1: '25', column2: 'San Francisco' });
    });
  });

  describe('validateCSV', () => {
    it('should validate a valid CSV with required headers', () => {
      const csv = 'id,name,description\n1,Task 1,Description 1\n2,Task 2,Description 2';
      const requiredHeaders = ['id', 'name', 'description'];
      
      const result = validateCSV(csv, requiredHeaders);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should detect missing required headers', () => {
      const csv = 'id,description\n1,Description 1\n2,Description 2';
      const requiredHeaders = ['id', 'name', 'description'];
      
      const result = validateCSV(csv, requiredHeaders);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Missing required headers');
    });

    it('should detect inconsistent column counts', () => {
      const csv = 'id,name,description\n1,Task 1\n2,Task 2,Description 2';
      
      const result = validateCSV(csv);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Row 2 has 2 columns, expected 3');
    });

    it('should validate CSV without required headers', () => {
      const csv = 'id,name,description\n1,Task 1,Description 1\n2,Task 2,Description 2';
      
      const result = validateCSV(csv);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should detect empty CSV', () => {
      const result = validateCSV('');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('CSV content is empty');
    });
  });
}); 