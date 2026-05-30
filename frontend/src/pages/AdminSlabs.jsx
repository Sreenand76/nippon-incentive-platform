import React, { useMemo, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Layers, Filter, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCarLabel } from '../utils/formatCar';
import { formatRupee } from '../utils/formatCurrency';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import TableSkeleton from '../components/TableSkeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const PAGE_SIZE = 10;

const AdminSlabs = () => {
  const { adminCars, adminSlabs, isAdminReady, refreshing, refreshAdminSlabs } = useData();
  const [filterCarId, setFilterCarId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    carModelId: '',
    minCars: '',
    maxCars: '',
    amountPerCar: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Reset to page 1 whenever filters/search change
  const handleFilterCarId = (val) => { setFilterCarId(val); setCurrentPage(1); };
  const handleSearchQuery = (val) => { setSearchQuery(val); setCurrentPage(1); };

  const filteredSlabs = useMemo(() => {
    let list = adminSlabs;
    if (filterCarId) {
      list = list.filter((s) => s.carModel?.id?.toString() === filterCarId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((s) => formatCarLabel(s.carModel).toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      const nameA = formatCarLabel(a.carModel);
      const nameB = formatCarLabel(b.carModel);
      if (nameA !== nameB) return nameA.localeCompare(nameB);
      return a.minCars - b.minCars;
    });
  }, [adminSlabs, filterCarId, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredSlabs.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedSlabs = filteredSlabs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetForm = () => {
    setFormData({ carModelId: '', minCars: '', maxCars: '', amountPerCar: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.carModelId) { toast.error('Select a car model'); return; }
    const payload = {
      carModel: { id: parseInt(formData.carModelId, 10) },
      minCars: parseInt(formData.minCars, 10),
      maxCars: formData.maxCars ? parseInt(formData.maxCars, 10) : null,
      amountPerCar: parseFloat(formData.amountPerCar),
    };
    try {
      if (editingId) {
        await api.put(`/admin/slabs/${editingId}`, payload);
        toast.success('Slab updated');
      } else {
        await api.post('/admin/slabs', payload);
        toast.success('Slab added');
      }
      resetForm();
      await refreshAdminSlabs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);

    try {
      await api.delete(`/admin/slabs/${deleteId}`);
      toast.success('Slab deleted');
      setDeleteId(null);
      await refreshAdminSlabs();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (slab) => {
    setEditingId(slab.id);
    setFormData({
      carModelId: slab.carModel?.id?.toString() || '',
      minCars: slab.minCars,
      maxCars: slab.maxCars || '',
      amountPerCar: slab.amountPerCar,
    });
  };

  const hasActiveFilters = filterCarId || searchQuery.trim();

  return (
    <div className={refreshing ? 'opacity-90 transition-opacity' : ''}>
      <PageHeader
        eyebrow="Administration"
        title="Model incentive slabs"
        description="Define per-model quantity tiers. Gaps between tiers use the lower rate at calculation time."
      />

      {/* ── Form ── */}
      <section className="card mb-6">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-slate-800">
            {editingId ? 'Edit slab' : 'Add incentive slab'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="card-body space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="label-field">Car model</label>
              <select
                required
                value={formData.carModelId}
                onChange={(e) => setFormData({ ...formData, carModelId: e.target.value })}
                className="select-field"
              >
                <option value="">Select model</option>
                {adminCars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {formatCarLabel(car)} {!car.active ? '(inactive)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Min units</label>
              <input
                type="number" min="1" required
                value={formData.minCars}
                onChange={(e) => setFormData({ ...formData, minCars: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Max units</label>
              <input
                type="number" min="1" placeholder="Open-ended"
                value={formData.maxCars}
                onChange={(e) => setFormData({ ...formData, maxCars: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Per unit (₹)</label>
              <input
                type="number" min="1" required
                value={formData.amountPerCar}
                onChange={(e) => setFormData({ ...formData, amountPerCar: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
              <button type="submit" className="btn-primary flex-1">
                {editingId ? 'Update' : (
                  <><Plus className="w-4 h-4" />Add</>
                )}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-secondary px-3">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </section>

      {/* ── Filter + Search bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:ml-4">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none " />
          <input
            type="text"
            placeholder="Search model…"
            value={searchQuery}
            onChange={(e) => handleSearchQuery(e.target.value)}
            className="input-field pl-9 pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Model filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterCarId}
            onChange={(e) => handleFilterCarId(e.target.value)}
            className="select-field max-w-xs"
          >
            <option value="">All models</option>
            {adminCars.map((car) => (
              <option key={car.id} value={car.id}>{formatCarLabel(car)}</option>
            ))}
          </select>
        </div>

        {/* Clear all filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => { handleFilterCarId(''); handleSearchQuery(''); }}
            className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2 transition-colors whitespace-nowrap"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Table card ── */}
      <section className="card">
        <div className="card-header flex justify-between items-center">
          <h2 className="text-sm font-semibold text-slate-800">Configured slabs</h2>
          <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full ring-1 ring-slate-200">
            {filteredSlabs.length} {filteredSlabs.length === 1 ? 'slab' : 'slabs'}
          </span>
        </div>

        {!isAdminReady ? (
          <TableSkeleton rows={5} cols={4} />
        ) : filteredSlabs.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No slabs found"
            description={
              hasActiveFilters
                ? 'No slabs match your search or filter. Try clearing them.'
                : 'Add tiers for each model to get started.'
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Unit range</th>
                    <th>Rate per unit</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedSlabs.map((slab) => (
                    <tr key={slab.id} className="hover:bg-slate-50/80">
                      <td className="font-medium text-slate-900">{formatCarLabel(slab.carModel)}</td>
                      <td className="text-slate-600">{slab.minCars} – {slab.maxCars ?? '∞'} units</td>
                      <td className="font-semibold text-emerald-600">{formatRupee(slab.amountPerCar)}</td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => handleEdit(slab)} className="btn-ghost" aria-label="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => setDeleteId(slab.id)} className="btn-danger-ghost" aria-label="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden card-body space-y-3 pt-0">
              {pagedSlabs.map((slab) => (
                <div key={slab.id} className="mobile-data-card">
                  <p className="font-semibold text-slate-900">{formatCarLabel(slab.carModel)}</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-600">
                      {slab.minCars}–{slab.maxCars ?? '∞'} units
                    </span>
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                      {formatRupee(slab.amountPerCar)}/unit
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleEdit(slab)} className="btn-secondary flex-1 text-xs py-2">Edit</button>
                    <button type="button" className="btn-secondary flex-1 text-xs py-2 text-red-600">Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Record range label */}
                <p className="text-xs text-slate-500 tabular-nums">
                  Showing{' '}
                  <span className="font-medium text-slate-700">
                    {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredSlabs.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-slate-700">{filteredSlabs.length}</span>{' '}
                  slabs
                </p>

                {/* Page controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="btn-ghost px-2 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page number pills */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('ellipsis-' + p);
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item) =>
                      typeof item === 'string' ? (
                        <span key={item} className="px-1 text-slate-400 text-xs select-none">…</span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setCurrentPage(item)}
                          className={`min-w-[2rem] h-8 rounded-md text-xs font-medium transition-colors ${item === safePage
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="btn-ghost px-2 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
      <ConfirmDialog
        open={!!deleteId}
        title="Delete incentive slab?"
        message=""
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminSlabs;
