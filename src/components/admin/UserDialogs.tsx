
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { User } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface UserDialogsProps {
  showPasswordDialog: boolean;
  setShowPasswordDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showEmailDialog: boolean;
  setShowEmailDialog: React.Dispatch<React.SetStateAction<boolean>>;
  selectedUser: User | null;
  generatedPassword: string;
}

const UserDialogs: React.FC<UserDialogsProps> = ({
  showPasswordDialog,
  setShowPasswordDialog,
  showEmailDialog,
  setShowEmailDialog,
  selectedUser,
  generatedPassword
}) => {
  const emailForm = useForm();
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };
  
  const saveEmailSettings = () => {
    toast.success(`Email notification settings updated for ${selectedUser?.name}`);
    setShowEmailDialog(false);
  };

  return (
    <>
      {/* Password Reset Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Password</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  Password generated for {selectedUser.name} ({selectedUser.email})
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700 flex items-center">
            <span className="font-mono mr-2 flex-1">{generatedPassword}</span>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedPassword)}>
              Copy
            </Button>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              This password will not be shown again.
            </div>
            <Button 
              type="button" 
              variant="default" 
              onClick={() => setShowPasswordDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Email Configuration Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Email Notification Settings</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  Configure email notifications for {selectedUser.name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={emailForm.handleSubmit(saveEmailSettings)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="email-address">Email Address</label>
                <input
                  id="email-address"
                  type="email"
                  className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700" 
                  defaultValue={selectedUser?.email || ''}
                />
                <p className="text-xs text-gray-500">All notifications will be sent to this address</p>
              </div>
              
              <div className="border-t pt-4 mt-2">
                <h4 className="font-medium mb-3">Notification Preferences</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium" htmlFor="notify-system">System Announcements</label>
                      <p className="text-xs text-gray-500">Important system updates and announcements</p>
                    </div>
                    <input type="checkbox" id="notify-system" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium" htmlFor="notify-documents">Document Updates</label>
                      <p className="text-xs text-gray-500">Changes to documents in your department</p>
                    </div>
                    <input type="checkbox" id="notify-documents" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium" htmlFor="notify-events">Calendar Events</label>
                      <p className="text-xs text-gray-500">Reminders for upcoming meetings and events</p>
                    </div>
                    <input type="checkbox" id="notify-events" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium" htmlFor="notify-comments">Comment Notifications</label>
                      <p className="text-xs text-gray-500">When someone comments on your posts or documents</p>
                    </div>
                    <input type="checkbox" id="notify-comments" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-2">
                <h4 className="font-medium mb-3">Frequency</h4>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="frequency">Notification Frequency</label>
                  <select 
                    id="frequency" 
                    className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700" 
                    defaultValue="immediate"
                  >
                    <option value="immediate">Immediately</option>
                    <option value="hourly">Hourly Digest</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                  </select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEmailDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserDialogs;
