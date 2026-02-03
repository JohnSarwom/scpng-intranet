import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Phone, Mail, MapPin, Plus, RefreshCw, Building, Users, Briefcase, Shield, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OrganizationalStructure from '@/components/contacts/OrganizationalStructure';
import useMicrosoftContacts, { MicrosoftContact } from '@/hooks/useMicrosoftContacts';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import ContactDetailsModal from '@/components/contacts/ContactDetailsModal';

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const { contacts, isLoading, error, refetch } = useMicrosoftContacts();
  const { session, user, profile, selectedDivision, isAdmin } = useSupabaseAuth();
  const [allContacts, setAllContacts] = useState<MicrosoftContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<MicrosoftContact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleCopyAll = () => {
    if (allContacts.length === 0) {
      toast({
        title: "No Contacts",
        description: "There are no contacts to copy.",
        variant: "destructive",
      });
      return;
    }
    const contactsJson = JSON.stringify(allContacts, null, 2);
    navigator.clipboard.writeText(contactsJson).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: `${allContacts.length} contacts have been copied as JSON.`,
      });
    }).catch(err => {
      console.error('Failed to copy contacts: ', err);
      toast({
        title: "Error",
        description: "Could not copy contacts to clipboard.",
        variant: "destructive",
      });
    });
  };

  // Update contacts with MS Graph data
  useEffect(() => {
    if (contacts.length > 0) {
      // Helper to normalize office location to division ID
      const getDivisionIdFromOffice = (office?: string) => {
        if (!office) return null;
        // Normalize: "Corporate Services Division" -> "corporate-services-division"
        return office.toLowerCase()
          .trim()
          .replace(/&/g, 'and')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      };

      // Process Microsoft contacts
      const processedContacts = contacts.map(contact => {
        // Derive divisionId from officeLocation
        const derivedDivisionId = getDivisionIdFromOffice(contact.officeLocation);
        if (derivedDivisionId) {
          (contact as any).divisionId = derivedDivisionId;
        }
        return contact;
      });

      // Filter out external contacts
      // Requirement: Must have both Division (Office) and Unit (Department)
      const validContacts = processedContacts.filter(contact => {
        const hasDivision = !!(contact as any).divisionId;
        const hasUnit = !!contact.department;
        return hasDivision && hasUnit;
      });

      setAllContacts(validContacts);
    }
  }, [contacts]);

  // Filter by division, search term, and other filters
  const filteredContacts = allContacts.filter(contact => {
    // Division filter
    const matchesDivision = isAdmin
      ? true // Admins see everything
      : !selectedDivision // If no division is selected
        ? true // Show all
        : (contact as any).divisionId === selectedDivision; // Otherwise filter by division

    // Search filter
    const matchesSearch = contact.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.jobTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (contact.emailAddresses?.[0]?.address || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Department filter
    const matchesDepartmentFilter = departmentFilter === 'all' || (contact.department?.toLowerCase() || '') === departmentFilter.toLowerCase();

    // Company filter
    const matchesCompanyFilter = companyFilter === 'all' || (contact.companyName?.toLowerCase() || '') === companyFilter.toLowerCase();

    return matchesDivision && matchesSearch && matchesDepartmentFilter && matchesCompanyFilter;
  });

  // Filter contacts by department (division)
  const divisionContacts = allContacts.filter(contact => {
    const isDivisionContact = contact.department && contact.department.trim() !== '';

    // Apply division filtering based on user's permissions
    const matchesDivision = isAdmin
      ? true // Admins see all divisions 
      : !selectedDivision
        ? true
        : (contact as any).divisionId === selectedDivision;

    return isDivisionContact && matchesDivision;
  });

  // Group contacts by their divisionId
  const contactsByDivision = divisionContacts.reduce((acc, contact) => {
    const divisionId = (contact as any).divisionId || 'other';
    if (!acc[divisionId]) {
      acc[divisionId] = [];
    }
    acc[divisionId].push(contact);
    return acc;
  }, {} as Record<string, MicrosoftContact[]>);

  // Group contacts by their units/departments
  const contactsByUnit = divisionContacts.reduce((acc, contact) => {
    if (!contact.department) return acc;

    const unit = contact.department.trim();
    if (!acc[unit]) {
      acc[unit] = [];
    }
    acc[unit].push(contact);
    return acc;
  }, {} as Record<string, MicrosoftContact[]>);

  // Filter contacts that are users (have userPrincipalName)
  const userContacts = allContacts.filter(contact => {
    const isUserContact = contact.userPrincipalName && contact.userPrincipalName.includes('@');

    // Apply division filtering based on user's permissions
    const matchesDivision = isAdmin
      ? true // Admins see all divisions
      : !selectedDivision
        ? true
        : (contact as any).divisionId === selectedDivision;

    return isUserContact && matchesDivision;
  });

  // Get unique departments from filtered contacts
  const departments = ['All', ...new Set(allContacts
    .filter(contact => isAdmin || !selectedDivision || (contact as any).divisionId === selectedDivision)
    .map(contact => contact.department)
    .filter((dept): dept is string => !!dept))];

  // Get unique companies from filtered contacts
  const companies = ['All', ...new Set(allContacts
    .filter(contact => isAdmin || !selectedDivision || (contact as any).divisionId === selectedDivision)
    .map(contact => contact.companyName)
    .filter((company): company is string => !!company))];

  const renderContactCard = (contact: MicrosoftContact, index: number) => (
    <Card key={contact.id} className="overflow-hidden animate-fade-in" style={{ animationDelay: `${0.3 + index * 0.05}s` }}>
      <div className="h-12 bg-gradient-to-r from-intranet-primary to-intranet-secondary"></div>
      <CardContent className="p-6 pt-0 relative">
        <div className="flex justify-center">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${contact.displayName}&backgroundColor=600018`}
            alt={contact.displayName}
            className="w-20 h-20 rounded-full border-4 border-background -mt-10 shadow-md"
          />
        </div>

        <div className="text-center mt-2">
          <h3 className="font-bold">{contact.displayName}</h3>
          <p className="text-sm text-muted-foreground">{contact.jobTitle || 'No position specified'}</p>
          {contact.department && (
            <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full mt-1">
              {contact.department}
            </span>
          )}
          {contact.companyName && (
            <div className="mt-1 text-xs text-muted-foreground flex items-center justify-center">
              <Building className="h-3 w-3 mr-1" />
              {contact.companyName}
            </div>
          )}
          {/* Show division badge for admins */}
          {isAdmin && (contact as any).divisionId && (
            <div className="mt-1 text-xs text-muted-foreground flex items-center justify-center">
              <Shield className="h-3 w-3 mr-1" />
              {(contact as any).divisionId.replace(/-/g, ' ')}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {contact.emailAddresses?.[0] && (
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-intranet-primary" />
              <span className="truncate">{contact.emailAddresses[0].address}</span>
            </div>
          )}

          {(contact.businessPhones?.[0] || contact.mobilePhone) && (
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-intranet-primary" />
              <span>{contact.businessPhones?.[0] || contact.mobilePhone}</span>
            </div>
          )}

          {contact.officeLocation && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-intranet-primary" />
              <span>{contact.officeLocation}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-between">
          <Button
            variant="outline"
            size="sm"
            className="w-full icon-hover-effect"
            onClick={() => {
              setSelectedContact(contact);
              setIsModalOpen(true);
            }}
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderContactsGrid = (contactsToRender: MicrosoftContact[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {isLoading ? (
        // Loading skeletons
        Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="h-12 bg-gradient-to-r from-intranet-primary to-intranet-secondary"></div>
            <CardContent className="p-6 pt-0 relative">
              <div className="flex justify-center">
                <Skeleton className="w-20 h-20 rounded-full -mt-10" />
              </div>
              <div className="text-center mt-2">
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))
      ) : contactsToRender.length > 0 ? (
        contactsToRender.map((contact, index) => renderContactCard(contact, index))
      ) : (
        <div className="col-span-full text-center py-8 text-gray-500">
          No contacts found matching your search criteria
        </div>
      )}
    </div>
  );

  // Render contacts organized by divisions
  const renderDivisionContactsSection = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="h-12 bg-gradient-to-r from-intranet-primary to-intranet-secondary"></div>
              <CardContent className="p-6 pt-0 relative">
                <div className="flex justify-center">
                  <Skeleton className="w-20 h-20 rounded-full -mt-10" />
                </div>
                <div className="text-center mt-2">
                  <Skeleton className="h-6 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (Object.keys(contactsByDivision).length === 0) {
      return (
        <div className="col-span-full text-center py-8 text-gray-500">
          No divisional contacts found
        </div>
      );
    }

    const divisionOrder = [
      "executive-division",
      "corporate-services-division",
      "licensing-market-supervision-division",
      "legal-services-division",
      "research-publication-division",
      "secretariat-unit",
      "other"
    ];

    // Sort division IDs based on the predefined order, with any unknown divisions at the end
    const orderedDivisionIds = Object.keys(contactsByDivision).sort((a, b) => {
      const indexA = divisionOrder.indexOf(a);
      const indexB = divisionOrder.indexOf(b);

      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    return (
      <div className="space-y-8">
        {orderedDivisionIds.map(divisionId => {
          const contacts = contactsByDivision[divisionId];
          if (!contacts || contacts.length === 0) return null;

          // Format division name for display
          const divisionName = divisionId === 'other'
            ? 'Other Contacts'
            : divisionId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

          return (
            <div key={divisionId} className="animate-fade-in">
              <h2 className="text-xl font-semibold mb-4 px-4 py-2 bg-secondary text-white rounded-lg">{divisionName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {contacts.map((contact, index) => renderContactCard(contact, index))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render contacts organized by units/departments
  const renderUnitContactsSection = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="h-12 bg-gradient-to-r from-intranet-primary to-intranet-secondary"></div>
              <CardContent className="p-6 pt-0 relative">
                <div className="flex justify-center">
                  <Skeleton className="w-20 h-20 rounded-full -mt-10" />
                </div>
                <div className="text-center mt-2">
                  <Skeleton className="h-6 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (Object.keys(contactsByUnit).length === 0) {
      return (
        <div className="col-span-full text-center py-8 text-gray-500">
          No unit contacts found
        </div>
      );
    }

    // Sort units alphabetically
    const sortedUnitNames = Object.keys(contactsByUnit).sort((a, b) => a.localeCompare(b));

    return (
      <div className="space-y-8">
        {sortedUnitNames.map(unitName => {
          const contacts = contactsByUnit[unitName];
          if (!contacts || contacts.length === 0) return null;

          // Format unit name for display
          const formattedUnitName = unitName.includes('Unit') ? unitName : `${unitName} Unit`;

          return (
            <div key={unitName} className="animate-fade-in">
              <h2 className="text-xl font-semibold mb-4 px-4 py-2 bg-secondary text-white rounded-lg">{formattedUnitName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {contacts.map((contact, index) => renderContactCard(contact, index))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <PageLayout>
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-2">Organization Directory</h1>
        <p className="text-gray-500">
          {selectedDivision && !isAdmin
            ? "View contacts within your division"
            : "Find and connect with colleagues across the SCPNG organization"
          }
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Contacts
          </TabsTrigger>
          <TabsTrigger value="division" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Division Contacts
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Unit Contacts
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow animate-fade-in">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, position, or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept.toLowerCase()}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company.toLowerCase()}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                className="whitespace-nowrap animate-fade-in btn-hover-effect"
                style={{ animationDelay: '0.2s' }}
                onClick={refetch}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button className="whitespace-nowrap animate-fade-in btn-hover-effect" style={{ animationDelay: '0.2s' }}>
                <Plus size={16} className="mr-1" />
                Add Contact
              </Button>
              <Button
                className="whitespace-nowrap animate-fade-in btn-hover-effect"
                style={{ animationDelay: '0.2s' }}
                onClick={handleCopyAll}
              >
                <Copy size={16} className="mr-1" />
                Copy All
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {renderContactsGrid(filteredContacts)}
        </TabsContent>

        <TabsContent value="division">
          {/* Division Contacts Tab - Now organized by divisions */}
          <div className="flex flex-row gap-4 mb-6">
            <div className="relative flex-grow animate-fade-in">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search division contacts..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              className="whitespace-nowrap animate-fade-in btn-hover-effect"
              style={{ animationDelay: '0.2s' }}
              onClick={refetch}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {renderDivisionContactsSection()}
        </TabsContent>

        <TabsContent value="units">
          {/* Unit Contacts Tab - Organized by units/departments */}
          <div className="flex flex-row gap-4 mb-6">
            <div className="relative flex-grow animate-fade-in">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search unit contacts..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              className="whitespace-nowrap animate-fade-in btn-hover-effect"
              style={{ animationDelay: '0.2s' }}
              onClick={refetch}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {renderUnitContactsSection()}
        </TabsContent>

        <TabsContent value="users">
          {/* User Contacts Tab */}
          {renderContactsGrid(userContacts)}
        </TabsContent>
      </Tabs>
      <ContactDetailsModal
        contact={selectedContact}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </PageLayout>
  );
};

export default Contacts;
