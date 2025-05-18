
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  collection_reminders: boolean;
  feedback_notifications: boolean;
  news_updates: boolean;
  theme: string;
  language: string;
  high_contrast: boolean;
  data_analytics: boolean;
  location_sharing: boolean;
}

const defaultSettings: Omit<UserSettings, 'id' | 'user_id'> = {
  email_notifications: true,
  collection_reminders: true,
  feedback_notifications: true,
  news_updates: false,
  theme: 'system',
  language: 'en',
  high_contrast: false,
  data_analytics: true,
  location_sharing: true,
};

const SettingsPage = () => {
  const [settings, setSettings] = useState<Omit<UserSettings, 'id' | 'user_id'>>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;
      
      // Check if settings exist
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching settings:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load settings',
          description: 'Please try refreshing the page.',
        });
        return;
      }
      
      if (data) {
        // Settings exist, use them
        setSettingsId(data.id);
        setSettings({
          email_notifications: data.email_notifications,
          collection_reminders: data.collection_reminders,
          feedback_notifications: data.feedback_notifications,
          news_updates: data.news_updates,
          theme: data.theme || 'system',
          language: data.language || 'en',
          high_contrast: data.high_contrast || false,
          data_analytics: data.data_analytics,
          location_sharing: data.location_sharing,
        });
      } else {
        // No settings yet, use defaults
        setSettings(defaultSettings);
        
        // Create default settings in database
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            ...defaultSettings,
          })
          .select('id')
          .single();
          
        if (insertError) {
          console.error('Error creating settings:', insertError);
          toast({
            variant: 'destructive',
            title: 'Failed to create settings',
            description: 'Please try refreshing the page.',
          });
          return;
        }
        
        if (newSettings) setSettingsId(newSettings.id);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load settings',
        description: 'Please try refreshing the page.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      if (!settingsId) {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Create new settings
        const { error } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            ...settings,
          });
          
        if (error) throw error;
      } else {
        // Update existing settings
        const { error } = await supabase
          .from('user_settings')
          .update(settings)
          .eq('id', settingsId);
          
        if (error) throw error;
      }
      
      toast({
        title: 'Settings updated',
        description: 'Your settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to save settings',
        description: 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how you receive notifications and alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important updates and collection reminders
                </p>
              </div>
              <Switch 
                id="emailNotifications" 
                checked={settings.email_notifications}
                onCheckedChange={(value) => updateSetting('email_notifications', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reminderNotifications" className="font-medium">Collection Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminders about upcoming waste collection days
                </p>
              </div>
              <Switch 
                id="reminderNotifications" 
                checked={settings.collection_reminders}
                onCheckedChange={(value) => updateSetting('collection_reminders', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="feedbackNotifications" className="font-medium">Feedback Responses</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone responds to your feedback
                </p>
              </div>
              <Switch 
                id="feedbackNotifications" 
                checked={settings.feedback_notifications}
                onCheckedChange={(value) => updateSetting('feedback_notifications', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newsNotifications" className="font-medium">News & Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about service changes and community news
                </p>
              </div>
              <Switch 
                id="newsNotifications" 
                checked={settings.news_updates}
                onCheckedChange={(value) => updateSetting('news_updates', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>Customize how the application appears</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select 
                value={settings.theme} 
                onValueChange={(value) => updateSetting('theme', value)}
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select 
                value={settings.language}
                onValueChange={(value) => updateSetting('language', value)}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="highContrast" className="font-medium">High Contrast Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch 
                id="highContrast" 
                checked={settings.high_contrast}
                onCheckedChange={(value) => updateSetting('high_contrast', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>Manage your data and privacy preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dataSharing" className="font-medium">Data Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Allow anonymous usage data to improve our services
                </p>
              </div>
              <Switch 
                id="dataSharing" 
                checked={settings.data_analytics}
                onCheckedChange={(value) => updateSetting('data_analytics', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="cookieConsent" className="font-medium">Cookie Preferences</Label>
                <p className="text-sm text-muted-foreground">
                  Manage cookie settings and tracking preferences
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  toast({
                    title: "Cookie preferences",
                    description: "Cookie preferences dialog will be implemented in a future update.",
                  });
                }}
              >
                Manage
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="locationSharing" className="font-medium">Location Services</Label>
                <p className="text-sm text-muted-foreground">
                  Allow location data to provide local collection information
                </p>
              </div>
              <Switch 
                id="locationSharing" 
                checked={settings.location_sharing}
                onCheckedChange={(value) => updateSetting('location_sharing', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
