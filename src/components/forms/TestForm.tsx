import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSharePointUpload } from '@/hooks/useSharePointUpload';

const SHAREPOINT_SITEPATH = "/sites/scpngintranet";
const SHAREPOINT_LIST_NAME = "Test2";

const TestForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  
  const { addSharePointListItem, isLoading, error } = useSharePointUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !comment) {
      toast.error('Please fill out all fields.');
      return;
    }

    const itemData = {
      Name: name,
      Email: email,
      Comment: comment,
    };

    const result = await addSharePointListItem(
      SHAREPOINT_SITEPATH,
      SHAREPOINT_LIST_NAME,
      itemData
    );

    if (result) {
      toast.success('Form submitted successfully!');
      // Reset form
      setName('');
      setEmail('');
      setComment('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Form</CardTitle>
        <CardDescription>This form submits data to a SharePoint list.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter a comment"
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit to SharePoint'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TestForm;
