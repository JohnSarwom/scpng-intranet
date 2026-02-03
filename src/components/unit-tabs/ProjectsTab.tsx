import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AddProjectModal from './modals/AddProjectModal';
import EditProjectModal from './modals/EditProjectModal';
import DeleteModal from './modals/DeleteModal';
import { Project, Risk, Task } from '@/types';
import { StaffMember } from '@/types/staff';
import { Objective } from '@/types/kpi';

interface ProjectsTabProps {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'risks' | 'tasks'>) => void;
  editProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  error?: Error | null;
  onRetry?: () => void;
  staffMembers: StaffMember[];
  objectives?: Objective[];
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({ 
  projects, 
  addProject, 
  editProject, 
  deleteProject, 
  staffMembers,
  objectives
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    status: 'planned',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    manager: '',
    budget: 0,
    budgetSpent: 0,
    progress: 1
  });

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleOpenAddModal = () => {
    setNewProject({
      name: '',
      description: '',
      status: 'planned',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      manager: '',
      budget: 0,
      budgetSpent: 0,
      progress: 1
    });
    setShowAddModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planned':
        return <Badge className="bg-blue-100 text-blue-800">Planned</Badge>;
      case 'in-progress':
        return <Badge className="bg-amber-100 text-amber-800">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'on-hold':
        return <Badge className="bg-red-100 text-red-800">On Hold</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) {
      amount = 0;
    }
    return new Intl.NumberFormat('en-PG', {
      style: 'currency',
      currency: 'PGK',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (date instanceof Date) {
      return new Date(date).toLocaleDateString();
    } else if (typeof date === 'string') {
      return date;
    } else {
      return '';
    }
  };

  const getManagerName = (email: string) => {
    if (!staffMembers) return email;
    const staff = staffMembers.find(s => s.email === email);
    return staff ? staff.name : email;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Projects</CardTitle>
          <Button variant="outline" onClick={handleOpenAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No projects found. Create your first project by clicking "Add Project".
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>{getManagerName(project.manager)}</TableCell>
                    <TableCell>
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(project.budgetSpent)} / {formatCurrency(project.budget)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} className="h-2 w-full" />
                        <span className="text-xs font-medium">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(project)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      {showAddModal && (
        <AddProjectModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          project={newProject}
          onProjectChange={setNewProject}
          onAddProject={(project) => {
            addProject(project);
            setShowAddModal(false);
          }}
          staffMembers={staffMembers}
          // objectives={objectives} // Pass if needed
        />
      )}
      
      {showEditModal && selectedProject && (
        <EditProjectModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          project={selectedProject}
          onProjectChange={(updatedProject) => setSelectedProject(updatedProject)}
          onSave={(updatedProject) => {
            editProject(selectedProject.id, updatedProject);
          }}
          staffMembers={staffMembers}
          // objectives={objectives} // Pass if needed
        />
      )}
      
      {showDeleteModal && selectedProject && (
        <DeleteModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          title="Delete Project"
          description={`Are you sure you want to delete the project "${selectedProject.name}"? This action cannot be undone.`}
          onDelete={() => {
            deleteProject(selectedProject.id);
            setShowDeleteModal(false);
          }}
        />
      )}
    </>
  );
}; 