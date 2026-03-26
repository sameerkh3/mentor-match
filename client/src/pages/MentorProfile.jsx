import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMentorById } from '../api/mentors.js';
import { useAuth } from '../context/AuthContext.jsx';
import RequestModal from '../components/RequestModal.jsx';
import Spinner from '../components/Spinner.jsx';

function SkillTag({ skill }) {
  return (
    <span className="bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full">
      {skill}
    </span>
  );
}

function StarRating({ avg, count }) {
  if (!count) return <span className="text-gray-400">No ratings yet</span>;
  const rounded = Math.round(avg * 10) / 10;
  return (
    <span className="text-yellow-500 font-medium">
      {'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))}
      <span className="text-gray-600 text-sm ml-1">{rounded} ({count} ratings)</span>
    </span>
  );
}

export default function MentorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getMentorById(id)
      .then(({ data }) => setMentor(data))
      .catch(() => setError('Mentor not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center text-gray-500">
        <p>{error || 'Mentor not found.'}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 hover:underline text-sm">
          Back to search
        </button>
      </div>
    );
  }

  const {
    name, title, department, bio, skills = [],
    yearsOfExperience, availability, photoUrl,
    ratingsTotal = 0, ratingsCount = 0,
  } = mentor;

  const avg = ratingsCount > 0 ? ratingsTotal / ratingsCount : 0;
  const initials = name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-indigo-600 hover:underline mb-6 flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        {/* Profile header */}
        <div className="flex items-start gap-5 mb-6">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="w-20 h-20 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-semibold flex-shrink-0">
              {initials}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            {title && <p className="text-gray-600">{title}</p>}
            {department && <p className="text-sm text-gray-500">{department}</p>}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-6 border-t border-b border-gray-100 py-4 mb-6 text-sm">
          {yearsOfExperience !== undefined && (
            <div>
              <span className="font-medium text-gray-700">Experience</span>
              <p className="text-gray-600">{yearsOfExperience} {yearsOfExperience === 1 ? 'year' : 'years'}</p>
            </div>
          )}
          {availability && (
            <div>
              <span className="font-medium text-gray-700">Availability</span>
              <p className="text-gray-600">{availability}</p>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-700">Rating</span>
            <p><StarRating avg={avg} count={ratingsCount} /></p>
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">About</h2>
            <p className="text-gray-700 leading-relaxed">{bio}</p>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Skills & Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => <SkillTag key={skill} skill={skill} />)}
            </div>
          </div>
        )}

        {/* Request button — only shown to mentees */}
        {user?.role === 'mentee' && (
          <>
            <button
              className="w-full bg-indigo-600 text-white rounded-xl py-3 font-medium hover:bg-indigo-700 transition-colors"
              onClick={() => setModalOpen(true)}
            >
              Request Mentorship
            </button>
            <RequestModal
              mentorId={mentor._id}
              mentorName={name}
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}
