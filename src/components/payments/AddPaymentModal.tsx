/**
 * Add Invoice/Receipt Modal
 * Simplified form for uploading scanned invoices and payment receipts
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Loader2, Upload, FileCheck, X } from 'lucide-react';
import type { PaymentFormData } from '@/types/payment.types';
import {
  PAYMENT_CATEGORIES,
  CURRENCIES,
} from '@/constants/paymentConstants';

interface AddPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payment: Partial<PaymentFormData>) => Promise<void>;
  assets?: Array<{ id: string; name: string; asset_id?: string }>;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  open,
  onClose,
  onSubmit,
  assets = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<PaymentFormData>>({
    title: '',
    amount: 0,
    currency: 'USD',
    payee_name: '',
    payment_category: 'Other',
    payment_date: new Date().toISOString().split('T')[0],
    invoice_number: '',
    related_asset_id: '',
    related_asset_name: '',
    description: '',
    payment_status: 'Paid', // Since we're uploading receipts, these are already paid
  });

  const handleChange = (field: keyof PaymentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Auto-fill title with filename if title is empty
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        setFormData(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  const handleAssetSelect = (assetId: string) => {
    const selectedAsset = assets.find(a => a.id === assetId);
    if (selectedAsset) {
      setFormData(prev => ({
        ...prev,
        related_asset_id: assetId,
        related_asset_name: selectedAsset.name,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedFile) {
      alert('Please upload an invoice or receipt file');
      return;
    }

    setLoading(true);

    try {
      // Include the file in the form data
      const dataToSubmit = {
        ...formData,
        invoice_file: uploadedFile,
      };

      await onSubmit(dataToSubmit);

      // Reset form
      setFormData({
        title: '',
        amount: 0,
        currency: 'USD',
        payee_name: '',
        payment_category: 'Other',
        payment_date: new Date().toISOString().split('T')[0],
        invoice_number: '',
        related_asset_id: '',
        related_asset_name: '',
        description: '',
        payment_status: 'Paid',
      });
      setUploadedFile(null);
      onClose();
    } catch (error) {
      console.error('Error submitting invoice/receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Invoice/Receipt</DialogTitle>
          <DialogDescription>
            Upload a scanned invoice or payment receipt and add basic information to link it to an asset.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Upload - Primary Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Upload Document <span className="text-red-500">*</span>
            </h3>

            <div className="mt-2">
              {!uploadedFile ? (
                <label
                  htmlFor="invoice_file"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary/50 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 mb-3 text-primary" />
                    <p className="mb-2 text-base font-semibold text-gray-700">
                      Click to upload invoice or receipt
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF, PNG, JPG, or JPEG (MAX. 10MB)
                    </p>
                  </div>
                  <input
                    id="invoice_file"
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    required
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{uploadedFile.name}</p>
                      <p className="text-sm text-green-700">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedFile(null)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">
                  Title/Description <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Dell Laptop Invoice"
                  required
                />
              </div>

              <div>
                <Label htmlFor="payee_name">
                  Vendor/Payee <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="payee_name"
                  value={formData.payee_name}
                  onChange={(e) => handleChange('payee_name', e.target.value)}
                  placeholder="e.g., Dell Technologies"
                  required
                />
              </div>

              <div>
                <Label htmlFor="invoice_number">Invoice/Receipt Number</Label>
                <Input
                  id="invoice_number"
                  value={formData.invoice_number || ''}
                  onChange={(e) => handleChange('invoice_number', e.target.value)}
                  placeholder="e.g., INV-2025-0001"
                />
              </div>

              <div>
                <Label htmlFor="amount">
                  Amount <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="currency">
                  Currency <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="payment_date">
                  Payment/Invoice Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => handleChange('payment_date', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="payment_category">
                  Category
                </Label>
                <Select
                  value={formData.payment_category}
                  onValueChange={(value) => handleChange('payment_category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Asset Linking */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Link to Asset (Optional)</h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="related_asset">Select Asset</Label>
                <Select
                  value={formData.related_asset_id || ''}
                  onValueChange={handleAssetSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (No asset linked)</SelectItem>
                    {assets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.asset_id ? `${asset.asset_id} - ` : ''}{asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Link this invoice/receipt to an asset purchase for tracking purposes
                </p>
              </div>

              {formData.related_asset_name && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Linked Asset:</strong> {formData.related_asset_name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Additional Notes</h3>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Add any additional notes or details about this invoice/receipt..."
                rows={3}
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !uploadedFile}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentModal;
