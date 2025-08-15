// File: src/pages/admin/rgs.tsx

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function RGSAdminPage() {
  const [rules, setRules] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
  });
  const [error, setError] = useState('');

  const fetchRules = async () => {
    try {
      const res = await axios.get('/api/rgs/list');
      setRules(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch rules. Please check if /api/rgs/list is available.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/rgs/add', formData);
      setFormData({ title: '', description: '', type: '' });
      fetchRules();
    } catch (err) {
      setError('Failed to add rule. Check if /api/rgs/add is working.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/rgs/delete?id=${id}`);
      fetchRules();
    } catch (err) {
      setError('Failed to delete rule. Check if /api/rgs/delete is working.');
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Rule Governance System (RGS)</h1>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          type="text"
          name="type"
          placeholder="Type (e.g. Bonus, RTP)"
          value={formData.type}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="border p-2 w-full"
        ></textarea>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Rule
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Existing Rules</h2>
        <ul className="space-y-2">
          {rules.map((rule) => (
            <li key={rule._id} className="border p-4 rounded flex justify-between items-start">
              <div>
                <p className="font-bold">{rule.title} ({rule.type})</p>
                <p className="text-sm text-gray-600">{rule.description}</p>
              </div>
              <button
                onClick={() => handleDelete(rule._id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
