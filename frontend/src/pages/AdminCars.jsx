import React, { useMemo, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, CheckCircle, XCircle, Car } from 'lucide-react';
import { useData } from '../context/DataContext';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import TableSkeleton from '../components/TableSkeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const AdminCars = () => {
  const { adminCars, isAdminReady, refreshing, refreshAdminCars, refreshAdminSlabs } = useData();

  const [formData, setFormData] = useState({
    modelName: '',
    baseSuffix: '',
    variant: '',
    active: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const visibleCars = useMemo(() => {
    return [...adminCars]
      .filter((car) => {
        if (statusFilter === 'active') return car.active;
        if (statusFilter === 'inactive') return !car.active;
        return true;
      })
      .sort((a, b) => a.modelName.localeCompare(b.modelName));
  }, [adminCars, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/admin/cars/${editingId}`, formData);
        toast.success('Car model updated');
      } else {
        await api.post('/admin/cars', formData);
        toast.success('Car model added');
      }

      setFormData({ modelName: '', baseSuffix: '', variant: '', active: true });
      setEditingId(null);
      await Promise.all([refreshAdminCars(), refreshAdminSlabs()]);
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleToggleStatus = async (car) => {
    try {
      await api.put(`/admin/cars/${car.id}`, {
        modelName: car.modelName,
        baseSuffix: car.baseSuffix || '',
        variant: car.variant || '',
        active: !car.active,
      });

      toast.success(`Model marked ${!car.active ? 'active' : 'inactive'}`);
      await Promise.all([refreshAdminCars(), refreshAdminSlabs()]);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const carToDelete = adminCars.find((car) => car.id === deleteId);
    if (!carToDelete) return;

    setDeleting(true);

    try {
      await api.delete(`/admin/cars/${deleteId}`);

      toast.success('Car model deleted');
      await Promise.all([refreshAdminCars(), refreshAdminSlabs()]);
      setDeleteId(null);
    } catch (error) {
      const status = error?.response?.status;

      if (status === 409) {
        try {
          await api.put(`/admin/cars/${deleteId}`, {
            modelName: carToDelete.modelName,
            baseSuffix: carToDelete.baseSuffix || '',
            variant: carToDelete.variant || '',
            active: false,
          });

          toast.success('Car model is used in submissions, so it is deactivated');
          await Promise.all([refreshAdminCars(), refreshAdminSlabs()]);
          setDeleteId(null);
        } catch {
          toast.error('Failed to deactivate car model');
        }
      } else {
        toast.error('Failed to delete car model');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (car) => {
    setEditingId(car.id);
    setFormData({
      modelName: car.modelName,
      baseSuffix: car.baseSuffix || '',
      variant: car.variant || '',
      active: car.active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ modelName: '', baseSuffix: '', variant: '', active: true });
  };

  return (
    <div className={refreshing ? 'opacity-90 transition-opacity' : ''}>
      <PageHeader
        eyebrow="Administration"
        title="Car models"
        description="Manage the vehicle catalog used for sales entry and incentive slab assignment."
      />

      <section className="card mb-6">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-slate-800">
            {editingId ? 'Edit car model' : 'Add new car model'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="label-field">Model name</label>
              <input
                type="text"
                required
                placeholder="e.g. Innova"
                value={formData.modelName}
                onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label-field">Base suffix</label>
              <input
                type="text"
                placeholder="e.g. Hycross"
                value={formData.baseSuffix}
                onChange={(e) => setFormData({ ...formData, baseSuffix: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label-field">Variant</label>
              <input
                type="text"
                placeholder="e.g. VX"
                value={formData.variant}
                onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer rounded-xl bg-slate-50 px-4 py-2.5 w-full ring-1 ring-slate-200">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button type="submit" className="btn-primary">
              {editingId ? (
                'Save changes'
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add model
                </>
              )}
            </button>

            {editingId && (
              <button type="button" onClick={cancelEdit} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-800">All models</h2>

          <div className="flex flex-wrap items-center gap-2">
            {['all', 'active', 'inactive'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ring-1 transition ${statusFilter === filter
                  ? 'bg-blue-600 text-white ring-blue-600'
                  : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
                  }`}
              >
                {filter[0].toUpperCase() + filter.slice(1)}
              </button>
            ))}

            <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full ring-1 ring-slate-200">
              {visibleCars.length} shown
            </span>
          </div>
        </div>

        {!isAdminReady ? (
          <TableSkeleton rows={5} cols={5} />
        ) : adminCars.length === 0 ? (
          <EmptyState
            icon={Car}
            title="No car models yet"
            description="Add your first model using the form above."
          />
        ) : visibleCars.length === 0 ? (
          <EmptyState
            icon={Car}
            title="No models found"
            description="Try changing the status filter."
          />
        ) : (
          <>
            <div className="hidden md:block table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Suffix</th>
                    <th>Variant</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleCars.map((car) => (
                    <tr key={car.id} className="hover:bg-slate-50/80">
                      <td className="font-medium text-slate-900">{car.modelName}</td>
                      <td className="text-slate-600">{car.baseSuffix || '—'}</td>
                      <td className="text-slate-600">{car.variant || '—'}</td>

                      <td>
                        {car.active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full ring-1 ring-emerald-200/60">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            <XCircle className="w-3.5 h-3.5" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(car)}
                            className="btn-ghost"
                            aria-label={car.active ? 'Mark inactive' : 'Mark active'}
                            title={car.active ? 'Mark inactive' : 'Mark active'}
                          >
                            {car.active ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(car)}
                            className="btn-ghost"
                            aria-label="Edit"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteId(car.id)}
                            className="btn-danger-ghost"
                            aria-label="Delete"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden card-body space-y-3 pt-0">
              {visibleCars.map((car) => (
                <div key={car.id} className="mobile-data-card">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{car.modelName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {[car.baseSuffix, car.variant].filter(Boolean).join(' · ') || 'No suffix'}
                      </p>
                    </div>

                    {car.active ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(car)}
                      className="btn-secondary flex-1 text-xs py-2"
                    >
                      {car.active ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEdit(car)}
                      className="btn-secondary flex-1 text-xs py-2"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteId(car.id)}
                      className="btn-secondary flex-1 text-xs py-2 text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
      <ConfirmDialog
        open={!!deleteId}
        title="Delete car model?"
        message="If this model is already used in past submissions, it will be deactivated instead to preserve history."
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminCars;