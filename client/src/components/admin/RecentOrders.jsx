import React, { useState, useMemo } from 'react';
import api from '../../utils/api';

export default function RecentOrders({ orders = [], onRefresh }) {
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (!q) return true;
      const id = (o._id || '').toLowerCase();
      const name = (o.user?.name || '').toLowerCase();
      const items = (o.items || []).map(i => (i.productName || i.product?.name || '')).join(' ').toLowerCase();
      return id.includes(q) || name.includes(q) || items.includes(q);
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAssign = async (order) => {
    setAssigningOrder(order);
    setLoadingPartners(true);
    try {
      const res = await api.get('/admin/users?role=partner');
      setPartners(res.data || []);
    } catch (err) {
      console.error('Load partners', err);
      setPartners([]);
    } finally {
      setLoadingPartners(false);
    }
  };

  const doAssign = async () => {
    if (!selectedPartner || !assigningOrder) return;
    setAssigning(true);
    try {
      await api.put('/admin/assign-partner', { orderId: assigningOrder._id, partnerId: selectedPartner });
      setAssigningOrder(null);
      setSelectedPartner('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Assign partner', err);
      alert(err?.response?.data?.message || 'Failed to assign partner');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-700">Recent Orders</h3>
        <div className="flex items-center gap-2">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search orders, customers..." className="border rounded-md px-2 py-1 text-sm" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="border rounded-md px-2 py-1 text-sm">
            <option value="">All statuses</option>
            <option>Pending</option>
            <option>Packed</option>
            <option>Out for Delivery</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl p-3 shadow-sm border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="py-2 pr-4">Order ID</th>
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Items</th>
              <th className="py-2 pr-4">Area</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((o) => (
              <tr key={o._id} className="border-t">
                <td className="py-3 pr-4">{(o._id || '').slice(0, 8)}</td>
                <td className="py-3 pr-4">{o.user?.name || 'Guest'}</td>
                <td className="py-3 pr-4">
                  {o.items?.map((it) => `${it.productName || it.product?.name || ''} (${it.preparation || '-'})`).join(', ')}
                </td>
                <td className="py-3 pr-4">{o.deliveryArea || (o.user?.areaOfService?.name) || '—'}</td>
                <td className="py-3 pr-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    o.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    o.status === 'Packed' ? 'bg-amber-100 text-amber-700' :
                    o.status === 'Out for Delivery' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-slate-100 text-slate-700'}`}>
                    {o.status}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openAssign(o)}
                      className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-md"
                    >
                      Assign
                    </button>
                    <a href={`/admin/orders/${o._id}`} className="text-xs text-slate-600 hover:underline">View</a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-slate-500">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
          <div className="px-2 py-1 border rounded">{page}</div>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* Assign modal */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAssigningOrder(null)} />
          <div className="relative bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h4 className="text-lg font-semibold mb-2">Assign Partner</h4>
            <div className="text-sm text-slate-600 mb-4">Order: {assigningOrder._id}</div>
            <div className="mb-4">
              {loadingPartners ? (
                <div>Loading partners...</div>
              ) : (
                <select className="w-full border px-3 py-2 rounded-md" value={selectedPartner} onChange={(e) => setSelectedPartner(e.target.value)}>
                  <option value="">Select partner</option>
                  {partners.map((p) => (<option key={p._id} value={p._id}>{p.name} — {p.phone || p.email}</option>))}
                </select>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 rounded-md" onClick={() => setAssigningOrder(null)}>Cancel</button>
              <button className="px-3 py-1 rounded-md bg-teal-600 text-white" onClick={doAssign} disabled={assigning}>{assigning ? 'Assigning...' : 'Assign'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

