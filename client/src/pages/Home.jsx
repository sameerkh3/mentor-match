import { useState, useEffect, useCallback } from 'react';
import { getMentors } from '../api/mentors.js';
import MentorCard from '../components/MentorCard.jsx';
import AISuggestBox from '../components/AISuggestBox.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'QA', 'Data', 'Leadership',
  'Marketing', 'Sales', 'Operations', 'Finance',
];

export default function Home() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ department: '', minExp: '', maxExp: '', sort: '' });
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchMentors = useCallback(async (q, f) => {
    setLoading(true);
    setSearched(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (f.department) params.department = f.department;
      if (f.minExp !== '') params.minExp = f.minExp;
      if (f.maxExp !== '') params.maxExp = f.maxExp;
      if (f.sort) params.sort = f.sort;

      const { data } = await getMentors(params);
      setMentors(data);
    } catch {
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all mentors on first render
  useEffect(() => {
    fetchMentors('', filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMentors(query, filters);
  };

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    fetchMentors(query, updated);
  };

  const clearFilters = () => {
    const reset = { department: '', minExp: '', maxExp: '', sort: '' };
    setFilters(reset);
    setQuery('');
    fetchMentors('', reset);
  };

  const hasActiveFilters = query || filters.department || filters.minExp || filters.maxExp || filters.sort;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Mentor</h1>
        <p className="text-gray-500">Connect with experienced colleagues who can guide your growth.</p>
      </div>

      {/* AI Suggest — only shown to authenticated mentees */}
      {user?.role === 'mentee' && <AISuggestBox />}

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by skill, role, or keyword…"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Filter row */}
      <div className="flex flex-wrap gap-3 items-end mb-8">
        {/* Department */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Department</label>
          <select
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Experience range */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Min experience (yrs)</label>
          <input
            type="number"
            min="0"
            value={filters.minExp}
            onChange={(e) => handleFilterChange('minExp', e.target.value)}
            placeholder="0"
            className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Max experience (yrs)</label>
          <input
            type="number"
            min="0"
            value={filters.maxExp}
            onChange={(e) => handleFilterChange('maxExp', e.target.value)}
            placeholder="Any"
            className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Sort */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Sort by</label>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Relevance</option>
            <option value="rating">Rating</option>
            <option value="experience">Experience</option>
          </select>
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors pb-1 self-end"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : searched && mentors.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No mentors found matching your search.</p>
          <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <>
          {mentors.length > 0 && (
            <p className="text-sm text-gray-500 mb-4">{mentors.length} mentor{mentors.length !== 1 ? 's' : ''} found</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor._id}
                mentor={mentor}
                // onRequest wired in Phase 4
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
