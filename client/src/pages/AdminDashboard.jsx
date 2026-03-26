import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAllUsers, updateUserStatus, getStats } from '../api/admin.js';
import Spinner from '../components/Spinner.jsx';

/** Single stat card */
function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-indigo-600 mt-1">
        {value ?? <span className="text-gray-300 text-2xl">—</span>}
      </p>
    </div>
  );
}

const ROLE_TABS = [
  { label: 'All', value: '' },
  { label: 'Mentors', value: 'mentor' },
  { label: 'Mentees', value: 'mentee' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch stats once on mount
  useEffect(() => {
    getStats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  // Fetch users whenever roleFilter changes
  useEffect(() => {
    setLoading(true);
    getAllUsers(roleFilter || undefined)
      .then(({ data }) => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [roleFilter]);

  const handleToggleStatus = async (user) => {
    try {
      const { data } = await updateUserStatus(user._id, !user.isActive);
      setUsers((prev) => prev.map((u) => (u._id === data._id ? data : u)));
      toast.success(data.isActive ? `${data.name} reactivated.` : `${data.name} deactivated.`);
    } catch (err) {
      toast.error(err.friendlyMessage || err.response?.data?.error || 'Could not update user status.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Platform overview and user management.</p>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Mentors" value={statsLoading ? null : stats?.totalMentors} />
        <StatCard label="Total Mentees" value={statsLoading ? null : stats?.totalMentees} />
        <StatCard label="Requests Sent" value={statsLoading ? null : stats?.requestsSent} />
        <StatCard label="Requests Accepted" value={statsLoading ? null : stats?.requestsAccepted} />
      </div>

      {/* User table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-base font-semibold text-gray-900">Users</h2>

          {/* Role filter tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setRoleFilter(tab.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  roleFilter === tab.value
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-3 text-gray-500">{user.email}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'mentor'
                          ? 'bg-indigo-50 text-indigo-700'
                          : user.role === 'admin'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-teal-50 text-teal-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        user.isActive
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            user.isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
