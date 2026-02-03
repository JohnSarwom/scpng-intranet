import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import Notes from "@/components/Notes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase, logger } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export default function NotesPage() {
  const { accounts, inProgress } = useMsal();
  const account = accounts[0];
  const loading = inProgress !== "none";

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!account) {
    logger.error('Notes Page: No MSAL account found after loading.');
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Error: MSAL account could not be loaded. Please try logging in again.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Notes</h1>

      <div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome, {account?.name || account?.username}</CardTitle>
            <CardDescription>
              Your notes are synced with Supabase.
            </CardDescription>
          </CardHeader>
        </Card>

        <Notes />
      </div>
    </div>
  );
} 