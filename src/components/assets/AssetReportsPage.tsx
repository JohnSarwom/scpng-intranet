
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function AssetReportsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-2 mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="text-muted-foreground hover:text-foreground" 
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Reports</h1>
      </div>

      {/* Report content */}
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Report builder and generated reports go here...
        </p>
        
        {/* This is where we would add the report builder interface */}
        <div className="bg-card rounded-lg border p-8 h-96 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Report Builder</h3>
            <p className="text-muted-foreground">
              No reports have been created yet. Use the report builder to create your first report.
            </p>
            <Button className="mt-4">Create Report</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
