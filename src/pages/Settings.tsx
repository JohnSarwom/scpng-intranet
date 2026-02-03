import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import PageLayout from '@/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase, logger } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import {
  Bell,
  User as UserIcon,
  Shield,
  Palette,
  Globe,
  Moon,
  Sun,
  Mail,
  Phone,
  Clock,
  UserCog
} from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useGraphProfile } from '@/hooks/useGraphProfile';

const Settings = () => {
  const { session, isSyncingSession } = useSupabaseAuth(); // Destructure isSyncingSession
  const { accounts, inProgress } = useMsal();
  const { profile: graphProfile } = useGraphProfile();
  const account = accounts[0];
  const userLoading = inProgress !== "none";
  const [userRole, setUserRole] = useState(null);

  const [activeTab, setActiveTab] = useState('profile');

  const [settings, setSettings] = useState({
    profile: {
      name: '',
      email: '',
      phone: '+675 xxx xxxx',
      language: 'en',
      timezone: 'Pacific/Port_Moresby',
      division: '',
      unit: ''
    },
    notifications: {
      email: true,
      browser: true,
      mobile: false,
      reports: true,
      updates: true,
      news: false
    },
    appearance: {
      theme: 'light',
      density: 'comfortable',
      animations: true,
      fontSize: 'medium'
    },
    security: {
      twoFactor: false,
      sessionTimeout: '30',
      ipRestriction: false
    }
  });

  useEffect(() => {
    // logger.info('[SettingsPage] useEffect triggered.', {
    //   supabaseSessionExists: !!session,
    //   msalAccountExists: !!account,
    //   userLoading: userLoading
    // });

    const fetchUserRole = async () => {
      if (account) {
        // logger.info('[SettingsPage] Fetching user role for MSAL account:', { username: account.username });
        const { data, error } = await supabase
          .from('user_role_summary')
          .select('role_name')
          .eq('user_email', account.username)
          .single();

        if (error) {
          logger.error('[SettingsPage] Error fetching user role:', { error: error.message });
          console.error('Error fetching user role:', error);
        } else if (data) {
          setUserRole(data.role_name);
          // logger.success('[SettingsPage] User role fetched successfully:', { role: data.role_name });
        } else {
          // logger.warn('[SettingsPage] No user role found for MSAL account:', { username: account.username });
        }
      } else {
        // logger.info('[SettingsPage] No MSAL account to fetch user role for.');
      }
    };

    if (!userLoading && account) {
      // logger.success('Settings Page: MSAL user identified', { account });
      fetchUserRole();
      setSettings(prevSettings => ({
        ...prevSettings,
        profile: {
          ...prevSettings.profile,
          name: account.name || account.username || '',
          email: account.username || ''
        }
      }));
    } else if (!userLoading && !account) {
      // logger.warn('Settings Page: No MSAL account found', { message: 'No MSAL account found' });
      toast.error('User session not found. Please login again.');
    }
  }, [account, userLoading, session, isSyncingSession]); // Added isSyncingSession to dependency array

  useEffect(() => {
    if (graphProfile) {
      setSettings(prevSettings => ({
        ...prevSettings,
        profile: {
          ...prevSettings.profile,
          division: graphProfile.officeLocation || '', // Maps to Division
          unit: graphProfile.department || ''       // Maps to Unit
        }
      }));
    }
  }, [graphProfile]);

  const handleSave = (settingType: keyof typeof settings) => {
    // logger.info(`Saving ${settingType} settings`, settings[settingType]);
    toast.success(`${settingType.charAt(0).toUpperCase() + settingType.slice(1)} settings saved successfully (mock)`);
  };

  if (userLoading || isSyncingSession) { // Update loading condition
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <p>{userLoading ? 'Loading user settings...' : 'Syncing authentication session...'}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-64 animate-fade-in">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl mb-2">
                  {userLoading ? '...' : (account?.name?.charAt(0) || account?.username?.charAt(0)?.toUpperCase() || 'U')}
                </div>
                <h3 className="font-medium">{userLoading ? 'Loading...' : (account?.name || account?.username)}</h3>
                <p className="text-sm text-gray-500">{userRole || 'User'}</p>
                <p className="text-xs text-muted-foreground mt-1">{settings.profile.unit || settings.profile.division || 'SCPNG'}</p>
              </div>

              <div className="space-y-2">
                <div className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{userLoading ? '...' : account?.username}</span>
                </div>
                <div className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">+675 xxx xxxx</span>
                </div>
                <div className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">GMT+10:00</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 animate-fade-in">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6">
              <TabsTrigger value="profile" className="flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-1">
                <Palette className="h-4 w-4" />
                <span>Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Manage your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={settings.profile.name}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: {
                            ...settings.profile,
                            name: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: {
                            ...settings.profile,
                            email: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={settings.profile.phone}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: {
                            ...settings.profile,
                            phone: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={settings.profile.language}
                        onValueChange={(value) => setSettings({
                          ...settings,
                          profile: {
                            ...settings.profile,
                            language: value
                          }
                        })}
                      >
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="tok">Tok Pisin</SelectItem>
                          <SelectItem value="hir">Hiri Motu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="division">Division</Label>
                      <Input
                        id="division"
                        value={settings.profile.division}
                        readOnly
                        className="bg-gray-50 text-gray-500"
                        placeholder="Division info"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={settings.profile.unit}
                        readOnly
                        className="bg-gray-50 text-gray-500"
                        placeholder="Unit info"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.profile.timezone}
                      onValueChange={(value) => setSettings({
                        ...settings,
                        profile: {
                          ...settings.profile,
                          timezone: value
                        }
                      })}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select Timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pacific/Port_Moresby">Port Moresby (GMT+10)</SelectItem>
                        <SelectItem value="Australia/Sydney">Sydney (GMT+10/11)</SelectItem>
                        <SelectItem value="Asia/Singapore">Singapore (GMT+8)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSave('profile')}
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Notification Channels</h3>
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={settings.notifications.email}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              email: checked
                            }
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="browser-notifications">Browser Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Show notifications in browser
                          </p>
                        </div>
                        <Switch
                          id="browser-notifications"
                          checked={settings.notifications.browser}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              browser: checked
                            }
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="mobile-notifications">Mobile Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive notifications on mobile
                          </p>
                        </div>
                        <Switch
                          id="mobile-notifications"
                          checked={settings.notifications.mobile}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              mobile: checked
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Notification Types</h3>
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="report-notifications">Reports & Analytics</Label>
                          <p className="text-xs text-muted-foreground">
                            Notifications for reports and KPI updates
                          </p>
                        </div>
                        <Switch
                          id="report-notifications"
                          checked={settings.notifications.reports}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              reports: checked
                            }
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="update-notifications">System Updates</Label>
                          <p className="text-xs text-muted-foreground">
                            Notifications for system updates and changes
                          </p>
                        </div>
                        <Switch
                          id="update-notifications"
                          checked={settings.notifications.updates}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              updates: checked
                            }
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="news-notifications">News & Announcements</Label>
                          <p className="text-xs text-muted-foreground">
                            Notifications for company news and announcements
                          </p>
                        </div>
                        <Switch
                          id="news-notifications"
                          checked={settings.notifications.news}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              news: checked
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSave('notifications')}
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize how the interface looks to you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Theme Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer flex gap-2 items-center ${settings.appearance.theme === 'light' ? 'border-intranet-primary' : 'border-transparent'}`}
                        onClick={() => setSettings({
                          ...settings,
                          appearance: {
                            ...settings.appearance,
                            theme: 'light'
                          }
                        })}
                      >
                        <Sun className="h-5 w-5 text-amber-500" />
                        <div>
                          <h4 className="text-sm font-medium">Light Mode</h4>
                          <p className="text-xs text-muted-foreground">Bright and clean interface</p>
                        </div>
                      </div>
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer flex gap-2 items-center ${settings.appearance.theme === 'dark' ? 'border-intranet-primary' : 'border-transparent'}`}
                        onClick={() => setSettings({
                          ...settings,
                          appearance: {
                            ...settings.appearance,
                            theme: 'dark'
                          }
                        })}
                      >
                        <Moon className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="text-sm font-medium">Dark Mode</h4>
                          <p className="text-xs text-muted-foreground">Easier on the eyes at night</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Layout Density</h3>
                    <Select
                      value={settings.appearance.density}
                      onValueChange={(value) => setSettings({
                        ...settings,
                        appearance: {
                          ...settings.appearance,
                          density: value
                        }
                      })}
                    >
                      <SelectTrigger id="density">
                        <SelectValue placeholder="Select Density" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                        <SelectItem value="spacious">Spacious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Font Size</h3>
                    <Select
                      value={settings.appearance.fontSize}
                      onValueChange={(value) => setSettings({
                        ...settings,
                        appearance: {
                          ...settings.appearance,
                          fontSize: value
                        }
                      })}
                    >
                      <SelectTrigger id="font-size">
                        <SelectValue placeholder="Select Font Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="animations">Enable Animations</Label>
                      <p className="text-xs text-muted-foreground">
                        Show smooth transitions between pages and elements
                      </p>
                    </div>
                    <Switch
                      id="animations"
                      checked={settings.appearance.animations}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        appearance: {
                          ...settings.appearance,
                          animations: checked
                        }
                      })}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSave('appearance')}
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                      <p className="text-xs text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      id="two-factor"
                      checked={settings.security.twoFactor}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          twoFactor: checked
                        }
                      })}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Select
                      value={settings.security.sessionTimeout}
                      onValueChange={(value) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          sessionTimeout: value
                        }
                      })}
                    >
                      <SelectTrigger id="session-timeout">
                        <SelectValue placeholder="Select Timeout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ip-restriction">IP Restriction</Label>
                      <p className="text-xs text-muted-foreground">
                        Limit access to specific IP addresses
                      </p>
                    </div>
                    <Switch
                      id="ip-restriction"
                      checked={settings.security.ipRestriction}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          ipRestriction: checked
                        }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      Change Password
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSave('security')}
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;
