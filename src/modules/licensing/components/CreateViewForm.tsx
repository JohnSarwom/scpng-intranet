import React, { ChangeEvent } from 'react';
import { FormData } from '../types';
import { LicenseTypeData } from '../constants';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { MoreVertical, Save, Printer, FileText, FileImage } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CreateViewFormProps {
  formData: FormData;
  selectedLicenseType: LicenseTypeData;
  licenseOptions: LicenseTypeData[];
  onFormInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onDateChange: (fieldName: keyof FormData, date: Date | undefined) => void;
  onPrint: () => void;
  onDownloadPdf: () => void;
  onDownloadJpeg: () => void;
  onSaveToDatabase: () => void;
}

const CreateViewForm: React.FC<CreateViewFormProps> = ({
  formData,
  selectedLicenseType,
  licenseOptions,
  onFormInputChange,
  onDateChange,
  onPrint,
  onDownloadPdf,
  onDownloadJpeg,
  onSaveToDatabase,
}) => {
  const parseDate = (dateStr: string | undefined): Date | undefined => {
    if (!dateStr || dateStr === "DD/MM/YYYY") return undefined;
    const partsDMY = dateStr.split('/');
    if (partsDMY.length === 3) {
      const day = parseInt(partsDMY[0], 10);
      const month = parseInt(partsDMY[1], 10) - 1;
      const year = parseInt(partsDMY[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const d = new Date(year, month, day);
        if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
          return d;
        }
      }
    }
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

  return (
    <div className="w-full flex flex-col bg-white p-6 md:p-8 rounded-lg shadow-xl no-print h-full">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-arial flex-grow">Capital Market License Generator</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="More actions" className="ml-auto">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onPrint}>
              <Printer className="mr-2 h-4 w-4" />
              <span>Print License</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownloadPdf}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Download PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownloadJpeg}>
              <FileImage className="mr-2 h-4 w-4" />
              <span>Download JPEG</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-col gap-y-4 flex-grow">
        <div>
          <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700 mb-1">License Type:</label>
          <select
            id="licenseType"
            name="licenseType"
            value={selectedLicenseType.id}
            onChange={onFormInputChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {licenseOptions.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-row gap-x-4">
          <div className="flex-1">
            <label htmlFor="formIssuedDate" className="block text-sm font-medium text-gray-700 mb-1">Issued Date:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.issuedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.issuedDate && formData.issuedDate !== "DD/MM/YYYY" ? format(parseDate(formData.issuedDate) || new Date(), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={parseDate(formData.issuedDate)}
                  onSelect={(date) => onDateChange('issuedDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex-1">
            <label htmlFor="formExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.expiryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expiryDate && formData.expiryDate !== "DD/MM/YYYY" ? format(parseDate(formData.expiryDate) || new Date(), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={parseDate(formData.expiryDate)}
                  onSelect={(date) => onDateChange('expiryDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div>
          <label htmlFor="formLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">License Number (CML...):</label>
          <input type="text" id="formLicenseNumber" name="formLicenseNumber" value={formData.licenseNumber} onChange={onFormInputChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="formLicenseeName" className="block text-sm font-medium text-gray-700 mb-1">Licensee Name (Granted to):</label>
          <input type="text" id="formLicenseeName" name="formLicenseeName" value={formData.licenseeName} onChange={onFormInputChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>
      <div className="flex justify-end mt-auto pt-4">
        <Button 
          onClick={onSaveToDatabase} 
          className="bg-intranet-primary hover:bg-intranet-primary/90 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-intranet-primary focus:ring-offset-2 font-arial"
        >
          <Save className="mr-2 h-4 w-4" />
          Save License
        </Button>
      </div>
    </div>
  );
};

export default CreateViewForm; 