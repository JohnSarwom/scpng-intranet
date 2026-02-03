import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DatabaseFormsProps {
  onTestConnection: () => Promise<void>;
}

const DatabaseForms: React.FC<DatabaseFormsProps> = ({ onTestConnection }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Test Database Connection</Label>
            <Button onClick={onTestConnection}>
              Test Connection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseForms;
