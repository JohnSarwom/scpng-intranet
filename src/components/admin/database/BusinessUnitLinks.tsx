import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface BusinessUnitLink {
  id: string;
  unit_id: string;
  page_id: string;
  title: string;
  url: string;
  source: 'SharePoint' | 'OneDrive';
}

const BusinessUnitLinks: React.FC = () => {
  const { businessUnits } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [links, setLinks] = useState<BusinessUnitLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Available pages that can have links
  const pages = [
    { id: 'home', name: 'Home Page' },
    { id: 'documents', name: 'Documents' },
    { id: 'news', name: 'News' },
    { id: 'contacts', name: 'Contacts' },
    { id: 'organization', name: 'Organization' },
    { id: 'calendar', name: 'Calendar' },
  ];
  
  // New link form state
  const [newLink, setNewLink] = useState<Partial<BusinessUnitLink>>({
    unit_id: '',
    page_id: '',
    title: '',
    url: '',
    source: 'SharePoint'
  });
  
  // Load links when selected unit changes
  useEffect(() => {
    if (selectedUnit) {
      loadLinks(selectedUnit);
      setNewLink(prev => ({ ...prev, unit_id: selectedUnit }));
    } else {
      setLinks([]);
    }
  }, [selectedUnit]);
  
  const loadLinks = (unitId: string) => {
    setIsLoading(true);
    try {
      const storedLinks = localStorage.getItem(`unit_links_${unitId}`);
      if (storedLinks) {
        setLinks(JSON.parse(storedLinks));
      } else {
        setLinks([]);
      }
    } catch (error) {
      console.error('Error loading links:', error);
      toast.error('Failed to load business unit links');
    } finally {
      setIsLoading(false);
    }
  };

  const saveLinks = (updatedLinks: BusinessUnitLink[]) => {
    try {
      if (selectedUnit) {
        localStorage.setItem(`unit_links_${selectedUnit}`, JSON.stringify(updatedLinks));
      }
    } catch (error) {
      console.error('Error saving links:', error);
      toast.error('Failed to save links');
    }
  };
  
  const handleAddLink = () => {
    // Validate form
    if (!newLink.unit_id || !newLink.page_id || !newLink.title || !newLink.url || !newLink.source) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      const newLinkItem: BusinessUnitLink = {
        id: Date.now().toString(),
        unit_id: newLink.unit_id,
        page_id: newLink.page_id,
        title: newLink.title,
        url: newLink.url,
        source: newLink.source
      };
      
      const updatedLinks = [...links, newLinkItem];
      setLinks(updatedLinks);
      saveLinks(updatedLinks);
      toast.success('Link added successfully');
      
      // Reset form
      setNewLink({
        unit_id: selectedUnit,
        page_id: '',
        title: '',
        url: '',
        source: 'SharePoint'
      });
    } catch (error) {
      console.error('Error adding link:', error);
      toast.error('Failed to add link');
    }
  };
  
  const handleDeleteLink = (id: string) => {
    try {
      const updatedLinks = links.filter(link => link.id !== id);
      setLinks(updatedLinks);
      saveLinks(updatedLinks);
      toast.success('Link deleted successfully');
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete link');
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Unit Links</CardTitle>
        <CardDescription>
          Manage page links for business units
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Select Business Unit</Label>
            <Select
              value={selectedUnit || ''}
              onValueChange={(value) => setSelectedUnit(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a business unit" />
              </SelectTrigger>
              <SelectContent>
                {businessUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedUnit && (
            <>
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Add New Link</h3>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Page</Label>
                      <Select 
                        value={newLink.page_id || ''}
                        onValueChange={(value) => setNewLink({ ...newLink, page_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a page" />
                        </SelectTrigger>
                        <SelectContent>
                          {pages.map((page) => (
                            <SelectItem key={page.id} value={page.id}>
                              {page.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Source</Label>
                      <Select 
                        value={newLink.source || 'SharePoint'}
                        onValueChange={(value) => setNewLink({ 
                          ...newLink, 
                          source: value as 'SharePoint' | 'OneDrive' | 'Supabase'
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SharePoint">SharePoint</SelectItem>
                          <SelectItem value="OneDrive">OneDrive</SelectItem>
                          <SelectItem value="Supabase">Supabase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="Link title"
                      value={newLink.title || ''}
                      onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      placeholder="https://..."
                      value={newLink.url || ''}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    />
                  </div>
                  
                  <Button onClick={handleAddLink} className="mt-2">
                    <Plus size={16} className="mr-2" />
                    Add Link
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="font-medium">Existing Links</h3>
                </div>
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-intranet-primary"></div>
                  </div>
                ) : links.length > 0 ? (
                  <div className="divide-y">
                    {links.map((link) => (
                      <div key={link.id} className="p-4 flex justify-between items-center">
                        <div>
                          <div className="flex items-center">
                            <LinkIcon size={16} className="mr-2 text-intranet-primary" />
                            <span className="font-medium">{link.title}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Page: {pages.find(p => p.id === link.page_id)?.name || link.page_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            Source: <span className="font-medium">{link.source}</span>
                          </div>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block truncate max-w-xl">
                            {link.url}
                          </a>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteLink(link.id)}>
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No links added yet for this business unit
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessUnitLinks;
