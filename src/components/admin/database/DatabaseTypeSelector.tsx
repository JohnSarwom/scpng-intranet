
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database, Server, Table, KeyRound, FileSpreadsheet, Code, Globe } from 'lucide-react';

export type DatabaseType = 'sharepoint' | 'sql' | 'mysql' | 'postgresql' | 'mongodb' | 'excel' | 'firebase' | 'supabase' | 'rest' | 'custom' | 'microsoft';

interface DatabaseTypeSelectorProps {
  selectedDbType: DatabaseType | null;
  setSelectedDbType: (type: DatabaseType) => void;
}

const DatabaseTypeSelector: React.FC<DatabaseTypeSelectorProps> = ({ selectedDbType, setSelectedDbType }) => {
  const getDatabaseIcon = (type: DatabaseType) => {
    switch (type) {
      case 'sharepoint': return <Table className="h-5 w-5" />;
      case 'excel': return <FileSpreadsheet className="h-5 w-5" />;
      case 'sql':
      case 'mysql':
      case 'postgresql': return <Server className="h-5 w-5" />;
      case 'firebase':
      case 'supabase': return <KeyRound className="h-5 w-5" />;
      case 'microsoft': return <Globe className="h-5 w-5" />;
      case 'custom': return <Code className="h-5 w-5" />;
      default: return <Database className="h-5 w-5" />;
    }
  };
  
  const databaseTypes = [
    { type: 'sharepoint', label: 'SharePoint' },
    { type: 'sql', label: 'SQL Server' },
    { type: 'mysql', label: 'MySQL' },
    { type: 'postgresql', label: 'PostgreSQL' },
    { type: 'mongodb', label: 'MongoDB' },
    { type: 'excel', label: 'Excel' },
    { type: 'firebase', label: 'Firebase' },
    { type: 'supabase', label: 'Supabase' },
    { type: 'rest', label: 'REST API' },
    { type: 'custom', label: 'Custom' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 mb-6">
      {databaseTypes.map(db => (
        <Button 
          key={db.type}
          variant={selectedDbType === db.type ? "default" : "outline"}
          className="h-24 flex flex-col justify-center items-center gap-2"
          onClick={() => setSelectedDbType(db.type as DatabaseType)}
        >
          {getDatabaseIcon(db.type as DatabaseType)}
          <span>{db.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default DatabaseTypeSelector;
