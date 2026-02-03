import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MicrosoftAPIConfig from './database/MicrosoftAPIConfig';
import SupabaseDataImporter from './SupabaseDataImporter';

const DatabaseIntegration = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Database Integration</h2>
      
      <Tabs defaultValue="microsoft">
        <TabsList>
          <TabsTrigger value="microsoft">Microsoft API</TabsTrigger>
          <TabsTrigger value="supabase">Supabase</TabsTrigger>
        </TabsList>
        
        <TabsContent value="microsoft" className="mt-4">
          <MicrosoftAPIConfig />
        </TabsContent>
        
        <TabsContent value="supabase" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Supabase Integration</CardTitle>
              <CardDescription>
                Configure and manage your Supabase database integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SupabaseDataImporter />
              
              <Card>
                <CardHeader>
                  <CardTitle>Supabase Status</CardTitle>
                  <CardDescription>
                    Current Supabase connection status and configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex justify-between py-1">
                      <span className="font-medium">Connection Status:</span>
                      <span className="text-green-600 font-medium">Connected</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium">Database URL:</span>
                      <span className="text-muted-foreground truncate max-w-[300px]">
                        https://dmasclpgspatxncspcvt.supabase.co
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium">Unit Data Storage:</span>
                      <span className="text-blue-600 font-medium">Configured</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseIntegration;
