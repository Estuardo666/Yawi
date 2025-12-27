import React, { useState, useEffect } from 'react';
import { api } from '../api';

const KanbanBoard = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', client_id: '', deadline: '', budget: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsData, clientsData] = await Promise.all([
          api.getProjects(),
          api.getClients()
      ]);
      setProjects(projectsData || []);
      setClients(clientsData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          await api.createProject(formData);
          setShowModal(false);
          setFormData({ name: '', client_id: '', deadline: '', budget: '' });
          loadData();
      } catch (err) {
          alert("Error creating project: " + err.message);
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
    <div className="glass-panel p-6 h-full overflow-hidden flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Project Pipeline</h2>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            + New Project
          </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
         {['Backlog', 'In Progress', 'Review', 'Done'].map(status => (
           <div key={status} className="min-w-[300px] w-[300px] glass-panel bg-opacity-30 p-4 flex flex-col">
             <h3 className="font-bold mb-3">{status}</h3>
             <div className="space-y-3 overflow-y-auto flex-1 pr-2">
               {projects
                 .filter(p => p.status === status.toLowerCase() || (status === 'Backlog' && !['in progress', 'review', 'done'].includes(p.status?.toLowerCase())))
                 .map(project => (
                   <div key={project.id} className="bg-white/80 p-3 rounded shadow cursor-move hover:shadow-md transition">
                     <div className="font-medium text-gray-900">{project.name}</div>
                     <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                         <span>{project.client_name || 'Unknown Client'}</span>
                         <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No Date'}</span>
                     </div>
                   </div>
                 ))}
             </div>
           </div>
         ))}
      </div>

      {showModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="glass-panel p-8 w-full max-w-lg bg-white">
                  <h3 className="text-xl font-bold mb-6">Create New Project</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium mb-1">Project Name</label>
                          <input
                            type="text"
                            required
                            className="w-full p-2 border rounded"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Client</label>
                          <select
                            required
                            className="w-full p-2 border rounded"
                            value={formData.client_id}
                            onChange={e => setFormData({...formData, client_id: e.target.value})}
                          >
                              <option value="">Select Client...</option>
                              {clients.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                          </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium mb-1">Deadline</label>
                              <input
                                type="date"
                                className="w-full p-2 border rounded"
                                value={formData.deadline}
                                onChange={e => setFormData({...formData, deadline: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium mb-1">Budget ($)</label>
                              <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={formData.budget}
                                onChange={e => setFormData({...formData, budget: e.target.value})}
                              />
                          </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                          <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn bg-gray-200 hover:bg-gray-300">Cancel</button>
                          <button type="submit" className="flex-1 btn btn-primary">Create Project</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default KanbanBoard;
