import React from 'react';
import { MainView } from '../types';
import { LayoutDashboard, PlusCircle, ListOrdered, Settings, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';

interface LicensingHeaderProps {
  activeMainView: MainView;
  setActiveMainView: (view: MainView) => void;
  onPrint?: () => Promise<void>;
  onDownloadPdf?: () => Promise<void>;
  onDownloadJpeg?: () => Promise<void>;
  onSaveToDatabase?: () => Promise<void>;
  isCreateView?: boolean;
}

const mainViewOptions: { id: MainView; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'create', label: 'Create', icon: PlusCircle },
  { id: 'registry', label: 'Registry', icon: ListOrdered },
];

const LicensingHeader: React.FC<LicensingHeaderProps> = ({ activeMainView, setActiveMainView }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md no-print w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <TooltipWrapper content="Go back">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)} 
                className="text-muted-foreground hover:text-foreground mr-2"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </TooltipWrapper>
            <img src="/images/SCPNG Original Logo.png" alt="SCPNG Logo" className="h-10 w-auto mr-2" />
            <span className="font-bold text-xl text-gray-800">Capital Market License Registry</span>
          </div>
          <nav className="top-tabs">
            <ul className="flex space-x-2">
              {mainViewOptions.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => { e.preventDefault(); setActiveMainView(item.id); }}
                    className={activeMainView === item.id ? 'active' : ''}
                  >
                    <item.icon size={18} className="mr-2" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default LicensingHeader; 