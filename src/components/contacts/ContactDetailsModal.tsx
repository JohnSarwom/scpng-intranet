import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MicrosoftContact } from '@/hooks/useMicrosoftContacts';
import { Mail, Phone, MapPin, Building, Briefcase, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactDetailsModalProps {
    contact: MicrosoftContact | null;
    isOpen: boolean;
    onClose: () => void;
}

const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({ contact, isOpen, onClose }) => {
    const { toast } = useToast();

    if (!contact) return null;

    const handleCopyEmail = (email: string) => {
        navigator.clipboard.writeText(email);
        toast({
            title: "Email Copied",
            description: `${email} has been copied to your clipboard.`,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto hover-scrollbar">
                <style jsx global>{`
                    .hover-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                    .hover-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .hover-scrollbar::-webkit-scrollbar-thumb {
                        background-color: transparent;
                        border-radius: 20px;
                    }
                    .hover-scrollbar:hover::-webkit-scrollbar-thumb {
                        background-color: rgba(0, 0, 0, 0.2);
                    }
                `}</style>
                <DialogHeader>
                    <div className="flex flex-col items-center mb-4">
                        <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${contact.displayName}&backgroundColor=600018`}
                            alt={contact.displayName}
                            className="w-24 h-24 rounded-full border-4 border-background shadow-md mb-4"
                        />
                        <DialogTitle className="text-2xl font-bold text-center">{contact.displayName}</DialogTitle>
                        <DialogDescription className="text-center text-lg font-medium text-primary">
                            {contact.jobTitle || 'No position specified'}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 gap-4">
                        {contact.department && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10">
                                <div className="p-2 rounded-full bg-secondary/20 text-secondary-foreground">
                                    <Building className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Unit</p>
                                    <p className="text-sm font-medium">{contact.department}</p>
                                </div>
                            </div>
                        )}

                        {contact.officeLocation && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10">
                                <div className="p-2 rounded-full bg-secondary/20 text-secondary-foreground">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Division</p>
                                    <p className="text-sm font-medium">{contact.officeLocation}</p>
                                </div>
                            </div>
                        )}

                        {contact.emailAddresses?.[0] && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-secondary/20 text-secondary-foreground">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase">Email</p>
                                        <a href={`mailto:${contact.emailAddresses[0].address}`} className="text-sm font-medium hover:underline text-primary">
                                            {contact.emailAddresses[0].address}
                                        </a>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={() => handleCopyEmail(contact.emailAddresses![0].address)}
                                    title="Copy Email"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {(contact.businessPhones?.[0] || contact.mobilePhone) && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10">
                                <div className="p-2 rounded-full bg-secondary/20 text-secondary-foreground">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Phone</p>
                                    <div className="flex flex-col">
                                        {contact.businessPhones?.[0] && (
                                            <a href={`tel:${contact.businessPhones[0]}`} className="text-sm font-medium hover:underline">
                                                {contact.businessPhones[0]} (Business)
                                            </a>
                                        )}
                                        {contact.mobilePhone && (
                                            <a href={`tel:${contact.mobilePhone}`} className="text-sm font-medium hover:underline">
                                                {contact.mobilePhone} (Mobile)
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {contact.companyName && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10">
                                <div className="p-2 rounded-full bg-secondary/20 text-secondary-foreground">
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Company</p>
                                    <p className="text-sm font-medium">{contact.companyName}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ContactDetailsModal;
