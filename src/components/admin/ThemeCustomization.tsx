
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Undo, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): {r: number, g: number, b: number} | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Mock default theme
const defaultTheme = {
  colors: {
    primary: '#83002A',
    secondary: '#5C001E',
    background: '#FFFFFF',
    cardBg: '#FFFFFF',
    text: '#333333',
  },
  fonts: {
    body: 'Inter, sans-serif',
    heading: 'Inter, sans-serif',
    baseSize: '16px',
    scale: '1.2',
  },
  components: {
    borderRadius: '0.75rem',
    buttonStyle: 'rounded',
    shadowIntensity: 'medium',
    animation: 'smooth',
  },
  branding: {
    logo: '/path/to/logo.png',
    favicon: '/favicon.ico',
  }
};

const ThemeCustomization = () => {
  const [theme, setTheme] = useState(defaultTheme);
  const [activeTab, setActiveTab] = useState('colors');
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Update theme values
  const handleColorChange = (key: keyof typeof theme.colors, value: string) => {
    setTheme({
      ...theme,
      colors: {
        ...theme.colors,
        [key]: value
      }
    });
  };
  
  const handleFontChange = (key: keyof typeof theme.fonts, value: string) => {
    setTheme({
      ...theme,
      fonts: {
        ...theme.fonts,
        [key]: value
      }
    });
  };
  
  const handleComponentChange = (key: keyof typeof theme.components, value: string) => {
    setTheme({
      ...theme,
      components: {
        ...theme.components,
        [key]: value
      }
    });
  };
  
  // Mock file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5 MB limit
        toast.error("File size exceeds 5 MB limit");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setTheme({
          ...theme,
          branding: {
            ...theme.branding,
            logo: result
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Reset to default theme
  const handleReset = () => {
    setTheme(defaultTheme);
    setLogoPreview(null);
    toast.success("Theme reset to default");
  };
  
  // Save theme changes
  const handleSave = () => {
    // In a real implementation, this would save to a database or localStorage
    toast.success("Theme customizations saved successfully");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Customization</CardTitle>
        <CardDescription>
          Customize colors, typography and UI components for your intranet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-2/3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="typography">Typography</TabsTrigger>
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
              </TabsList>
              
              {/* COLORS TAB */}
              <TabsContent value="colors" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={theme.colors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={theme.colors.primary.toUpperCase()}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="font-mono"
                      />
                    </div>
                    {theme.colors.primary && hexToRgb(theme.colors.primary) && (
                      <div className="text-xs text-gray-500">
                        RGB: {hexToRgb(theme.colors.primary)?.r}, {hexToRgb(theme.colors.primary)?.g}, {hexToRgb(theme.colors.primary)?.b}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={theme.colors.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={theme.colors.secondary.toUpperCase()}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="font-mono"
                      />
                    </div>
                    {theme.colors.secondary && hexToRgb(theme.colors.secondary) && (
                      <div className="text-xs text-gray-500">
                        RGB: {hexToRgb(theme.colors.secondary)?.r}, {hexToRgb(theme.colors.secondary)?.g}, {hexToRgb(theme.colors.secondary)?.b}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={theme.colors.background}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={theme.colors.background.toUpperCase()}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="textColor"
                        type="color"
                        value={theme.colors.text}
                        onChange={(e) => handleColorChange('text', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={theme.colors.text.toUpperCase()}
                        onChange={(e) => handleColorChange('text', e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Color Mode</h3>
                    <div className="flex gap-2">
                      <Button
                        variant={previewMode === 'light' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('light')}
                      >
                        Light
                      </Button>
                      <Button
                        variant={previewMode === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('dark')}
                      >
                        Dark
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* TYPOGRAPHY TAB */}
              <TabsContent value="typography" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="bodyFont">Body Font</Label>
                    <select
                      id="bodyFont"
                      className="w-full p-2 border rounded-md"
                      value={theme.fonts.body}
                      onChange={(e) => handleFontChange('body', e.target.value)}
                    >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Open Sans, sans-serif">Open Sans</option>
                      <option value="Lato, sans-serif">Lato</option>
                      <option value="Poppins, sans-serif">Poppins</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="headingFont">Heading Font</Label>
                    <select
                      id="headingFont"
                      className="w-full p-2 border rounded-md"
                      value={theme.fonts.heading}
                      onChange={(e) => handleFontChange('heading', e.target.value)}
                    >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Montserrat, sans-serif">Montserrat</option>
                      <option value="Playfair Display, serif">Playfair Display</option>
                      <option value="Poppins, sans-serif">Poppins</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="baseSize">Base Font Size</Label>
                    <select
                      id="baseSize"
                      className="w-full p-2 border rounded-md"
                      value={theme.fonts.baseSize}
                      onChange={(e) => handleFontChange('baseSize', e.target.value)}
                    >
                      <option value="14px">Small (14px)</option>
                      <option value="16px">Medium (16px)</option>
                      <option value="18px">Large (18px)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="scale">Type Scale</Label>
                    <select
                      id="scale"
                      className="w-full p-2 border rounded-md"
                      value={theme.fonts.scale}
                      onChange={(e) => handleFontChange('scale', e.target.value)}
                    >
                      <option value="1.125">Minor Third (1.125)</option>
                      <option value="1.2">Major Third (1.2)</option>
                      <option value="1.25">Perfect Fourth (1.25)</option>
                      <option value="1.333">Perfect Fifth (1.333)</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 border-t pt-6">
                  <h3 className="font-medium mb-4">Typography Preview</h3>
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <h1 className="text-4xl font-bold" style={{ fontFamily: theme.fonts.heading }}>Heading 1</h1>
                    <h2 className="text-3xl font-bold" style={{ fontFamily: theme.fonts.heading }}>Heading 2</h2>
                    <h3 className="text-2xl font-bold" style={{ fontFamily: theme.fonts.heading }}>Heading 3</h3>
                    <h4 className="text-xl font-bold" style={{ fontFamily: theme.fonts.heading }}>Heading 4</h4>
                    <p className="mt-4" style={{ fontFamily: theme.fonts.body, fontSize: theme.fonts.baseSize }}>
                      This is a paragraph of text used to demonstrate the body font appearance. 
                      The quick brown fox jumps over the lazy dog.
                    </p>
                    <p className="mt-2" style={{ fontFamily: theme.fonts.body, fontSize: theme.fonts.baseSize }}>
                      <strong>This is bold text</strong>, <em>this is italic text</em>, and 
                      <a href="#" className="text-blue-600 hover:underline"> this is a link</a>.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              {/* COMPONENTS TAB */}
              <TabsContent value="components" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="borderRadius">Border Radius</Label>
                    <select
                      id="borderRadius"
                      className="w-full p-2 border rounded-md"
                      value={theme.components.borderRadius}
                      onChange={(e) => handleComponentChange('borderRadius', e.target.value)}
                    >
                      <option value="0">Square (0)</option>
                      <option value="0.25rem">Small (0.25rem)</option>
                      <option value="0.5rem">Medium (0.5rem)</option>
                      <option value="0.75rem">Large (0.75rem)</option>
                      <option value="1rem">Extra Large (1rem)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="buttonStyle">Button Style</Label>
                    <select
                      id="buttonStyle"
                      className="w-full p-2 border rounded-md"
                      value={theme.components.buttonStyle}
                      onChange={(e) => handleComponentChange('buttonStyle', e.target.value)}
                    >
                      <option value="square">Square</option>
                      <option value="rounded">Rounded</option>
                      <option value="pill">Pill</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="shadowIntensity">Shadow Intensity</Label>
                    <select
                      id="shadowIntensity"
                      className="w-full p-2 border rounded-md"
                      value={theme.components.shadowIntensity}
                      onChange={(e) => handleComponentChange('shadowIntensity', e.target.value)}
                    >
                      <option value="none">None</option>
                      <option value="light">Light</option>
                      <option value="medium">Medium</option>
                      <option value="strong">Strong</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="animation">Animation Speed</Label>
                    <select
                      id="animation"
                      className="w-full p-2 border rounded-md"
                      value={theme.components.animation}
                      onChange={(e) => handleComponentChange('animation', e.target.value)}
                    >
                      <option value="none">None</option>
                      <option value="fast">Fast (150ms)</option>
                      <option value="smooth">Smooth (300ms)</option>
                      <option value="slow">Slow (500ms)</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 border-t pt-6">
                  <h3 className="font-medium mb-4">Component Preview</h3>
                  <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Buttons</h4>
                      <div className="space-y-3">
                        <Button className="w-full" style={{
                          borderRadius: theme.components.buttonStyle === 'pill' ? '9999px' : 
                                    theme.components.buttonStyle === 'rounded' ? theme.components.borderRadius : '0',
                          transition: theme.components.animation === 'none' ? 'none' : 
                                   theme.components.animation === 'fast' ? 'all 150ms' : 
                                   theme.components.animation === 'slow' ? 'all 500ms' : 'all 300ms',
                          boxShadow: theme.components.shadowIntensity === 'none' ? 'none' : 
                                   theme.components.shadowIntensity === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : 
                                   theme.components.shadowIntensity === 'strong' ? '0 4px 6px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
                        }}>
                          Primary Button
                        </Button>
                        <Button variant="secondary" className="w-full" style={{
                          borderRadius: theme.components.buttonStyle === 'pill' ? '9999px' : 
                                    theme.components.buttonStyle === 'rounded' ? theme.components.borderRadius : '0',
                        }}>
                          Secondary Button
                        </Button>
                        <Button variant="outline" className="w-full" style={{
                          borderRadius: theme.components.buttonStyle === 'pill' ? '9999px' : 
                                    theme.components.buttonStyle === 'rounded' ? theme.components.borderRadius : '0',
                        }}>
                          Outline Button
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Card</h4>
                      <div className="border rounded-lg p-4 bg-white dark:bg-gray-900" style={{
                        borderRadius: theme.components.borderRadius,
                        boxShadow: theme.components.shadowIntensity === 'none' ? 'none' : 
                                 theme.components.shadowIntensity === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : 
                                 theme.components.shadowIntensity === 'strong' ? '0 4px 6px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
                      }}>
                        <h5 className="font-bold mb-2" style={{ fontFamily: theme.fonts.heading }}>Card Title</h5>
                        <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: theme.fonts.body }}>
                          This is a card component example with customized appearance based on your selected settings.
                        </p>
                        <Button size="sm" style={{
                          borderRadius: theme.components.buttonStyle === 'pill' ? '9999px' : 
                                     theme.components.buttonStyle === 'rounded' ? theme.components.borderRadius : '0',
                        }}>
                          Card Action
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* BRANDING TAB */}
              <TabsContent value="branding" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="logo">Logo</Label>
                    <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center">
                      {logoPreview ? (
                        <div className="mb-4">
                          <img src={logoPreview} alt="Logo Preview" className="max-h-24 object-contain" />
                        </div>
                      ) : (
                        <div className="mb-4 w-48 h-24 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                          No logo uploaded
                        </div>
                      )}
                      <div className="flex items-center">
                        <Button variant="outline" asChild>
                          <label htmlFor="logo-upload" className="cursor-pointer">
                            <Upload size={16} className="mr-2" />
                            Upload Logo
                            <input
                              id="logo-upload"
                              type="file"
                              className="hidden"
                              accept=".png,.jpg,.jpeg"
                              onChange={handleLogoUpload}
                            />
                          </label>
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG or JPG (max 5MB)
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="favicon">Favicon</Label>
                    <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center">
                      <div className="mb-4 w-16 h-16 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                        <img src="/favicon.ico" alt="Favicon" className="w-12 h-12" />
                      </div>
                      <Button variant="outline" asChild disabled>
                        <label htmlFor="favicon-upload" className="cursor-pointer">
                          <Upload size={16} className="mr-2" />
                          Upload Favicon
                          <input
                            id="favicon-upload"
                            type="file"
                            className="hidden"
                            accept=".ico,.png"
                          />
                        </label>
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        ICO or PNG (max 1MB)
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border-t pt-6">
                  <h3 className="font-medium mb-4">Banner Management</h3>
                  <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
                    <div className="mb-4 w-full h-24 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                      Banner Image Preview
                    </div>
                    <div className="flex items-center justify-center">
                      <Button variant="outline" asChild>
                        <label htmlFor="banner-upload" className="cursor-pointer">
                          <Upload size={16} className="mr-2" />
                          Upload Banner Image
                          <input
                            id="banner-upload"
                            type="file"
                            className="hidden"
                            accept=".png,.jpg,.jpeg"
                          />
                        </label>
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      PNG or JPG (max 5MB). Recommended dimensions: 1920×480 pixels.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Preview pane and actions */}
          <div className="w-full md:w-1/3">
            <div className="sticky top-6">
              <h3 className="font-medium mb-4">Theme Preview</h3>
              <div className={`border rounded-lg overflow-hidden ${previewMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`} style={{
                borderRadius: theme.components.borderRadius,
              }}>
                <div className="p-4 border-b" style={{
                  backgroundColor: theme.colors.primary,
                  color: '#ffffff',
                }}>
                  <div className="font-medium" style={{ fontFamily: theme.fonts.heading }}>
                    SCPNG Intranet
                  </div>
                </div>
                <div className="p-4" style={{
                  backgroundColor: previewMode === 'dark' ? '#121212' : theme.colors.background,
                }}>
                  <div style={{ fontFamily: theme.fonts.body, fontSize: theme.fonts.baseSize }}>
                    <h4 className="font-bold mb-2" style={{ fontFamily: theme.fonts.heading, color: previewMode === 'dark' ? '#fff' : theme.colors.text }}>
                      Dashboard
                    </h4>
                    <p className="text-sm mb-4" style={{ color: previewMode === 'dark' ? '#ccc' : theme.colors.text }}>
                      Welcome to your personalized dashboard
                    </p>
                    <div className="flex gap-2 mb-4">
                      <Button size="sm" style={{
                        backgroundColor: theme.colors.primary,
                        color: '#ffffff',
                        borderRadius: theme.components.buttonStyle === 'pill' ? '9999px' : 
                                   theme.components.buttonStyle === 'rounded' ? theme.components.borderRadius : '0',
                      }}>
                        Primary
                      </Button>
                      <Button size="sm" variant="outline" style={{
                        borderColor: theme.colors.primary,
                        color: previewMode === 'dark' ? '#fff' : theme.colors.primary,
                        borderRadius: theme.components.buttonStyle === 'pill' ? '9999px' : 
                                   theme.components.buttonStyle === 'rounded' ? theme.components.borderRadius : '0',
                      }}>
                        Secondary
                      </Button>
                    </div>
                    <div className="border p-3 rounded" style={{
                      borderRadius: theme.components.borderRadius,
                      borderColor: previewMode === 'dark' ? '#333' : '#eee',
                      backgroundColor: previewMode === 'dark' ? '#1e1e1e' : theme.colors.cardBg,
                      boxShadow: theme.components.shadowIntensity === 'none' ? 'none' : 
                               theme.components.shadowIntensity === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : 
                               theme.components.shadowIntensity === 'strong' ? '0 4px 6px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
                    }}>
                      <div className="text-sm" style={{ color: previewMode === 'dark' ? '#ccc' : theme.colors.text }}>
                        Card component example
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col gap-3">
                <Button onClick={handleSave} className="w-full">
                  <Save size={16} className="mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleReset} className="w-full">
                  <Undo size={16} className="mr-2" />
                  Reset to Default
                </Button>
              </div>
              
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Apply to all users</span>
                  <div className="flex items-center h-5">
                    <input
                      id="apply-all"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      defaultChecked
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  When enabled, theme changes will apply to all users. Otherwise, only administrators will see the changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeCustomization;
