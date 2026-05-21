import React, { useState, useEffect, useMemo } from 'react';
import { analysisAPI } from '../api';
import './LatePayments.css';

function LatePayments() {
  const [latePayments, setLatePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const [filters, setFilters] = useState({
    customer: '',
    statuses: [],
    amountMin: '',
    amountMax: '',
    daysLateMin: '',
    daysLateMax: '',
    dueDateFrom: '',
    dueDateTo: '',
  });

  useEffect(() => {
    fetchLatePayments();
  }, []);

  const fetchLatePayments = async () => {
    try {
      setLoading(true);
      const response = await analysisAPI.getLatePayments();
      setLatePayments(response.data.late_payments || []);
    } catch (err) {
      setError('Failed to load late payments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const toggleStatus = (status) => {
    setFilters((prev) => {
      const current = prev.statuses;
      if (current.includes(status)) {
        return { ...prev, statuses: current.filter((s) => s !== status) };
      }
      return { ...prev, statuses: [...current, status] };
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      customer: '',
      statuses: [],
      amountMin: '',
      amountMax: '',
      daysLateMin: '',
      daysLateMax: '',
      dueDateFrom: '',
      dueDateTo: '',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.customer !== '' ||
    filters.statuses.length > 0 ||
    filters.amountMin !== '' ||
    filters.amountMax !== '' ||
    filters.daysLateMin !== '' ||
    filters.daysLateMax !== '' ||
    filters.dueDateFrom !== '' ||
    filters.dueDateTo !== '';

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = {};
    latePayments.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [latePayments]);

  // Apply filters
  const filteredPayments = useMemo(() => {
    return latePayments.filter((payment) => {
      if (
        filters.customer &&
        !payment.customer_name
          .toLowerCase()
          .includes(filters.customer.toLowerCase())
      )
        return false;

      if (
        filters.statuses.length > 0 &&
        !filters.statuses.includes(payment.status)
      )
        return false;

      if (filters.amountMin && payment.amount < parseFloat(filters.amountMin))
        return false;
      if (filters.amountMax && payment.amount > parseFloat(filters.amountMax))
        return false;

      if (
        filters.daysLateMin &&
        payment.days_late < parseInt(filters.daysLateMin)
      )
        return false;
      if (
        filters.daysLateMax &&
        payment.days_late > parseInt(filters.daysLateMax)
      )
        return false;

      if (filters.dueDateFrom) {
        if (new Date(payment.due_date) < new Date(filters.dueDateFrom))
          return false;
      }
      if (filters.dueDateTo) {
        if (new Date(payment.due_date) > new Date(filters.dueDateTo))
          return false;
      }

      return true;
    });
  }, [latePayments, filters]);

  // Pagination calculations
  const totalRecords = filteredPayments.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = Math.min(maxVisible, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - maxVisible + 1);
        end = totalPages - 1;
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const handlePerPageChange = (value) => {
    setRecordsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  if (loading) return <div className="loading">Loading late payments...</div>;
  if (error) return <div className="error">{error}</div>;
  if (latePayments.length === 0)
    return <div className="empty">No late payments found! 🎉</div>;

  return (
    <div className="late-payments-page">
      {/* ---- Left Sidebar ---- */}
      <aside className="filter-sidebar">
        {/* Applied Filters Header */}
        <div className="filter-section-top">
          <span className="filter-title">Applied Filters</span>
          {hasActiveFilters && (
            <button className="clear-all-btn" onClick={clearFilters}>
              CLEAR ALL
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="applied-tags">
            {filters.statuses.map((s) => (
              <span key={s} className="filter-tag">
                {s.toUpperCase()}
                <button onClick={() => toggleStatus(s)}>✕</button>
              </span>
            ))}
            {filters.customer && (
              <span className="filter-tag">
                "{filters.customer}"
                <button onClick={() => handleFilterChange('customer', '')}>
                  ✕
                </button>
              </span>
            )}
          </div>
        )}

        <div className="filter-divider" />

        {/* Status Filter */}
        <div className="filter-section">
          <h4 className="filter-section-title">Status</h4>
          {Object.entries(statusCounts).map(([status, count]) => (
            <label key={status} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.statuses.includes(status)}
                onChange={() => toggleStatus(status)}
              />
              <span className="checkbox-label">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              <span className="checkbox-count">{count}</span>
            </label>
          ))}
        </div>

        <div className="filter-divider" />

        {/* Customer Search */}
        <div className="filter-section">
          <h4 className="filter-section-title">Customer</h4>
          <input
            type="text"
            className="filter-input"
            placeholder="Search customer..."
            value={filters.customer}
            onChange={(e) => handleFilterChange('customer', e.target.value)}
          />
        </div>

        <div className="filter-divider" />

        {/* Amount Range */}
        <div className="filter-section">
          <h4 className="filter-section-title">Amount ($)</h4>
          <div className="range-row">
            <input
              type="number"
              className="filter-input"
              placeholder="Min"
              value={filters.amountMin}
              onChange={(e) => handleFilterChange('amountMin', e.target.value)}
            />
            <span className="range-dash">–</span>
            <input
              type="number"
              className="filter-input"
              placeholder="Max"
              value={filters.amountMax}
              onChange={(e) => handleFilterChange('amountMax', e.target.value)}
            />
          </div>
        </div>

        <div className="filter-divider" />

        {/* Days Late Range */}
        <div className="filter-section">
          <h4 className="filter-section-title">Days Late</h4>
          <div className="range-row">
            <input
              type="number"
              className="filter-input"
              placeholder="Min"
              value={filters.daysLateMin}
              onChange={(e) =>
                handleFilterChange('daysLateMin', e.target.value)
              }
            />
            <span className="range-dash">–</span>
            <input
              type="number"
              className="filter-input"
              placeholder="Max"
              value={filters.daysLateMax}
              onChange={(e) =>
                handleFilterChange('daysLateMax', e.target.value)
              }
            />
          </div>
        </div>

        <div className="filter-divider" />

        {/* Due Date Range */}
        <div className="filter-section">
          <h4 className="filter-section-title">Due Date</h4>
          <div className="date-range">
            <label className="date-label">From</label>
            <input
              type="date"
              className="filter-input"
              value={filters.dueDateFrom}
              onChange={(e) =>
                handleFilterChange('dueDateFrom', e.target.value)
              }
            />
            <label className="date-label">To</label>
            <input
              type="date"
              className="filter-input"
              value={filters.dueDateTo}
              onChange={(e) => handleFilterChange('dueDateTo', e.target.value)}
            />
          </div>
        </div>
      </aside>

      {/* ---- Right Content ---- */}
      <main className="payments-main">
        <div className="payments-top-bar">
          <h2>⏰ Late Payments</h2>
          <span className="results-summary">
            Showing <strong>{startIndex + 1}–{endIndex}</strong> of{' '}
            <strong>{totalRecords}</strong> records
          </span>
        </div>

        <div className="payments-list">
          {paginatedPayments.length === 0 ? (
            <div className="empty">No payments match your filters.</div>
          ) : (
            paginatedPayments.map((payment, idx) => (
              <div
                key={idx}
                className={`payment-card ${payment.payment_date ? 'paid' : ''}`}
              >
                <div className="payment-header">
                  <h3>{payment.customer_name}</h3>
                  <span className={`status ${payment.status}`}>
                    {payment.status}
                  </span>
                </div>
                <div className="payment-details">
                  <div className="detail">
                    <span className="label">Amount:</span>
                    <span className="value">
                      ${payment.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="detail">
                    <span className="label">Days Late:</span>
                    <span className="value days-late">
                      {payment.days_late} days
                    </span>
                  </div>
                  <div className="detail">
                    <span className="label">Due Date:</span>
                    <span className="value">
                      {new Date(payment.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  {payment.payment_date && (
                    <div className="detail">
                      <span className="label">Paid Date:</span>
                      <span className="value">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Bar */}
        {totalRecords > 0 && (
          <div className="pagination-bar">
            <div className="pagination-info">
              Showing <strong>{startIndex + 1}–{endIndex}</strong> of{' '}
              <strong>{totalRecords}</strong> records
            </div>

            <div className="pagination-controls">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="First page"
              >
                «
              </button>
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ‹ Prev
              </button>

              {getPageNumbers().map((page, i) =>
                page === '...' ? (
                  <span key={`dots-${i}`} className="page-dots">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`page-btn page-num ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next ›
              </button>
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Last page"
              >
                »
              </button>
            </div>

            <div className="per-page-selector">
              <label>Per page:</label>
              <select
                value={recordsPerPage}
                onChange={(e) => handlePerPageChange(e.target.value)}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default LatePayments;

