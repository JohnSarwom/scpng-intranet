
export const MOCK_PROVISIONING_DATA = {
    'Unit_Tasks': [
        {
            Title: "Complete Q3 Financial Analysis",
            Description: "Review budget vs actuals for all departments.",
            Status: "in-progress",
            Priority: "high",
            DueDate: "2025-10-15T00:00:00Z",
            Unit: "Finance",
            Division: "Corporate Services",
            ProjectId: "PROJ-001",
            KraId: "KRA-001"
        },
        {
            Title: "Update Employee Handbook",
            Description: "Incorporate new remote work policies.",
            Status: "todo",
            Priority: "medium",
            DueDate: "2025-11-01T00:00:00Z",
            Unit: "HR",
            Division: "Corporate Services",
            ProjectId: "PROJ-002",
            KraId: "KRA-002"
        },
        {
            Title: "Server Migration - Phase 1",
            Description: "Migrate legacy database to cloud.",
            Status: "todo",
            Priority: "urgent",
            DueDate: "2025-09-30T00:00:00Z",
            Unit: "IT Support",
            Division: "Technology",
            ProjectId: "PROJ-003",
            KraId: "KRA-003"
        }
    ],
    'Unit_Projects': [
        {
            Title: "Financial Systems Upgrade", // PROJ-001
            Description: "Modernizing the accounting software.",
            Status: "in-progress",
            StartDate: "2025-01-01T00:00:00Z",
            EndDate: "2025-12-31T00:00:00Z",
            Budget: 50000,
            Progress: 45,
            Unit: "Finance",
            Division: "Corporate Services"
        },
         {
            Title: "HR Policy Renewal", // PROJ-002
            Description: "Annual review of all HR policies.",
            Status: "planned",
            StartDate: "2025-10-01T00:00:00Z",
            EndDate: "2025-11-30T00:00:00Z",
            Budget: 5000,
            Progress: 0,
            Unit: "HR",
            Division: "Corporate Services"
        },
        {
            Title: "Cloud Infrastructure Migration", // PROJ-003
            Description: "Moving on-premise servers to Azure.",
            Status: "planned",
            StartDate: "2025-09-01T00:00:00Z",
            EndDate: "2026-03-31T00:00:00Z",
            Budget: 120000,
            Progress: 10,
            Unit: "IT Support",
            Division: "Technology"
        }
    ],
    'Unit_Risks': [
        {
            Title: "Budget Overrun",
            Description: "Licensing costs may exceed estimates.",
            Status: "analyzing",
            Impact: "high",
            Likelihood: "medium",
            MitigationPlan: "Negotiate volume discounts.",
            Unit: "IT Support",
            Division: "Technology"
        }
    ],
    'Unit_KRAs': [
        {
            Title: "Ensure Financial Compliance", // KRA-001
            Description: "Maintain 100% compliance with audit standards.",
            Status: "on-track",
            Department: "Finance",
            Division: "Corporate Services",
            ObjectiveId: "ORG-GOAL-01"
        },
         {
            Title: "Improve Employee Retention", // KRA-002
            Description: "Reduce turnover by 5%.",
            Status: "at-risk",
            Department: "HR",
            Division: "Corporate Services",
            ObjectiveId: "ORG-GOAL-02"
        },
        {
            Title: "Maintain 99.9% Uptime", // KRA-003
            Description: "Ensure critical systems are always available.",
            Status: "on-track",
            Department: "IT Support",
            Division: "Technology",
            ObjectiveId: "ORG-GOAL-03"
        }
    ],
    'Unit_KPIs': [
        {
            Title: "Audit Score",
            Target: 100,
            Actual: 98,
            Status: "on-track",
            KraId: "KRA-001", // Title-based matching hard in mock without IDs, but good for demo
            Unit: "Finance",
            Division: "Corporate Services"
        },
        {
            Title: "Turnover Rate",
            Target: 10,
            Actual: 12, // Lower is better usually, but simplified
            Status: "at-risk",
            KraId: "KRA-002",
            Unit: "HR",
            Division: "Corporate Services"
        }
    ]
};
