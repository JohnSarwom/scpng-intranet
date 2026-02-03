import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, Link } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface KnowledgeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (title: string, description: string, files: FileList | null, links: string[]) => void;
  knowledgeAreaTitle: string | null;
}

const KnowledgeUploadModal: React.FC<KnowledgeUploadModalProps> = ({ isOpen, onClose, onUpload, knowledgeAreaTitle }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [fileLinks, setFileLinks] = useState<string[]>(['']);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...fileLinks];
    newLinks[index] = value;
    setFileLinks(newLinks);
  };

  const addLinkInput = () => {
    setFileLinks([...fileLinks, '']);
  };

  const removeLinkInput = (index: number) => {
    const newLinks = fileLinks.filter((_, i) => i !== index);
    setFileLinks(newLinks);
  };

  const handleSubmit = () => {
    onUpload(title, description, selectedFiles, fileLinks.filter(link => link.trim() !== ''));
    onClose();
    setTitle('');
    setDescription('');
    setSelectedFiles(null);
    setFileLinks(['']);
  };

  React.useEffect(() => {
    if (!isOpen) {
        setTitle('');
        setDescription('');
        setSelectedFiles(null);
        setFileLinks(['']);
    }
  }, [isOpen, knowledgeAreaTitle]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            Upload Knowledge for: {knowledgeAreaTitle || 'General Knowledge'}
          </DialogTitle>
          <DialogDescription>
            Provide a title and description, then upload files (PDF, TXT, DOCX) or add links for the AI to learn from.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="knowledge-title" className="text-right col-span-1">
                    Title
                </Label>
                <Input 
                    id="knowledge-title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="col-span-3" 
                    placeholder="Enter a descriptive title"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="knowledge-description" className="text-right col-span-1">
                    Description
                </Label>
                <Textarea 
                    id="knowledge-description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="col-span-3" 
                    placeholder="Briefly describe the content (optional)"
                    rows={3}
                />
            </div>
        </div>
        <Tabs defaultValue="file" className="mt-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file"><UploadCloud className="mr-2 h-4 w-4 inline-block" />Upload Files</TabsTrigger>
            <TabsTrigger value="link"><Link className="mr-2 h-4 w-4 inline-block" />Add Links</TabsTrigger>
          </TabsList>
          <TabsContent value="file" className="py-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="file-upload">Select Files (PDF, TXT, DOCX)</Label>
              <Input 
                id="file-upload" 
                type="file" 
                multiple 
                onChange={handleFileChange} 
                accept=".pdf,.txt,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
              <p className="text-xs text-gray-500 mt-1">You can select multiple files. Max 25MB per file.</p>
            </div>
            {selectedFiles && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-1">Selected files:</p>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {Array.from(selectedFiles).map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
          <TabsContent value="link" className="py-4">
            <div className="space-y-3">
              <Label>Web Links (URLs)</Label>
              {fileLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/knowledge-page"
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                  />
                  {fileLinks.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeLinkInput(index)}>Remove</Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addLinkInput}>Add another link</Button>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim() && (!selectedFiles && fileLinks.every(l => !l.trim()))}>Upload Content</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeUploadModal; 