import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RequestModal from './RequestModal.jsx';

/** Renders a star rating from a numeric average (0–5) */
function StarRating({ avg, count }) {
  if (!count) return <span className="text-xs text-gray-400">No ratings yet</span>;
  const rounded = Math.round(avg * 10) / 10;
  return (
    <span className="text-xs text-gray-600">
      {'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))}
      {' '}{rounded} ({count})
    </span>
  );
}

/**
 * MentorCard — displayed in search results and AI suggestion sections.
 * Props:
 *   mentor — mentor object from API
 */
export default function MentorCard({ mentor }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const {
    _id,
    name,
    title,
    department,
    skills = [],
    availability,
    photoUrl,
    ratingsTotal = 0,
    ratingsCount = 0,
  } = mentor;

  const avg = ratingsCount > 0 ? ratingsTotal / ratingsCount : 0;
  const topSkills = skills.slice(0, 3);

  // Fallback avatar using initials
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header: avatar + name + title */}
      <div className="flex items-start gap-3">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{name}</p>
          {title && (
            <p className="text-xs text-gray-500 truncate">
              {title}{department ? ` · ${department}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Skills */}
      {topSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topSkills.map((skill) => (
            <span
              key={skill}
              className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full"
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="text-xs text-gray-400 self-center">+{skills.length - 3} more</span>
          )}
        </div>
      )}

      {/* Rating + availability */}
      <div className="flex flex-col gap-1 text-xs text-gray-500">
        <StarRating avg={avg} count={ratingsCount} />
        {availability && (
          <span className="truncate">
            <span className="font-medium text-gray-700">Availability:</span> {availability}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-2">
        <button
          onClick={() => navigate(`/mentors/${_id}`)}
          className="flex-1 border border-indigo-600 text-indigo-600 rounded-lg py-1.5 text-sm font-medium hover:bg-indigo-50 transition-colors"
        >
          View Profile
        </button>
        {/* Request button only shown to mentees */}
        {user?.role === 'mentee' && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 bg-indigo-600 text-white rounded-lg py-1.5 text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Request
          </button>
        )}
      </div>

      <RequestModal
        mentorId={_id}
        mentorName={name}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
