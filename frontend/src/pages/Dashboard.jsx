import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

export default function Dashboard() {
  const { user, logout } = useAuth(); 
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newGig, setNewGig] = useState({ title: '', description: '', budget: '' });
  
  const [notification, setNotification] = useState(null);
  const socket = useRef();

  useEffect(() => {
    if (user) {
      socket.current = io(SOCKET_URL);
      
      socket.current.emit('add-user', user.id);

      socket.current.on('notification', (data) => {
        setNotification(data.message);
        setTimeout(() => setNotification(null), 6000);
      });
    }

    return () => socket.current?.disconnect();
  }, [user]);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_URL}/gigs?search=${search}`, { withCredentials: true });
        setGigs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => fetchGigs(), 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await axios.post(`${API_URL}/gigs`, newGig, { withCredentials: true });
      setShowPostForm(false);
      setNewGig({ title: '', description: '', budget: '' });
      
      const res = await axios.get(`${API_URL}/gigs?search=${search}`, { withCredentials: true });
      setGigs(res.data);
    } catch (err) {
      alert('Failed to post gig');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto relative min-h-screen">
      
      {notification && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-green-600 text-white p-4 rounded-lg shadow-2xl z-50 animate-bounce flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h4 className="font-bold text-sm">Great News!</h4>
              <p className="text-sm">{notification}</p>
            </div>
          </div>
          <button onClick={() => setNotification(null)} className="text-white hover:text-gray-200 font-bold px-2">✕</button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">GigFlow Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Welcome back, {user?.name}</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-2">
          <button 
            onClick={() => setShowPostForm(!showPostForm)} 
            className="flex-1 md:flex-none bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm md:text-base whitespace-nowrap"
          >
            {showPostForm ? 'Cancel' : '+ Post Job'}
          </button>
          <button 
            onClick={logout} 
            className="flex-none text-red-600 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200 transition-all text-sm md:text-base"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search active gigs..." 
            className="w-full p-4 pl-12 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-4 top-4 text-gray-400">🔍</span>
        </div>
      </div>

      {showPostForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100 animate-fade-in">
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Create New Gig</h2>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="e.g. React Frontend Developer" 
                  value={newGig.title}
                  onChange={e => setNewGig({...newGig, title: e.target.value})} 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                <input 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  type="number" 
                  min="1"
                  placeholder="500" 
                  value={newGig.budget}
                  onChange={e => setNewGig({...newGig, budget: e.target.value})} 
                  required 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none" 
                  placeholder="Project details..." 
                  value={newGig.description}
                  onChange={e => setNewGig({...newGig, description: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md'
              }`}
            >
              {isSubmitting ? 'Posting...' : 'Publish Gig'}
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">No gigs found.</p>
              {search && <button onClick={() => setSearch('')} className="text-blue-600 mt-2 underline">Clear Search</button>}
            </div>
          ) : (
            gigs.map(gig => (
              <div key={gig._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={gig.title}>{gig.title}</h3>
                    <span className={`bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase shrink-0 ml-2 ${gig.status === 'assigned' ? 'bg-red-100 text-red-700' : ''}`}>
                      {gig.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">by {gig.ownerId?.name || 'Anonymous'}</p>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{gig.description}</p>
                </div>
                
                <div className="flex items-center justify-between border-t pt-4 mt-auto">
                  <span className="text-xl font-bold text-gray-900">${gig.budget}</span>
                  <Link 
                    to={`/gigs/${gig._id}`} 
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-semibold transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}