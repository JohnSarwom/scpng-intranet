
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Settings as SettingsIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const apiProviders = [
  { id: 'openai', name: 'OpenAI', enabled: true },
  { id: 'claude', name: 'Claude', enabled: false },
  { id: 'deepseek', name: 'DeepSeek', enabled: false },
  { id: 'qwen', name: 'Qwen', enabled: false },
  { id: 'groq', name: 'Groq Cloud', enabled: false },
  { id: 'openroute', name: 'OpenRoute', enabled: false },
];

const mockUnits = [
  { id: 'finance', name: 'Finance Department' },
  { id: 'hr', name: 'Human Resources' },
  { id: 'it', name: 'IT Department' },
  { id: 'operations', name: 'Operations' },
];

const aiAssistantTypes = [
  { id: 'document', name: 'Document Assistant', description: 'Helps with document analysis and management' },
  { id: 'chat', name: 'Chat Assistant', description: 'General purpose conversational AI' },
  { id: 'data', name: 'Data Analysis Assistant', description: 'Specialized for analyzing business data' },
  { id: 'kpi', name: 'KPI Assistant', description: 'Focused on tracking and reporting KPIs' },
];

const AIConfiguration = () => {
  const [selectedAIConfig, setSelectedAIConfig] = useState<{unitId: string, aiType: string} | null>(null);
  const [showAIConfigDialog, setShowAIConfigDialog] = useState(false);
  const aiConfigForm = useForm();

  const configureAI = (unitId: string, aiType: string) => {
    setSelectedAIConfig({ unitId, aiType });
    setShowAIConfigDialog(true);
  };
  
  const saveAIConfig = () => {
    toast.success(`AI configuration saved for ${mockUnits.find(u => u.id === selectedAIConfig?.unitId)?.name}`);
    setShowAIConfigDialog(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot size={20} />
            <span>AI Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure AI assistants for each business unit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Global AI Providers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apiProviders.map(provider => (
                  <div key={provider.id} className="border rounded-lg p-4 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{provider.name}</h4>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input 
                          type="checkbox" 
                          id={`toggle-${provider.id}`} 
                          checked={provider.enabled}
                          className="sr-only"
                        />
                        <label
                          htmlFor={`toggle-${provider.id}`}
                          className={`block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${provider.enabled ? 'bg-intranet-primary' : ''}`}
                        >
                          <span
                            className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${provider.enabled ? 'translate-x-4' : 'translate-x-0'}`}
                          ></span>
                        </label>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">API Key</label>
                      <Input type="password" placeholder="Enter API key" disabled={!provider.enabled} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Model</label>
                      <select className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" disabled={!provider.enabled}>
                        <option>Default model</option>
                        <option>Advanced model</option>
                        <option>Economy model</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Business Unit AI Configurations</h3>
              <div className="grid grid-cols-1 gap-6">
                {mockUnits.map(unit => (
                  <div key={unit.id} className="border rounded-lg p-4 dark:border-gray-700">
                    <h4 className="font-medium text-xl mb-3">{unit.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      {aiAssistantTypes.map(type => (
                        <div key={type.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{type.name}</h5>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{type.description}</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                              onClick={() => configureAI(unit.id, type.id)}
                            >
                              <SettingsIcon size={16} />
                            </Button>
                          </div>
                          <div className="mt-3 flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm">Active</span>
                          </div>
                          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                            {unit.id === 'finance' && type.id === 'data' ? 
                              'Custom model configured with financial analysis focus' : 
                              'Using default configuration'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Knowledge Base Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Organization Knowledge Base</label>
                  <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Drag and drop files here or click to browse
                    </p>
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mb-4">
                      Supports PDF, DOCX, TXT (Max 25MB)
                    </p>
                    <Button size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Files
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Department-Specific Knowledge</label>
                  <div className="border rounded-lg p-4 dark:border-gray-700 h-full">
                    <div className="mb-3">
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Select Department</label>
                      <select className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                        {mockUnits.map(unit => (
                          <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Upload department-specific documents
                      </p>
                      <Button size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Files
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAIConfigDialog} onOpenChange={setShowAIConfigDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Configure AI Assistant</DialogTitle>
            <DialogDescription>
              {selectedAIConfig && (
                <>
                  Customize the {aiAssistantTypes.find(t => t.id === selectedAIConfig.aiType)?.name} for {mockUnits.find(u => u.id === selectedAIConfig.unitId)?.name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={aiConfigForm.handleSubmit(saveAIConfig)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <FormLabel className="text-right">Model</FormLabel>
                <Select defaultValue="gpt-4">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                    <SelectItem value="custom">Custom Model</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <FormLabel className="text-right">Temperature</FormLabel>
                <Input type="number" defaultValue="0.7" min="0" max="1" step="0.1" className="col-span-3" />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <FormLabel className="text-right">Max Tokens</FormLabel>
                <Input type="number" defaultValue="2048" className="col-span-3" />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <FormLabel className="text-right">Enable RAG</FormLabel>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch id="rag-mode" defaultChecked />
                  <label htmlFor="rag-mode" className="text-sm text-gray-500">
                    Use Retrieval Augmented Generation
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <FormLabel className="text-right">System Prompt</FormLabel>
                <textarea 
                  className="col-span-3 p-2 border rounded-md min-h-[100px]" 
                  placeholder="Enter the system prompt for this AI assistant..."
                  defaultValue={`You are an AI assistant for the ${selectedAIConfig?.unitId} department. Your goal is to help users with their queries and tasks.`}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <FormLabel className="text-right">Knowledge Base</FormLabel>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="use-global-kb" defaultChecked />
                    <label htmlFor="use-global-kb" className="text-sm">Use global knowledge base</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="use-dept-kb" defaultChecked />
                    <label htmlFor="use-dept-kb" className="text-sm">Use department knowledge base</label>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAIConfigDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Configuration</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIConfiguration;
