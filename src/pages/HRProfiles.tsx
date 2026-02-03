import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Users,
  UserPlus,
  Download,
  Upload,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
} from 'lucide-react';
import { useHRService } from '@/hooks/useHRService';
import { Employee, EmployeeProfile, HRStatistics, EmploymentType, EmploymentStatus } from '@/types/hr';
import EmployeeProfileModal from '@/components/hr/EmployeeProfileModal';
import HRDataImporter from '@/components/hr/HRDataImporter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth';

const HRProfiles: React.FC = () => {
  const { hasPermission } = useRoleBasedAuth();
  const [showImporter, setShowImporter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [statistics, setStatistics] = useState<HRStatistics | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  const {
    isInitialized,
    isLoading,
    error,
    fetchEmployees,
    fetchEmployeeProfile,
    fetchStatistics,
  } = useHRService();

  // Load employees on mount
  useEffect(() => {
    if (isInitialized) {
      loadEmployees();
      loadStatistics();
    }
  }, [isInitialized]);

  const loadEmployees = async () => {
    const data = await fetchEmployees({
      searchQuery,
      employmentStatus: statusFilter !== 'all' ? (statusFilter as EmploymentStatus) : undefined,
      department: departmentFilter !== 'all' ? departmentFilter : undefined,
      employmentType: employmentTypeFilter !== 'all' ? (employmentTypeFilter as EmploymentType) : undefined,
      location: locationFilter !== 'all' ? locationFilter : undefined,
    });
    setEmployees(data);
  };

  const loadStatistics = async () => {
    const stats = await fetchStatistics();
    setStatistics(stats);
  };

  const handleSearch = () => {
    loadEmployees();
  };

  const handleRefresh = () => {
    loadEmployees();
    loadStatistics();
  };

  // Get unique departments, locations
  const departments = ['all', ...new Set(employees.map(e => e.department).filter(Boolean))];
  const locations = ['all', ...new Set(employees.map(e => e.officeLocation).filter(Boolean))];

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches =
        emp.firstName?.toLowerCase().includes(query) ||
        emp.lastName?.toLowerCase().includes(query) ||
        emp.email?.toLowerCase().includes(query) ||
        emp.employeeId?.toLowerCase().includes(query) ||
        emp.jobTitle?.toLowerCase().includes(query) ||
        emp.department?.toLowerCase().includes(query);
      if (!matches) return false;
    }
    if (statusFilter !== 'all' && emp.employmentStatus !== statusFilter) return false;
    if (departmentFilter !== 'all' && emp.department !== departmentFilter) return false;
    if (employmentTypeFilter !== 'all' && emp.employmentType !== employmentTypeFilter) return false;
    if (locationFilter !== 'all' && emp.officeLocation !== locationFilter) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  const getStatusBadgeColor = (status: EmploymentStatus) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800';
      case 'Terminated': return 'bg-red-100 text-red-800';
      case 'Retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmploymentTypeBadgeColor = (type: EmploymentType) => {
    switch (type) {
      case 'Permanent': return 'bg-blue-100 text-blue-800';
      case 'Contract': return 'bg-purple-100 text-purple-800';
      case 'Casual': return 'bg-orange-100 text-orange-800';
      case 'Temporary': return 'bg-pink-100 text-pink-800';
      case 'Intern': return 'bg-teal-100 text-teal-800';
      case 'Consultant': return 'bg-indigo-100 text-indigo-800';
      case 'Agency': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderEmployeeCard = (employee: Employee) => (
    <Card
      key={employee.id}
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => setSelectedEmployee(employee.employeeId)}
    >
      <div className="h-12 bg-gradient-to-r from-intranet-primary to-intranet-secondary"></div>
      <CardContent className="p-6 pt-0 relative">
        <div className="flex justify-center">
          <img
            src={employee.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${employee.fullName}&backgroundColor=600018`}
            alt={employee.fullName}
            className="w-20 h-20 rounded-full border-4 border-background -mt-10 shadow-md"
          />
        </div>

        <div className="text-center mt-2">
          <h3 className="font-bold">{employee.fullName}</h3>
          <p className="text-sm text-muted-foreground">{employee.jobTitle}</p>
          <p className="text-xs text-muted-foreground mt-1">ID: {employee.employeeId}</p>

          <div className="flex gap-2 justify-center mt-2">
            <Badge className={getStatusBadgeColor(employee.employmentStatus)}>
              {employee.employmentStatus}
            </Badge>
            <Badge className={getEmploymentTypeBadgeColor(employee.employmentType)}>
              {employee.employmentType}
            </Badge>
          </div>

          {employee.department && (
            <div className="mt-2">
              <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                {employee.department}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {employee.email && (
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-intranet-primary flex-shrink-0" />
              <span className="truncate">{employee.email}</span>
            </div>
          )}

          {(employee.phone || employee.mobilePhone) && (
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-intranet-primary flex-shrink-0" />
              <span>{employee.mobilePhone || employee.phone}</span>
            </div>
          )}

          {employee.officeLocation && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-intranet-primary flex-shrink-0" />
              <span>{employee.officeLocation}</span>
            </div>
          )}

          {employee.startDate && (
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-intranet-primary flex-shrink-0" />
              <span>Started: {new Date(employee.startDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <Button variant="outline" size="sm" className="w-full">
            View Full Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStatisticsCards = () => {
    if (!statistics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">All staff members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statistics.onLeave}</div>
            <p className="text-xs text-muted-foreground">Temporary absence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contracts Expiring</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.contractsExpiring}</div>
            <p className="text-xs text-muted-foreground">Next 90 days</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">HR Profiles</h1>
            <p className="text-muted-foreground">
              Comprehensive employee management system - search, view, and manage staff profiles
            </p>
          </div>
          <div className="flex gap-2">
            {hasPermission('hr_profiles', 'write') && (
              <Button variant="outline" onClick={() => setShowImporter(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            )}
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {hasPermission('hr_profiles', 'write') && (
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            )}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        {renderStatisticsCards()}

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, employee ID, email, position, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Employment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                    <SelectItem value="Terminated">Terminated</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Employment Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Permanent">Permanent</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Casual">Casual</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                    <SelectItem value="Intern">Intern</SelectItem>
                    <SelectItem value="Consultant">Consultant</SelectItem>
                    <SelectItem value="Agency">Agency</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept === 'all' ? 'All Departments' : dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>
                        {loc === 'all' ? 'All Locations' : loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} employees
                </p>
                <Button variant="outline" size="sm" onClick={handleSearch}>
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Grid */}
        {isLoading ? (
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
        ) : filteredEmployees.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedEmployees.map(employee => renderEmployeeCard(employee))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No employees found matching your search criteria
            </p>
          </div>
        )}
      </div>

      {/* Employee Profile Modal */}
      {selectedEmployee && (
        <EmployeeProfileModal
          employeeId={selectedEmployee}
          open={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

      {/* Import Data Dialog */}
      <Dialog open={showImporter} onOpenChange={setShowImporter}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Employee Data</DialogTitle>
            <DialogDescription>
              Import employee data from SCPNG staff directory into SharePoint
            </DialogDescription>
          </DialogHeader>
          <HRDataImporter />
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default HRProfiles;
