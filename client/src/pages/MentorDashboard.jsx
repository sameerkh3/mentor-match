import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getMentorById, updateProfile } from '../api/mentors.js';
import { getReceivedRequests, updateRequestStatus } from '../api/requests.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Spinner from '../components/Spinner.jsx';

/** Renders editable skill chips from a comma-separated input */
function SkillsInput({ value, onChange }) {
  const skills = value.filter(Boolean);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const raw = e.target.value.trim().replace(/,$/, '');
      if (raw && !skills.includes(raw)) {
        onChange([...skills, raw]);
      }
      e.target.value = '';
    }
  };

  const removeSkill = (skill) => onChange(skills.filter((s) => s !== skill));

  return (
    <div className="border border-gray-300 rounded-lg px-3 py-2 flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-indigo-500">
      {skills.map((skill) => (
        <span
          key={skill}
          className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
        >
          {skill}
          <button
            type="button"
            onClick={() => removeSkill(skill)}
            className="text-indigo-400 hover:text-indigo-700 leading-none"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        placeholder={skills.length ? 'Add skill…' : 'Type a skill and press Enter'}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-24 outline-none text-sm bg-transparent"
      />
    </div>
  );
}

export default function MentorDashboard() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: '',
    department: '',
    bio: '',
    skills: [],
    yearsOfExperience: '',
    availability: '',
    photoUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Incoming requests state
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  // Load current profile on mount
  useEffect(() => {
    if (!user?.id) return;
    getMentorById(user.id)
      .then(({ data }) => {
        setForm({
          title: data.title ?? '',
          department: data.department ?? '',
          bio: data.bio ?? '',
          skills: data.skills ?? [],
          yearsOfExperience: data.yearsOfExperience ?? '',
          availability: data.availability ?? '',
          photoUrl: data.photoUrl ?? '',
        });
      })
      .catch(() => {
        // New mentor — form stays empty, that's fine
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  // Load incoming requests on mount
  useEffect(() => {
    getReceivedRequests()
      .then(({ data }) => setRequests(data))
      .catch(() => setRequests([]))
      .finally(() => setRequestsLoading(false));
  }, []);

  const handleRequestAction = async (id, status) => {
    try {
      await updateRequestStatus(id, status);
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
      toast.success(status === 'accepted' ? 'Request accepted.' : 'Request declined.');
    } catch {
      toast.error('Could not update request. Please try again.');
    }
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        ...form,
        yearsOfExperience: form.yearsOfExperience === '' ? undefined : Number(form.yearsOfExperience),
      });
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const bioLength = form.bio.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Mentor Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Keep your profile up to date so mentees can find you.</p>

      {/* Toast notification */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">Edit Profile</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Senior Engineer"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="e.g. Engineering"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio <span className="text-gray-400 font-normal">({bioLength}/500)</span>
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            maxLength={500}
            rows={4}
            placeholder="Tell mentees about your background and what you can help with…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills & expertise</label>
          <SkillsInput
            value={form.skills}
            onChange={(skills) => setForm((prev) => ({ ...prev, skills }))}
          />
          <p className="text-xs text-gray-400 mt-1">Press Enter or comma to add a skill.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years of experience</label>
            <input
              type="number"
              name="yearsOfExperience"
              value={form.yearsOfExperience}
              onChange={handleChange}
              min="0"
              placeholder="e.g. 8"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
            <input
              type="text"
              name="availability"
              value={form.availability}
              onChange={handleChange}
              placeholder="e.g. Tuesdays 2–4pm"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
          <input
            type="url"
            name="photoUrl"
            value={form.photoUrl}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-indigo-600 text-white rounded-lg py-2.5 font-medium text-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      {/* Incoming requests section */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Incoming Requests</h2>

        {requestsLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-gray-400">No incoming requests yet.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const mentee = req.menteeId; // populated: { name, email }
              const initials = mentee?.name
                ? mentee.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                : '?';

              return (
                <div
                  key={req._id}
                  className="border border-gray-100 rounded-xl p-4 flex items-start gap-4"
                >
                  {/* Mentee avatar */}
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{mentee?.name ?? 'Unknown'}</p>
                        {mentee?.email && (
                          <p className="text-xs text-gray-400">{mentee.email}</p>
                        )}
                      </div>
                      <StatusBadge status={req.status} />
                    </div>

                    <p className="text-sm text-gray-700 mt-1.5">
                      <span className="font-medium">Goal:</span> {req.goal}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{req.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Received {new Date(req.createdAt).toLocaleDateString()}
                    </p>

                    {/* Accept / Decline — only shown while pending */}
                    {req.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleRequestAction(req._id, 'accepted')}
                          className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRequestAction(req._id, 'declined')}
                          className="px-4 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
