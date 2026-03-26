import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSentRequests } from '../api/requests.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Spinner from '../components/Spinner.jsx';

export default function MenteeDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSentRequests()
      .then(({ data }) => setRequests(data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Requests</h1>
      <p className="text-gray-500 text-sm mb-8">Track the status of your mentorship requests.</p>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
          <p className="text-gray-500">You haven't sent any mentorship requests yet.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-indigo-600 hover:underline text-sm"
          >
            Find a mentor →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const mentor = req.mentorId; // populated: { name, title, photoUrl }
            const initials = mentor?.name
              ? mentor.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
              : '?';

            return (
              <div
                key={req._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-4"
              >
                {/* Mentor avatar */}
                {mentor?.photoUrl ? (
                  <img
                    src={mentor.photoUrl}
                    alt={mentor.name}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {initials}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-gray-900">{mentor?.name ?? 'Unknown mentor'}</p>
                      {mentor?.title && (
                        <p className="text-xs text-gray-500">{mentor.title}</p>
                      )}
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-sm text-gray-700 mt-1.5">
                    <span className="font-medium">Goal:</span> {req.goal}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Sent {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
