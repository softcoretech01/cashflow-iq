import React, { useState, useCallback } from 'react';
import { fileAPI } from '../api';
import './FileUpload.css';

function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [columnMapping, setColumnMapping] = useState(null);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);

    try {
      setLoading(true);
      const response = await fileAPI.preview(selectedFile);
      if (response.data && response.data.columns) {
        setPreview(response.data);
        setColumnMapping(response.data.detected_mapping);
      } else {
        setPreview(null);
        setError('Invalid preview response from server');
      }
    } catch (err) {
      setPreview(null);
      setError('Failed to preview file: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      const response = await fileAPI.upload(file, columnMapping);
      setFile(null);
      setPreview(null);
      setColumnMapping(null);
      onUploadSuccess(response.data);
    } catch (err) {
      setError('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleColumnMappingChange = (field, value) => {
    setColumnMapping({
      ...columnMapping,
      [field]: value,
    });
  };

  return (
    <div className="file-upload-container">
      <h2>📤 Upload Excel File</h2>
      
      <div className="upload-section">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          disabled={loading}
          className="file-input"
        />
        <p className="file-hint">Select an Excel file (.xlsx or .xls)</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {preview && preview.columns && (
        <div className="preview-section">
          <h3>📋 Column Mapping</h3>
          <p>Total rows: {preview.total_rows}</p>
          
          <div className="column-mapping">
            {['customer', 'amount', 'due_date', 'payment_date', 'email', 'phone'].map(
              (field) => (
                <div key={field} className="mapping-field">
                  <label>{field.replace('_', ' ').toUpperCase()}</label>
                  <select
                    value={columnMapping?.[field] || ''}
                    onChange={(e) => handleColumnMappingChange(field, e.target.value)}
                  >
                    <option value="">Auto-detect</option>
                    {(preview.columns || []).map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              )
            )}
          </div>

          <div className="sample-data">
            <h4>Sample Data</h4>
            <pre>{JSON.stringify(preview.sample_rows || [], null, 2)}</pre>
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="upload-btn"
      >
        {loading ? 'Processing...' : 'Upload & Process'}
      </button>
    </div>
  );
}

export default FileUpload;
