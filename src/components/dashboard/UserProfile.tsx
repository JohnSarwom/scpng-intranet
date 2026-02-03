
import React from 'react';
import { MapPin, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfileProps {
  name: string;
  title: string;
  location: string;
  dateOfBirth: string;
  bloodType: string;
  workingHours: string;
  avatarUrl?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({
  name,
  title,
  location,
  dateOfBirth,
  bloodType,
  workingHours,
  avatarUrl
}) => {
  const nameParts = name.split(' ');
  const initials = nameParts.length > 1 
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
    : nameParts[0].substring(0, 2);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold">MY PROFILE</h2>
        <Button variant="outline" size="sm" className="gap-1">
          <Edit size={14} />
          <span className="hidden sm:inline">Edit</span>
        </Button>
      </div>
      
      <div className="flex flex-col items-center">
        <Avatar className="w-20 h-20">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-intranet-primary text-white text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <h3 className="mt-3 text-xl font-semibold">{name}</h3>
        <p className="text-gray-500 uppercase text-sm tracking-wide">{title}</p>
        
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <MapPin size={14} className="mr-1" />
          <span>{location}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-6">
        <div className="text-center">
          <p className="text-xs text-gray-500">Date Birth</p>
          <p className="font-medium">{dateOfBirth}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Blood</p>
          <p className="font-medium">{bloodType}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Working Hours</p>
          <p className="font-medium">{workingHours}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
