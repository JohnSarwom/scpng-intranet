/**
 * Payments Page
 * Main entry point for the Payments management system
 */

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { usePaymentsSharePoint } from '@/hooks/usePaymentsSharePoint';
import { useAssetsSharePoint } from '@/hooks/useAssetsSharePoint';
import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddPaymentModal from '@/components/payments/AddPaymentModal';
import PaymentRecords from '@/components/payments/PaymentRecords';
import type { PaymentFormData } from '@/types/payment.types';

const PaymentsPage = () => {
  const { hasPermission } = useRoleBasedAuth();
  const { payments, loading, error, add } = usePaymentsSharePoint();
  const { assets: allAssets, loading: loadingAssets } = useAssetsSharePoint();
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddPayment = async (paymentData: Partial<PaymentFormData>) => {
    await add(paymentData);
    setShowAddModal(false);
  };

  return (
    <PageLayout title="Invoices">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices & Receipts</h1>
            <p className="text-gray-600 mt-1">
              Upload and manage scanned invoices and payment receipts
            </p>
          </div>
          {hasPermission('payments', 'write') && (
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Invoice
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Invoices</TabsTrigger>
            <TabsTrigger value="records">Records & Details</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-600">Loading payments...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Error loading payments</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && payments.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No invoices uploaded yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload your first scanned invoice or payment receipt to get started.
                </p>
                {hasPermission('payments', 'write') && (
                  <Button onClick={() => setShowAddModal(true)} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Invoice
                  </Button>
                )}
              </div>
            )}

            {/* Invoices List */}
            {!loading && !error && payments.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">
                    {payments.length} Invoice{payments.length !== 1 ? 's' : ''} / Receipt{payments.length !== 1 ? 's' : ''}
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {payment.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>{payment.payee_name}</span>
                            {payment.invoice_number && (
                              <>
                                <span>•</span>
                                <span>Invoice: {payment.invoice_number}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>
                              {new Date(payment.payment_date).toLocaleDateString()}
                            </span>
                            {payment.related_asset_name && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600">🔗 {payment.related_asset_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {payment.currency} {payment.amount.toLocaleString()}
                          </div>
                          {payment.invoice_url && (
                            <a
                              href={payment.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                            >
                              📄 View Document
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-600">Loading payment records...</span>
              </div>
            ) : (
              <PaymentRecords
                payments={payments}
                onAddPayment={() => setShowAddModal(true)}
              />
            )}
          </TabsContent>

        </Tabs>

        {/* Add Payment Modal */}
        <AddPaymentModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddPayment}
          assets={allAssets.map(asset => ({
            id: asset.id,
            name: asset.name,
            asset_id: asset.asset_id
          }))}
        />
      </div>
    </PageLayout>
  );
};

export default PaymentsPage;
