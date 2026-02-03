import { useState, useCallback, useEffect } from 'react';
import { Project } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export interface ProjectFilterState {
  status: string;
  manager: string;
  dateRange: string;
}

export function useProjectState(initialProjects: Project[] = []) {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(initialProjects);
  
  // Project filtering state
  const [projectFilters, setProjectFilters] = useState<ProjectFilterState>({
    status: 'all',
    manager: 'all',
    dateRange: 'all' // 'all', 'thisMonth', 'thisQuarter', 'thisYear'
  });
  
  // Modal states
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  
  // Apply project filters
  const applyProjectFilters = useCallback(() => {
    let filtered = [...projects];
    
    if (projectFilters.status !== 'all') {
      filtered = filtered.filter(project => project.status === projectFilters.status);
    }
    
    if (projectFilters.manager !== 'all') {
      filtered = filtered.filter(project => project.manager === projectFilters.manager);
    }
    
    if (projectFilters.dateRange !== 'all') {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      if (projectFilters.dateRange === 'thisMonth') {
        filtered = filtered.filter(project => {
          const startMonth = project.startDate.getMonth();
          const startYear = project.startDate.getFullYear();
          return startMonth === currentMonth && startYear === currentYear;
        });
      } else if (projectFilters.dateRange === 'thisQuarter') {
        const currentQuarter = Math.floor(currentMonth / 3);
        filtered = filtered.filter(project => {
          const startMonth = project.startDate.getMonth();
          const startYear = project.startDate.getFullYear();
          const startQuarter = Math.floor(startMonth / 3);
          return startQuarter === currentQuarter && startYear === currentYear;
        });
      } else if (projectFilters.dateRange === 'thisYear') {
        filtered = filtered.filter(project => {
          const startYear = project.startDate.getFullYear();
          return startYear === currentYear;
        });
      }
    }
    
    setFilteredProjects(filtered);
  }, [projects, projectFilters]);
  
  // Apply filters when projects or filters change
  useEffect(() => {
    applyProjectFilters();
  }, [projects, projectFilters, applyProjectFilters]);
  
  // Function to add a project
  const handleAddProject = (project: Project) => {
    setProjects([...projects, project]);
    toast({
      title: "Project Added",
      description: "The project has been successfully added."
    });
  };
  
  // Function to update a project
  const handleUpdateProject = (updatedProject: Project) => {
    const updatedProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    setProjects(updatedProjects);
    toast({
      title: "Project Updated",
      description: "The project has been successfully updated."
    });
  };
  
  // Function to delete a project
  const handleDeleteProject = () => {
    if (!deletingProject) return;
    
    const updatedProjects = projects.filter(p => p.id !== deletingProject.id);
    setProjects(updatedProjects);
    setDeletingProject(null);
    toast({
      title: "Project Deleted",
      description: "The project has been successfully deleted."
    });
  };
  
  // Reset filters function
  const resetProjectFilters = () => {
    setProjectFilters({
      status: 'all',
      manager: 'all',
      dateRange: 'all'
    });
  };
  
  return {
    projects,
    setProjects,
    filteredProjects,
    projectFilters,
    setProjectFilters,
    resetProjectFilters,
    applyProjectFilters,
    
    // Modal states
    showAddProjectModal,
    setShowAddProjectModal,
    showEditProjectModal,
    setShowEditProjectModal,
    editingProject,
    setEditingProject,
    showDeleteProjectModal,
    setShowDeleteProjectModal,
    deletingProject,
    setDeletingProject,
    
    // Handler functions
    handleAddProject,
    handleUpdateProject,
    handleDeleteProject
  };
} 