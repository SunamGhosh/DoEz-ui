import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';

const AdminLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/login', { phone, password });

      if (res.data?.data?.userRole !== 'admin') {
        setError('Access denied');
        return;
      }

      navigate('/admin', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Admin Login</h2>

        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded"
          required
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
