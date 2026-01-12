import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function GigDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidForm, setBidForm] = useState({ message: '', price: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const gigRes = await axios.get(`${API_URL}/gigs/${id}`, { withCredentials: true });
        setGig(gigRes.data);

        if (gigRes.data.ownerId._id === user.id) {
          const bidsRes = await axios.get(`${API_URL}/bids/${id}`, { withCredentials: true });
          setBids(bidsRes.data);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [id, user?.id]);

  const handleBid = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await axios.post(`${API_URL}/bids`, { ...bidForm, gigId: id }, { withCredentials: true });
      alert('Bid placed successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to place bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHire = async (bidId) => {
    if(!window.confirm("Are you sure? This will hire this freelancer and reject all other bids.")) return;
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await axios.patch(`${API_URL}/bids/${bidId}/hire`, {}, { withCredentials: true });
      alert('Freelancer Hired Successfully!');
      window.location.reload(); 
    } catch (err) {
      alert(err.response?.data?.error || 'Hiring failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!gig) return <div className="p-8 text-center">Gig not found or you need to login.</div>;

  const isOwner = user && gig.ownerId._id === user.id;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen bg-gray-50">
      <button 
        onClick={() => navigate('/dashboard')} 
        className="mb-6 text-gray-500 hover:text-black font-semibold flex items-center gap-2 transition-colors"
      >
        <span>←</span> Back to Dashboard
      </button>
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{gig.title}</h1>
          <span className={`self-start px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase ${
            gig.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {gig.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 mb-6 items-center text-sm text-gray-600">
           <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-lg">
             <span className="font-semibold text-gray-900">Budget:</span> ${gig.budget}
           </div>
           <div className="flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
             Posted by {gig.ownerId.name}
           </div>
           <div className="flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
             {new Date(gig.createdAt).toLocaleDateString()}
           </div>
        </div>

        <div className="prose max-w-none text-gray-700 leading-relaxed border-t pt-6">
          {gig.description}
        </div>
      </div>

      {isOwner ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Received Bids</h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
              {bids.length} Applicants
            </span>
          </div>

          {bids.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 italic">No bids received yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {bids.map(bid => (
                <div key={bid._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all">
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-lg text-gray-900">{bid.freelancerId.name}</p>
                      <p className="text-blue-600 font-bold">${bid.price}</p>
                    </div>
                    <p className="text-gray-600 italic bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                      "{bid.message}"
                    </p>
                  </div>
                  
                  <div className="w-full md:w-auto flex flex-row md:flex-col justify-between items-center gap-3 min-w-[140px]">
                     <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                       bid.status === 'hired' ? 'bg-green-100 text-green-700 border border-green-200' : 
                       bid.status === 'rejected' ? 'bg-red-50 text-red-400 border border-red-100' : 
                       'bg-yellow-50 text-yellow-700 border border-yellow-200'
                     }`}>
                       {bid.status}
                     </span>

                     {gig.status === 'open' && bid.status === 'pending' && (
                       <button 
                         onClick={() => handleHire(bid._id)} 
                         disabled={isSubmitting}
                         // RESPONSIVE FIX: w-full on mobile for easier tapping
                         className={`w-full md:w-auto text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm ${
                           isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800 hover:shadow'
                         }`}
                       >
                         {isSubmitting ? 'Processing...' : 'Hire Now'}
                       </button>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        gig.status === 'open' ? (
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border-t-4 border-green-500 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Submit Your Proposal</h2>
            <form onSubmit={handleBid} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Cover Letter</label>
                <textarea 
                  className="w-full border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" 
                  rows="4"
                  placeholder="Explain why you are the best fit for this project..." 
                  onChange={e => setBidForm({...bidForm, message: e.target.value})} 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Your Bid Price ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 font-bold">$</span>
                  <input 
                    className="w-full border border-gray-300 p-3 pl-8 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" 
                    type="number" 
                    placeholder="e.g. 500" 
                    min="1"
                    onChange={e => setBidForm({...bidForm, price: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full text-white text-lg px-6 py-3.5 rounded-lg font-bold transition-all shadow-md ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? 'Submitting Proposal...' : 'Submit Proposal'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gray-100 p-8 md:p-12 rounded-xl text-center border-2 border-gray-200 border-dashed">
            <div className="text-4xl mb-4">⛔</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">This job is closed</h2>
            <p className="text-gray-500">The client has already hired a freelancer for this project.</p>
          </div>
        )
      )}
    </div>
  );
}