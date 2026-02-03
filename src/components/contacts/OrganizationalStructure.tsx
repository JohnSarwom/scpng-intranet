
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus, ZoomIn, ZoomOut, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Mock data for the organizational structure
const orgChartData = {
  id: 'ceo',
  name: 'John Anderson',
  position: 'CEO',
  department: 'Executive',
  email: 'john.anderson@scpng.com',
  phone: '+61 3 9876 5432',
  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=JA&backgroundColor=600018`,
  children: [
    {
      id: 'cto',
      name: 'Sarah Johnson',
      position: 'CTO',
      department: 'IT',
      email: 'sarah.johnson@scpng.com',
      phone: '+61 2 8765 4321',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=SJ&backgroundColor=600018`,
      children: [
        {
          id: 'it-manager',
          name: 'Robert Brown',
          position: 'IT Manager',
          department: 'IT',
          email: 'robert.brown@scpng.com',
          phone: '+61 2 3210 9876',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=RB&backgroundColor=600018`,
          children: []
        }
      ]
    },
    {
      id: 'finance-director',
      name: 'Michael Chen',
      position: 'Finance Director',
      department: 'Finance',
      email: 'michael.chen@scpng.com',
      phone: '+61 4 7654 3210',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=MC&backgroundColor=600018`,
      children: [
        {
          id: 'financial-analyst',
          name: 'Jessica Lee',
          position: 'Financial Analyst',
          department: 'Finance',
          email: 'jessica.lee@scpng.com',
          phone: '+61 3 2109 8765',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=JL&backgroundColor=600018`,
          children: []
        }
      ]
    },
    {
      id: 'hr-director',
      name: 'David Thompson',
      position: 'HR Director',
      department: 'HR',
      email: 'david.thompson@scpng.com',
      phone: '+61 7 5432 1098',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=DT&backgroundColor=600018`,
      children: []
    },
    {
      id: 'marketing-manager',
      name: 'Emily Wilson',
      position: 'Marketing Manager',
      department: 'Marketing',
      email: 'emily.wilson@scpng.com',
      phone: '+61 8 6543 2109',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=EW&backgroundColor=600018`,
      children: []
    },
    {
      id: 'operations-manager',
      name: 'Lisa Wang',
      position: 'Operations Manager',
      department: 'Operations',
      email: 'lisa.wang@scpng.com',
      phone: '+61 8 4321 0987',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=LW&backgroundColor=600018`,
      children: []
    }
  ]
};

interface OrgNode {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  avatar: string;
  children: OrgNode[];
}

interface OrgNodeCardProps {
  node: OrgNode;
  onClick: (node: OrgNode) => void;
}

const OrgNodeCard: React.FC<OrgNodeCardProps> = ({ node, onClick }) => {
  return (
    <div 
      className="min-w-[180px] p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(node)}
    >
      <div className="flex flex-col items-center">
        <img
          src={node.avatar}
          alt={node.name}
          className="w-16 h-16 rounded-full mb-2"
        />
        <h4 className="font-medium text-sm">{node.name}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">{node.position}</p>
        <span className="inline-block px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full mt-1">
          {node.department}
        </span>
      </div>
    </div>
  );
};

interface NodeChildrenProps {
  nodes: OrgNode[];
  onNodeClick: (node: OrgNode) => void;
}

const NodeChildren: React.FC<NodeChildrenProps> = ({ nodes, onNodeClick }) => {
  if (nodes.length === 0) return null;
  
  return (
    <div className="pt-6 mt-3 flex flex-col items-center">
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>
      <div className="relative flex flex-row justify-center gap-8">
        {nodes.length > 0 && (
          <div className="absolute top-0 left-0 right-0 h-px bg-gray-300 dark:bg-gray-700 transform -translate-y-3"></div>
        )}
        {nodes.map(node => (
          <div key={node.id} className="flex flex-col items-center">
            <OrgNodeCard node={node} onClick={onNodeClick} />
            <NodeChildren nodes={node.children} onNodeClick={onNodeClick} />
          </div>
        ))}
      </div>
    </div>
  );
};

interface OrgChartProps {
  data: OrgNode;
  onNodeClick: (node: OrgNode) => void;
}

const OrgChart: React.FC<OrgChartProps> = ({ data, onNodeClick }) => {
  return (
    <div className="flex flex-col items-center overflow-auto p-8">
      <OrgNodeCard node={data} onClick={onNodeClick} />
      <NodeChildren nodes={data.children} onNodeClick={onNodeClick} />
    </div>
  );
};

interface NodeDetailProps {
  node: OrgNode | null;
  onClose: () => void;
}

const NodeDetail: React.FC<NodeDetailProps> = ({ node, onClose }) => {
  if (!node) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-lg p-6 animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src={node.avatar}
            alt={node.name}
            className="w-24 h-24 rounded-full border-4 border-background shadow-md"
          />
          
          <div>
            <h2 className="text-xl font-bold">{node.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{node.position}</p>
            <div className="mt-1">
              <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                {node.department}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-row items-center">
              <span className="text-sm font-medium mr-2">Email:</span>
              <span className="text-sm">{node.email}</span>
            </div>
            <div className="flex flex-row items-center">
              <span className="text-sm font-medium mr-2">Phone:</span>
              <span className="text-sm">{node.phone}</span>
            </div>
            <div className="flex flex-row items-center">
              <span className="text-sm font-medium mr-2">Location:</span>
              <span className="text-sm">MRDC House, Port Moresby</span>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button className="flex-1">View Full Profile</Button>
            <Button variant="outline" className="flex-1">Send Message</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrganizationalStructure: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [filter, setFilter] = useState<string | null>(null);
  const { businessUnits } = useAuth();
  
  const handleNodeClick = (node: OrgNode) => {
    setSelectedNode(node);
  };
  
  const handleZoomIn = () => {
    if (zoomLevel < 150) {
      setZoomLevel(zoomLevel + 10);
    }
  };
  
  const handleZoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(zoomLevel - 10);
    }
  };
  
  const handleFilterChange = (unitId: string | null) => {
    setFilter(unitId);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Organizational Structure</h2>
          <p className="text-gray-500 dark:text-gray-400">View the organization hierarchy</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="flex items-center border rounded-md p-1 bg-background">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
            >
              <ZoomOut size={18} />
            </Button>
            <span className="px-2 text-sm">{zoomLevel}%</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomIn}
              disabled={zoomLevel >= 150}
            >
              <ZoomIn size={18} />
            </Button>
          </div>
          
          <div className="flex items-center relative">
            <select 
              className="pl-8 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-background"
              onChange={(e) => handleFilterChange(e.target.value === "all" ? null : e.target.value)}
              value={filter || "all"}
            >
              <option value="all">All Departments</option>
              {businessUnits.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
            <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>
      
      <Card className="overflow-auto">
        <CardContent className="p-0">
          <div 
            className="overflow-auto border-t" 
            style={{ 
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              height: `${100 * (100 / zoomLevel)}%`,
              minHeight: '500px'
            }}
          >
            <OrgChart 
              data={orgChartData} 
              onNodeClick={handleNodeClick} 
            />
          </div>
        </CardContent>
      </Card>
      
      {selectedNode && (
        <NodeDetail 
          node={selectedNode}
          onClose={() => setSelectedNode(null)} 
        />
      )}
    </div>
  );
};

export default OrganizationalStructure;
