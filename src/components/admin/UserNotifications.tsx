
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

const UserNotifications = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell size={20} />
          <span>Notification Management</span>
        </CardTitle>
        <CardDescription>
          Configure system-wide notification settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-3">Email Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium">System Announcements</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Important system updates and changes</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" id="toggle-system" defaultChecked className="sr-only" />
                    <label htmlFor="toggle-system" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer bg-intranet-primary">
                      <span className="block h-6 w-6 rounded-full bg-white shadow transform transition-transform translate-x-4"></span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium">Document Updates</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifications about document changes</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" id="toggle-docs" defaultChecked className="sr-only" />
                    <label htmlFor="toggle-docs" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer bg-intranet-primary">
                      <span className="block h-6 w-6 rounded-full bg-white shadow transform transition-transform translate-x-4"></span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium">Calendar Events</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming event reminders</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" id="toggle-calendar" defaultChecked className="sr-only" />
                    <label htmlFor="toggle-calendar" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer bg-intranet-primary">
                      <span className="block h-6 w-6 rounded-full bg-white shadow transform transition-transform translate-x-4"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-3">Notification Frequency</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">System Digest</label>
                  <select className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="immediate">Immediate</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Maximum Emails Per Day</label>
                  <select className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                    <option value="1">1 email per day</option>
                    <option value="3">3 emails per day</option>
                    <option value="5">5 emails per day</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Quiet Hours</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400">From</label>
                      <input type="time" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" defaultValue="18:00" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400">To</label>
                      <input type="time" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" defaultValue="09:00" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-3">Department Notification Templates</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Template</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">Finance Department</td>
                    <td className="px-4 py-3 whitespace-nowrap">Financial Report Template</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        Delete
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">HR Department</td>
                    <td className="px-4 py-3 whitespace-nowrap">HR Updates Template</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        Delete
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">IT Department</td>
                    <td className="px-4 py-3 whitespace-nowrap">System Maintenance Template</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Draft
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserNotifications;
