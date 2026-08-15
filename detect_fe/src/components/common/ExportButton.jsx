import React, { useState, useRef, useEffect } from 'react';
import { MdFileDownload, MdTableChart, MdCode, MdArrowDropDown } from 'react-icons/md';
import { exportToCSV, exportToJSON } from '../../utils/exportHelper';
import toast from 'react-hot-toast';

/**
 * Reusable Export Button component with CSV & JSON download dropdown options.
 */
const ExportButton = ({
  data = [],
  filename = 'export_data',
  columns = null,
  onExportCSV = null,
  onExportJSON = null,
  label = 'Export',
  size = 'sm', // 'sm', 'md'
  disabled = false,
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCSVExport = () => {
    setIsOpen(false);
    if (disabled) return;
    if (onExportCSV) {
      onExportCSV();
      return;
    }
    if (!data || data.length === 0) {
      toast.error('No data available to export');
      return;
    }
    const success = exportToCSV(filename, data, columns);
    if (success) {
      toast.success(`Exported ${data.length} records to CSV! 📊`);
    }
  };

  const handleJSONExport = () => {
    setIsOpen(false);
    if (disabled) return;
    if (onExportJSON) {
      onExportJSON();
      return;
    }
    if (!data || (Array.isArray(data) && data.length === 0)) {
      toast.error('No data available to export');
      return;
    }
    const success = exportToJSON(filename, data);
    if (success) {
      const count = Array.isArray(data) ? `${data.length} records` : 'data';
      toast.success(`Exported ${count} to JSON! 📄`);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', inlineSize: 'fit-content', ...style }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
        className={`btn ${size === 'sm' ? 'btn-sm' : ''} btn-ghost`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: '1px solid var(--clr-border)',
          background: 'rgba(56, 189, 248, 0.08)',
          color: 'var(--clr-accent-cyan)',
          fontWeight: 600,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <MdFileDownload style={{ fontSize: size === 'sm' ? '1.1rem' : '1.3rem' }} />
        <span>{label}</span>
        <MdArrowDropDown style={{ fontSize: '1rem', transition: 'transform 0.2s ease', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 99,
            minWidth: '160px',
            background: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <button
            type="button"
            onClick={handleCSVExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '8px 12px',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#e2e8f0',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <MdTableChart style={{ color: 'var(--clr-accent-green)', fontSize: '1.1rem' }} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleJSONExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '8px 12px',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#e2e8f0',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <MdCode style={{ color: 'var(--clr-accent-blue)', fontSize: '1.1rem' }} />
            <span>Export JSON</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
