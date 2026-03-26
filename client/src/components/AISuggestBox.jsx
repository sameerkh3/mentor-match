import { useState } from 'react';
import { suggestMentors } from '../api/mentors.js';
import MentorCard from './MentorCard.jsx';
import Spinner from './Spinner.jsx';

/**
 * AISuggestBox — lets a mentee describe what they need in plain English
 * and receive AI-ranked mentor recommendations. Shows a fallback banner
 * when the AI service is unavailable.
 */
export default function AISuggestBox() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null); // null = not yet searched
  const [aiError, setAiError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setAiError(false);
    setSuggestions(null);
    try {
      const { data } = await suggestMentors(prompt.trim());
      setSuggestions(data.suggestions ?? []);
      if (data.aiError) setAiError(true);
    } catch {
      setSuggestions([]);
      setAiError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-10 bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-indigo-900 mb-1">AI Suggested</h2>
      <p className="text-sm text-indigo-700 mb-4">
        Describe what you're looking for and Claude will recommend the best matches.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you're looking for in a mentor…"
          rows={2}
          className="flex-1 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="self-end sm:self-auto bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors whitespace-nowrap"
        >
          {loading ? 'Searching…' : 'Find me a mentor'}
        </button>
      </form>

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center mt-6">
          <Spinner />
        </div>
      )}

      {/* AI unavailable fallback */}
      {!loading && aiError && (
        <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          AI suggestions are unavailable right now. Try the search below.
        </div>
      )}

      {/* Suggestions */}
      {!loading && !aiError && suggestions && suggestions.length > 0 && (
        <div className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {suggestions.map((s) => (
              <div key={s.mentorId} className="flex flex-col gap-2">
                {/* Reason badge */}
                <p className="text-xs text-indigo-700 font-medium bg-indigo-100 rounded-lg px-3 py-1.5 leading-snug">
                  {s.reason}
                </p>
                <MentorCard mentor={{ _id: s.mentorId, name: s.name }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No suggestions found (AI returned empty array without error) */}
      {!loading && !aiError && suggestions !== null && suggestions.length === 0 && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          No suggestions found. Try rephrasing your goal.
        </p>
      )}
    </div>
  );
}
