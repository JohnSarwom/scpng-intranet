import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import { UserSharePointService, UserRole } from '@/services/userSharePointService';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '@/services/graphService';

const UserManagementTable = () => {
  const [users, setUsers] = useState<UserRole[]>([]);
  const { instance } = useMsal();

  const fetchUsers = async () => {
    try {
      const graphClient = await getGraphClient(instance);
      if (!graphClient) return;

      const userService = new UserSharePointService(graphClient);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [instance]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddUserModal fetchUsers={fetchUsers} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.user_email}>
              <TableCell>{user.user_name || '-'}</TableCell>
              <TableCell>{user.user_email}</TableCell>
              <TableCell>{user.role_name}</TableCell>
              <TableCell>{user.division_name || '-'}</TableCell>
              <TableCell>{user.unit_name || '-'}</TableCell>
              <TableCell>
                <EditUserModal user={user} fetchUsers={fetchUsers} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagementTable;
