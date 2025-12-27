import React, { useState, useEffect } from 'react';
import { api } from '../api';

const KanbanBoard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    // Placeholder for DnD logic
    if (!result.destination) return;

    // Implement optimistic update here
    const { draggableId, destination } = result;
    // ... logic to update state locally ...

    // Call API
    try {
      await api.updateProjectStatus(draggableId, destination.droppableId);
    } catch (err) {
      console.error("Failed to update status", err);
      // Revert state if needed
    }
  };

  if (loading) return <div className="p-4 text-center">Loading Kanban...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="glass-panel p-6 h-full overflow-auto">
      <h2 className="text-2xl font-bold mb-4">Project Pipeline</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
         {/* Columns will go here. Simplified for now */}
         {['Backlog', 'In Progress', 'Review', 'Done'].map(status => (
           <div key={status} className="min-w-[300px] glass-panel bg-opacity-30 p-4">
             <h3 className="font-bold mb-3">{status}</h3>
             <div className="space-y-3">
               {projects
                 .filter(p => p.status === status.toLowerCase() || (status === 'Backlog' && !['in progress', 'review', 'done'].includes(p.status?.toLowerCase())))
                 .map(project => (
                   <div key={project.id} className="bg-white/80 p-3 rounded shadow cursor-move hover:shadow-md transition">
                     <div className="font-medium">{project.name}</div>
                     <div className="text-sm text-gray-500">Deadline: {project.deadline}</div>
                   </div>
                 ))}
             </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
