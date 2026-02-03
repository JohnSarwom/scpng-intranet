import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export interface PermissionMatrixProps {
    permissions: any;
    onChange: (permissions: any) => void;
    readOnly?: boolean;
}

const RESOURCES = [
    {
        id: 'assets',
        label: 'Asset Management',
        actions: [
            { id: 'read', label: 'View Assets' },
            { id: 'write', label: 'Create/Edit Assets' },
            { id: 'delete', label: 'Delete Assets' },
        ],
        tabs: [
            { id: 'dashboard', label: 'Dashboard Tab' },
            { id: 'invoices', label: 'Invoices Tab' },
            { id: 'maintenance', label: 'Maintenance Tab' },
            { id: 'decommissioned', label: 'Decommissioned Tab' },
            { id: 'reports', label: 'Reports Tab' },
        ]
    },
    {
        id: 'hr_profiles',
        label: 'HR Profiles',
        actions: [
            { id: 'read', label: 'View Profiles' },
            { id: 'write', label: 'Edit Profiles' },
            { id: 'delete', label: 'Delete Profiles' },
        ]
    },
    {
        id: 'payments',
        label: 'Payments',
        actions: [
            { id: 'read', label: 'View Payments' },
            { id: 'write', label: 'Process Payments' },
        ]
    },
    {
        id: 'admin',
        label: 'Admin Portal',
        actions: [
            { id: '*', label: 'Full Access' },
        ]
    },
    // Add other resources as needed
    { id: 'home', label: 'Home', actions: [{ id: 'read', label: 'Access' }] },
    {
        id: 'news',
        label: 'News',
        actions: [
            { id: 'read', label: 'Access' },
            { id: 'upload', label: 'Upload SCPNG News' }
        ]
    },
    { id: 'documents', label: 'Documents', actions: [{ id: 'read', label: 'Access' }] },
    { id: 'forms', label: 'Forms', actions: [{ id: 'read', label: 'Access' }] },
    { id: 'ai', label: 'AI Hub', actions: [{ id: 'access', label: 'Access' }] },
    { id: 'tickets', label: 'Tickets', actions: [{ id: 'read', label: 'Access' }] },
    { id: 'licenses', label: 'Licensing', actions: [{ id: 'read', label: 'Access' }] },
    { id: 'gallery', label: 'Gallery', actions: [{ id: 'read', label: 'Access' }] },
    { id: 'contacts', label: 'Contacts', actions: [{ id: 'read', label: 'Access' }] },
    { id: 'units', label: 'Unit Page', actions: [{ id: 'read', label: 'Access' }] },
    { id: 'reports', label: 'Reports', actions: [{ id: 'read', label: 'Access' }] },
    { id: 'organization', label: 'Organization', actions: [{ id: 'read', label: 'Access' }] },
    { id: 'settings', label: 'Settings', actions: [{ id: 'read', label: 'Access' }] },
];

const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ permissions, onChange, readOnly = false }) => {

    const handleToggle = (resourceId: string, actionId: string) => {
        if (readOnly) return;

        const currentResourcePerms = permissions[resourceId] || [];
        let newResourcePerms;

        if (currentResourcePerms.includes(actionId)) {
            newResourcePerms = currentResourcePerms.filter((a: string) => a !== actionId);
        } else {
            newResourcePerms = [...currentResourcePerms, actionId];
        }

        const newPermissions = {
            ...permissions,
            [resourceId]: newResourcePerms
        };

        // Cleanup empty arrays
        if (newResourcePerms.length === 0) {
            delete newPermissions[resourceId];
        }

        onChange(newPermissions);
    };

    return (
        <div className="border rounded-md p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <Accordion type="multiple" className="w-full">
                {RESOURCES.map((resource) => (
                    <AccordionItem key={resource.id} value={resource.id}>
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{resource.label}</span>
                                {permissions[resource.id]?.length > 0 && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                        {permissions[resource.id].length} selected
                                    </span>
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="pl-4 space-y-4">
                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-2">
                                    {resource.actions.map((action) => (
                                        <div key={action.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`${resource.id}-${action.id}`}
                                                checked={permissions[resource.id]?.includes(action.id)}
                                                onCheckedChange={() => handleToggle(resource.id, action.id)}
                                                disabled={readOnly}
                                            />
                                            <Label htmlFor={`${resource.id}-${action.id}`}>{action.label}</Label>
                                        </div>
                                    ))}
                                </div>

                                {/* Tabs (if any) */}
                                {resource.tabs && (
                                    <div className="mt-4 border-t pt-2">
                                        <h4 className="text-sm font-semibold mb-2 text-gray-500">Tabs / Sections</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {resource.tabs.map((tab) => (
                                                <div key={tab.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`${resource.id}-${tab.id}`}
                                                        checked={permissions[resource.id]?.includes(tab.id)}
                                                        onCheckedChange={() => handleToggle(resource.id, tab.id)}
                                                        disabled={readOnly}
                                                    />
                                                    <Label htmlFor={`${resource.id}-${tab.id}`}>{tab.label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default PermissionMatrix;
