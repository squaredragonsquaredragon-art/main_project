/**
 * Utility functions for exporting data to CSV and JSON files in detect_fe.
 */

/**
 * Triggers a browser download of a blob/content file.
 */
const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Clean string values for CSV formatting (escape quotes and handle commas/newlines).
 */
const escapeCSVValue = (val) => {
  if (val === null || val === undefined) return '""';
  if (typeof val === 'object') {
    val = JSON.stringify(val);
  } else {
    val = String(val);
  }
  // Replace double quotes with escaped double quotes
  val = val.replace(/"/g, '""');
  return `"${val}"`;
};

/**
 * Export array of data objects to CSV.
 * @param {string} filename - Output filename (e.g. 'login_history.csv')
 * @param {Array<Object>} data - Data rows
 * @param {Array<{key: string, label: string}>} [columns] - Optional specific columns mapping
 */
export const exportToCSV = (filename, data = [], columns = null) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data to export to CSV.');
    return false;
  }

  let headers = [];
  let keys = [];

  if (columns && Array.isArray(columns) && columns.length > 0) {
    keys = columns.map(c => c.key);
    headers = columns.map(c => c.label || c.key);
  } else {
    // Collect all unique keys from data objects
    const keySet = new Set();
    data.forEach(item => {
      if (item && typeof item === 'object') {
        Object.keys(item).forEach(k => keySet.add(k));
      }
    });
    keys = Array.from(keySet);
    headers = keys;
  }

  const csvRows = [];
  // Header row
  csvRows.push(headers.map(h => escapeCSVValue(h)).join(','));

  // Data rows
  data.forEach(row => {
    const values = keys.map(k => escapeCSVValue(row?.[k]));
    csvRows.push(values.join(','));
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadFile(blob, finalFilename);
  return true;
};

/**
 * Export object or array to JSON.
 * @param {string} filename - Output filename (e.g. 'alerts.json')
 * @param {any} data - Data to stringify
 */
export const exportToJSON = (filename, data = []) => {
  if (!data) {
    console.warn('No data to export to JSON.');
    return false;
  }

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });

  const finalFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
  downloadFile(blob, finalFilename);
  return true;
};
