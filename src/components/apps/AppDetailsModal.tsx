import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { AppLink } from '@/types/apps';

interface AppDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    app: AppLink | null;
}

export const AppDetailsModal: React.FC<AppDetailsModalProps> = ({ isOpen, onClose, app }) => {
    if (!app) return null;

    const isIconUrl = app.icon?.startsWith('http');

    const handleOpenApp = () => {
        window.open(app.url, app.isExternal ? '_blank' : '_self');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-4">
                        {/* Icon */}
                        <div className="h-20 w-20 rounded-xl bg-gray-50 flex items-center justify-center text-5xl shadow-sm border border-gray-100 p-2">
                            {isIconUrl ? (
                                <img
                                    src={app.icon}
                                    alt={app.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '📦';
                                    }}
                                />
                            ) : (
                                <span>{app.icon || '📦'}</span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <DialogTitle className="text-2xl">{app.name}</DialogTitle>
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                {app.category || 'Uncategorized'}
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-2">
                    <DialogDescription className="text-base text-gray-600 text-center sm:text-left">
                        {app.description || 'No description available for this application.'}
                    </DialogDescription>

                    <div className="space-y-4 pt-4">
                        {/* Additional Details can go here if needed */}
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 sm:justify-between gap-2 border-t mt-auto">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="w-full sm:w-auto"
                    >
                        Close
                    </Button>
                    <Button
                        type="button"
                        onClick={handleOpenApp}
                        className="w-full sm:w-auto gap-2 bg-intranet-primary hover:bg-intranet-primary/90"
                    >
                        Open Application
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
