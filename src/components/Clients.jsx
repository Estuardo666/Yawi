import React, { useState, useEffect } from 'react';
import { api } from '../api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', logo_url: '' });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          await api.createClient(formData);
          setShowForm(false);
          setFormData({ name: '', email: '', logo_url: '' });
          loadClients(); // Reload list
      } catch (err) {
          alert("Error creating client: " + err.message);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Clients</h2>
        <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
        >
            {showForm ? 'Cancel' : 'Add Client'}
        </button>
      </div>

      {showForm && (
          <div className="glass-panel p-6 max-w-lg mx-auto animate-fade-in">
              <h3 className="text-lg font-bold mb-4">New Client</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium">Client Name</label>
                      <input
                        type="text"
                        required
                        className="w-full p-2 border rounded"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium">Contact Email</label>
                      <input
                        type="email"
                        required
                        className="w-full p-2 border rounded"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium">Logo URL</label>
                      <input
                        type="url"
                        className="w-full p-2 border rounded"
                        value={formData.logo_url}
                        onChange={e => setFormData({...formData, logo_url: e.target.value})}
                      />
                  </div>
                  <button type="submit" className="w-full btn btn-primary">Create Client</button>
              </form>
          </div>
      )}

      {loading ? (
          <div>Loading...</div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map(client => (
                  <div key={client.id} className="glass-panel p-6 flex flex-col items-center text-center">
                      {client.logo_url && (
                          <img src={client.logo_url} alt={client.name} className="w-16 h-16 rounded-full object-cover mb-3" />
                      )}
                      <h3 className="font-bold text-lg">{client.name}</h3>
                      <p className="text-gray-500 text-sm">{client.contact_email}</p>
                  </div>
              ))}
              {clients.length === 0 && <p className="col-span-3 text-center text-gray-500">No clients found.</p>}
          </div>
      )}
    </div>
  );
};

export default Clients;
