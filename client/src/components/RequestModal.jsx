import { useState } from 'react';
import toast from 'react-hot-toast';
import { sendRequest } from '../api/requests.js';

/**
 * RequestModal — slide-in overlay for sending a mentorship request.
 *
 * Props:
 *   mentorId   {string}   - ID of the mentor being requested
 *   mentorName {string}   - Display name used in the header
 *   isOpen     {boolean}  - Controls visibility
 *   onClose    {Function} - Called when modal should close
 */
export default function RequestModal({ mentorId, mentorName, isOpen, onClose }) {
  const [form, setForm] = useState({ goal: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await sendRequest({ mentorId, goal: form.goal, message: form.message });
      toast.success('Mentorship request sent!');
      setSuccess(true);
      // Auto-close after a brief success moment
      setTimeout(() => {
        setSuccess(false);
        setForm({ goal: '', message: '' });
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setForm({ goal: '', message: '' });
    setError('');
    setSuccess(false);
    onClose();
  };

  const msgLength = form.message.length;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 sm:px-4"
      onClick={handleClose}
    >
      {/* Panel — full-screen on mobile, centered card on sm+ */}
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl p-6 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Request Mentorship</h2>
            <p className="text-sm text-gray-500 mt-0.5">Sending to {mentorName}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <p className="text-green-600 font-medium text-lg">Request sent!</p>
            <p className="text-gray-500 text-sm mt-1">
              {mentorName} will be notified by email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your goal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="goal"
                value={form.goal}
                onChange={handleChange}
                required
                placeholder="e.g. Learn JavaScript test automation"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-red-500">*</span>{' '}
                <span className="text-gray-400 font-normal">({msgLength}/300)</span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                maxLength={300}
                rows={4}
                placeholder="Introduce yourself and describe what you're hoping to get from this mentorship…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !form.goal.trim() || !form.message.trim()}
                className="flex-1 bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Sending…' : 'Send Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
