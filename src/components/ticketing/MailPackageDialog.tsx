import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MailPackageData, MailPackageStatus, MailPackageType } from './MailAndPackages'; // Adjust import path if needed
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MailPackageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: MailPackageData) => void;
    initialData?: MailPackageData | null;
}

// Need to define statusMap here or import it if defined centrally
const statusMap: { [key in MailPackageStatus]: { icon: React.ElementType; color: string; label: string } } = {
    'Received': { icon: () => null, color: 'gray', label: 'Received' }, // Placeholder icon
    'Pending Pickup': { icon: () => null, color: 'blue', label: 'Pending Pickup' },
    'Signature Required': { icon: () => null, color: 'yellow', label: 'Signature Req.' },
    'Delivered': { icon: () => null, color: 'green', label: 'Delivered' },
};

// Define a type for the form state, similar to MailPackageData but allowing partials
// and ensuring date is handled correctly.
// Let's rename recipientDepartment to recipientEntity here as well.
type MailPackageFormState = Omit<Partial<MailPackageData>, 'receivedDate' | 'pickedUpDate' | 'recipientEntity'> & {
    receivedDate?: Date; 
    pickedUpDate?: Date | null;
    recipientUnit?: string; // Renamed from recipientEntity
};

const MailPackageDialog: React.FC<MailPackageDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}) => {
    // Use the defined type for the state
    const [formData, setFormData] = useState<MailPackageFormState>({});
    // Keep the separate receivedDate state for the calendar component
    const [receivedDate, setReceivedDate] = useState<Date | undefined>(new Date());

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Map initialData to form state, using the correct field name
                const { recipientUnit, ...restData } = initialData; // Use recipientUnit
                setFormData({ 
                    ...restData, 
                    recipientUnit: recipientUnit // Use recipientUnit here too
                }); 
                setReceivedDate(initialData.receivedDate || new Date());
            } else {
                // Default new item data
                setFormData({ 
                    type: 'Mail', 
                    status: 'Received', 
                    receivedDate: new Date()
                 });
                setReceivedDate(new Date());
            }
        } else {
            // Reset form on close
            setFormData({});
            setReceivedDate(new Date());
        }
    }, [isOpen, initialData]);

    // Generic change handler for inputs/textarea
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Specific handler for Select components
    const handleSelectChange = (name: keyof MailPackageFormState, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Specific handler for Date picker
    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setFormData(prev => ({ ...prev, receivedDate: date }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation (example)
        if (!formData.recipientName || !formData.title) {
            alert('Recipient Name and Title/Subject are required.'); // Replace with better UI feedback
            return;
        }
        // Map form state back to MailPackageData
        const { recipientUnit, ...restForm } = formData;
        onSubmit({
             ...restForm,
             recipientUnit: recipientUnit, // Use recipientUnit when submitting
             receivedDate: receivedDate || new Date(), // Ensure date is set
        } as MailPackageData); // Assert type after validation
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Mail/Package' : 'Add New Mail/Package'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Type */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type *
                            </Label>
                            <Select
                                name="type"
                                value={formData.type}
                                onValueChange={(value) => handleSelectChange('type', value as MailPackageType)}
                                required
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Mail">Mail</SelectItem>
                                    <SelectItem value="Package">Package</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Title / Subject / From */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                {formData.type === 'Mail' ? 'Subject/From *' : 'Description *'}
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title || ''}
                                onChange={handleChange}
                                className="col-span-3"
                                required
                                placeholder={formData.type === 'Mail' ? 'e.g., Invoice Q3 / From: Acme Corp' : 'e.g., Laptop Box / Dell XPS 15'}
                            />
                        </div>

                        {/* Tracking Number */}
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tracking" className="text-right">
                                Tracking #
                            </Label>
                            <Input
                                id="tracking"
                                name="tracking"
                                value={formData.tracking || ''}
                                onChange={handleChange}
                                className="col-span-3"
                                placeholder="Optional tracking number"
                            />
                        </div>

                        {/* Recipient Name */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="recipientName" className="text-right">
                                Recipient *
                            </Label>
                            <Input
                                id="recipientName"
                                name="recipientName"
                                value={formData.recipientName || ''}
                                onChange={handleChange}
                                className="col-span-3"
                                required
                                placeholder="Recipient's full name"
                            />
                        </div>

                        {/* Recipient Unit - Renamed */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="recipientUnit" className="text-right">
                                Unit
                            </Label>
                            <Input
                                id="recipientUnit"
                                name="recipientUnit"
                                value={formData.recipientUnit || ''}
                                onChange={handleChange}
                                className="col-span-3"
                                placeholder="Optional unit or department"
                            />
                        </div>

                        {/* Received Date */}
                        <div className="grid grid-cols-4 items-center gap-4">
                           <Label htmlFor="receivedDate" className="text-right">
                               Received *
                           </Label>
                           <Popover>
                               <PopoverTrigger asChild>
                                   <Button
                                       variant={"outline"}
                                       className={cn(
                                           "col-span-3 justify-start text-left font-normal",
                                           !formData.receivedDate && "text-muted-foreground"
                                       )}
                                   >
                                       <CalendarIcon className="mr-2 h-4 w-4" />
                                       {formData.receivedDate ? format(formData.receivedDate, "PPP") : <span>Pick a date</span>}
                                   </Button>
                               </PopoverTrigger>
                               <PopoverContent className="w-auto p-0">
                                   <Calendar
                                       mode="single"
                                       selected={formData.receivedDate}
                                       onSelect={handleDateChange}
                                       initialFocus
                                   />
                               </PopoverContent>
                           </Popover>
                       </div>

                        {/* Status */}
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status *
                            </Label>
                            <Select
                                name="status"
                                value={formData.status}
                                onValueChange={(value) => handleSelectChange('status', value as MailPackageStatus)}
                                required
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(Object.keys(statusMap) as MailPackageStatus[]).map((statusKey) => (
                                         <SelectItem key={statusKey} value={statusKey}>
                                             {statusMap[statusKey].label}
                                         </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                         {/* Notes */}
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notes" className="text-right">
                                Notes
                            </Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleChange}
                                className="col-span-3"
                                placeholder="Optional notes (e.g., fragile, perishable)"
                            />
                        </div>

                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">
                            {initialData ? 'Save Changes' : 'Add Item'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default MailPackageDialog; 