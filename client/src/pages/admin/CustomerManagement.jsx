import React, { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, User, X } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [detailCustomer, setDetailCustomer] = useState(null);

  const fetchRealCustomers = async () => {
    try {
      const response = await api.get('/admin/users?role=user');
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error(error.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealCustomers();
  }, []);

  useEffect(() => {
    api.get('/areas')
      .then((res) => setAreas(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAreas([]));
  }, []);

  const filteredCustomers = useMemo(() => {
    const areaName = (c) => (c.areaOfService && c.areaOfService.name) ? c.areaOfService.name : 'Not Set';
    return customers.filter((c) => {
      const matchSearch =
        !search.trim() ||
        (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
        (c.phone && c.phone.includes(search.trim())) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
      const matchArea = !areaFilter || areaName(c) === areaFilter;
      return matchSearch && matchArea;
    });
  }, [customers, search, areaFilter]);

  const handleDelete = async (customerId) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this customer? This action cannot be undone.'
    );
    if (!isConfirmed) return;

    try {
      await api.delete(`/admin/users/${customerId}`);
      setCustomers((prev) => prev.filter((c) => c._id !== customerId));
      setDetailCustomer((prev) => (prev && prev._id === customerId ? null : prev));
      toast.success('Customer deleted successfully.');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error(error.response?.data?.message || 'Failed to delete customer.');
    }
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: 1024, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Customer Management
        </h1>
      </div>

      {/* Toolbar: Search & Filter */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 360 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by name, mobile number or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none',
              background: '#fff',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--sea-600)';
              e.target.style.boxShadow = '0 0 0 2px rgba(15,118,110,0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          style={{
            padding: '10px 36px 10px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 14,
            color: '#334155',
            background: '#fff',
            cursor: 'pointer',
            minWidth: 160,
          }}
        >
          <option value="">All Areas</option>
          {areas.map((a) => (
            <option key={a._id} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table card */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Customer
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Contact
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Delivery Area
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: 48, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 48, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
                    {customers.length === 0 ? 'No customers registered yet.' : 'No customers match your search or filter.'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, idx) => (
                  <tr
                    key={customer._id}
                    style={{
                      borderTop: '1px solid #f1f5f9',
                      background: idx % 2 === 0 ? '#fff' : '#fafafa',
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>
                        {customer.name || customer.username || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: '#475569' }}>
                      <div>{customer.phone || '—'}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }} title={customer.email}>
                        {customer.email}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: 'rgba(15,118,110,0.1)',
                          color: 'var(--sea-600)',
                          border: '1px solid rgba(15,118,110,0.2)',
                        }}
                      >
                        {customer.areaOfService?.name || 'Not Set'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setDetailCustomer(customer)}
                          style={{
                            padding: '8px 14px',
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--sea-600)',
                            background: 'rgba(15,118,110,0.08)',
                            border: '1px solid rgba(15,118,110,0.25)',
                            borderRadius: 8,
                            cursor: 'pointer',
                          }}
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(customer._id)}
                          style={{
                            padding: 8,
                            color: '#b91c1c',
                            background: 'rgba(185,28,28,0.06)',
                            border: '1px solid rgba(185,28,28,0.2)',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Delete customer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Row count and pagination placeholder */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            padding: '12px 16px',
            borderTop: '1px solid #e5e7eb',
            background: '#fafafa',
            fontSize: 13,
            color: '#64748b',
          }}
        >
          <span>
            Showing {loading ? 0 : filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              disabled
              style={{
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 500,
                color: '#94a3b8',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                cursor: 'not-allowed',
              }}
            >
              Previous
            </button>
            <button
              type="button"
              disabled
              style={{
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 500,
                color: '#94a3b8',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                cursor: 'not-allowed',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Customer details modal */}
      {detailCustomer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'rgba(15,23,42,0.4)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setDetailCustomer(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              maxWidth: 420,
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg, #f8fafc 0%, #fff 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--sea-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={22} style={{ color: 'var(--sea-600)' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Customer Details</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>{detailCustomer.name || '—'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailCustomer(null)}
                style={{ padding: 8, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 8, color: '#64748b' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <dl style={{ margin: 0, display: 'grid', gap: 16 }}>
                {[
                  { label: 'Name', value: detailCustomer.name || '—' },
                  { label: 'Email', value: detailCustomer.email || '—' },
                  { label: 'Mobile Number', value: detailCustomer.phone || '—' },
                  { label: 'Delivery Area', value: detailCustomer.areaOfService?.name || 'Not Set' },
                  ...(detailCustomer.address ? [{ label: 'Address', value: detailCustomer.address }] : []),
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</dt>
                    <dd style={{ margin: '4px 0 0', fontSize: 14, color: '#0f172a', fontWeight: 500 }}>{value}</dd>
                  </div>
                ))}
              </dl>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setDetailCustomer(null)}
                  style={{
                    padding: '10px 20px',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#475569',
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
