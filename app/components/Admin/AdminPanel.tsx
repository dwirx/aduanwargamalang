'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { supabase } from '../../lib/supabase';

interface Admin {
  id: string;
  email: string;
  created_at: string;
  created_by: string | null;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { isAdmin, userEmail } = useAdmin();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && isAdmin) {
      loadAdmins();
    }
  }, [isOpen, isAdmin]);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAdmins(data || []);
    } catch (err) {
      setError('Gagal memuat daftar admin');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setAdding(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('admins')
        .insert({ email: newEmail.trim().toLowerCase(), created_by: userEmail });

      if (error) throw error;
      
      setNewEmail('');
      loadAdmins();
    } catch (err: any) {
      if (err.code === '23505') {
        setError('Email sudah terdaftar sebagai admin');
      } else {
        setError('Gagal menambahkan admin');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (email === 'bangundwir@gmail.com') {
      setError('Tidak bisa menghapus admin utama');
      return;
    }

    if (!confirm(`Hapus ${email} dari daftar admin?`)) return;

    try {
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('email', email);

      if (error) throw error;
      loadAdmins();
    } catch {
      setError('Gagal menghapus admin');
    }
  };

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center p-4">
        <div className="bg-zinc-900 p-6 border-4 border-red-500 text-center">
          <p className="text-red-400 font-bold text-lg mb-2">🔒 Akses Ditolak</p>
          <p className="text-zinc-400 text-sm mb-4">Anda bukan admin</p>
          <button onClick={onClose} className="px-4 py-2 bg-zinc-700 text-white font-bold">
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div 
        className="bg-zinc-900 w-full max-w-md max-h-[90vh] overflow-hidden border-4 border-yellow-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b-2 border-zinc-700 bg-gradient-to-r from-yellow-900/30 to-zinc-900 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-white">🔐 Admin Panel</h2>
            <p className="text-zinc-400 text-xs mt-1">Kelola administrator</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white text-xl font-bold transition-all rounded"
          >
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Add Admin Form */}
          <form onSubmit={handleAddAdmin} className="mb-4">
            <label className="block text-white font-bold text-sm mb-2">
              ➕ Tambah Admin Baru
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 px-3 py-2 bg-zinc-800 border-2 border-zinc-600 text-white text-sm focus:border-yellow-400 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={adding}
                className="px-4 py-2 bg-yellow-400 text-black font-bold text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50"
              >
                {adding ? '...' : 'Tambah'}
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="mb-4 p-2 bg-red-900/50 border border-red-500 rounded">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Admin List */}
          <div>
            <h3 className="text-white font-bold text-sm mb-2">👥 Daftar Admin ({admins.length})</h3>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {admins.map((admin) => (
                  <div 
                    key={admin.id} 
                    className={`p-3 bg-zinc-800 border-2 rounded flex justify-between items-center ${
                      admin.email === 'bangundwir@gmail.com' ? 'border-yellow-500' : 'border-zinc-700'
                    }`}
                  >
                    <div>
                      <p className="text-white font-bold text-sm flex items-center gap-2">
                        {admin.email === 'bangundwir@gmail.com' && <span className="text-yellow-400">👑</span>}
                        {admin.email}
                      </p>
                      <p className="text-zinc-500 text-xs">
                        {admin.email === 'bangundwir@gmail.com' 
                          ? 'Admin Utama' 
                          : `Ditambahkan oleh ${admin.created_by || 'system'}`
                        }
                      </p>
                    </div>
                    {admin.email !== 'bangundwir@gmail.com' && (
                      <button
                        onClick={() => handleRemoveAdmin(admin.email)}
                        className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-500 transition-colors"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-zinc-800/50 border border-zinc-700 rounded">
            <p className="text-zinc-400 text-xs">
              💡 Admin dapat menghapus laporan banjir dan mengelola admin lainnya.
              Admin utama tidak dapat dihapus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
