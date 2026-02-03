import React, { useState } from 'react';
import useStaffByDivision from '@/hooks/useStaffByDivision';
import { useDivisionContext } from '@/hooks/useDivisionContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StaffByDivisionListProps {
  initialDivisionId?: string;
}

export const StaffByDivisionList: React.FC<StaffByDivisionListProps> = ({ initialDivisionId }) => {
  const { userDivisions } = useDivisionContext();
  const [divisionId, setDivisionId] = useState<string | undefined>(initialDivisionId);
  const [searchQuery, setSearchQuery] = useState('');
  const [includeAllDivisions, setIncludeAllDivisions] = useState(false);

  const { staffMembers, loading, error, isEmpty } = useStaffByDivision({
    divisionId,
    searchQuery,
    includeAllDivisions,
  });

  const handleDivisionChange = (value: string) => {
    setDivisionId(value === 'all' ? undefined : value);
    setIncludeAllDivisions(value === 'all');
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-bold mb-4">Staff Directory</h2>
      
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex space-x-2">
          <Select 
            value={divisionId || (includeAllDivisions ? 'all' : '')}
            onValueChange={handleDivisionChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {userDivisions.map(division => (
                <SelectItem key={division.id} value={division.id}>
                  {division.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{String(error)}</p>
      ) : isEmpty ? (
        <p className="text-center">No staff members found</p>
      ) : (
        <div className="space-y-3">
          {staffMembers.map(staff => (
            <Card 
              key={staff.email} 
              className="p-3 hover:bg-gray-50"
            >
              <div className="flex space-x-4">
                <Avatar>
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}`} />
                  <AvatarFallback>{staff.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 flex-1">
                  <h3 className="text-sm font-semibold">{staff.name}</h3>
                  <p className="text-sm text-gray-600">{staff.job_title}</p>
                  <p className="text-sm">{staff.email}</p>
                  <div className="flex space-x-2">
                    <Badge variant="outline">{staff.department}</Badge>
                    <Badge variant="secondary">
                      {staff.division_id.replace(/-/g, ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffByDivisionList; 