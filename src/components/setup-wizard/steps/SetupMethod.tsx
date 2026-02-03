import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Database, UploadCloud, PlayCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SetupMethodProps {
  onSelect: (method: string) => void;
}

export const SetupMethod: React.FC<SetupMethodProps> = ({ onSelect }) => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handleSelect = (method: string) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (selectedMethod) {
      onSelect(selectedMethod);
    } else {
      toast({
        title: "No Method Selected",
        description: "Please select a setup method to continue",
        variant: "destructive",
      });
    }
  };

  const methods = [
    {
      id: 'onedrive',
      title: 'Standard Setup',
      description: 'Connect to OneDrive to store and manage your data.',
      icon: <Database className="h-6 w-6 text-purple-600" />
    },
    {
      id: 'csv',
      title: 'Import CSV',
      description: 'Upload existing data from CSV files.',
      icon: <UploadCloud className="h-6 w-6 text-blue-600" />
    },
    {
      id: 'demo',
      title: 'Demo Data',
      description: 'Load sample data to explore the application.',
      icon: <PlayCircle className="h-6 w-6 text-green-600" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Choose Setup Method</h2>
        <p className="text-sm text-muted-foreground">
          Select how you want to initialize your unit's data
        </p>
      </div>

      <div className="space-y-4">
        {methods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer hover:shadow-md transition-shadow ${selectedMethod === method.id ? 'border-primary ring-2 ring-primary' : ''}`}
            onClick={() => handleSelect(method.id)}
          >
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="p-2 bg-muted rounded-full">
                {method.icon}
              </div>
              <div>
                <h3 className="font-medium">{method.title}</h3>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        onClick={handleContinue}
        disabled={!selectedMethod}
        className="w-full"
      >
        Continue
      </Button>
    </div>
  );
}; 