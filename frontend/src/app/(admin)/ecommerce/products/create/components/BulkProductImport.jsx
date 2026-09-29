import { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiFetch, downloadExcel } from '@/helpers/httpClient';

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = () => reject(new Error('Unable to read the selected file.'));
  reader.readAsDataURL(file);
});

const BulkProductImport = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);

  const importCsv = async (event) => {
    event.preventDefault();
    setError('');

    if (!file || !/\.(csv|xlsx)$/i.test(file.name)) {
      setError('Choose an Excel or CSV file.');
      return;
    }
    if (file.size > 1_000_000) {
      setError('Excel and CSV files must be 1 MB or smaller.');
      return;
    }

    setImporting(true);
    try {
      const result = await apiFetch('/api/product/bulk-import', {
        method: 'POST',
        headers: {
          'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(file.name.toLowerCase().endsWith('.csv') ? { csv: await file.text() } : { file: await toBase64(file) }),
      });
      toast.success(result.message, { position: 'top-right', toastId: 'product-import-success' });
      navigate('/ecommerce/products');
    } catch (requestError) {
      setError(requestError.message || 'Unable to import products.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <form onSubmit={importCsv}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h5 className="mb-1">Bulk import or update products</h5>
          <p className="text-muted mb-0">Download current products, edit them, and upload the same Excel file. Keep Product ID to update; leave it blank to create.</p>
        </div>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => downloadExcel('/api/product/bulk-template', 'Product-bulk-update.xlsx')}>
          Download sample Excel
        </button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Excel or CSV file</Form.Label>
        <Form.Control type="file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" onChange={(event) => setFile(event.target.files?.[0] || null)} />
        <Form.Text className="text-muted">
          Use existing category name, slug, path, or ID. Separate multiple images, subcategories, tags, and care instructions with |. Maximum 500 products.
        </Form.Text>
      </Form.Group>

      <button type="submit" className="btn btn-primary" disabled={importing}>
        {importing ? 'Importing products...' : 'Import or update products'}
      </button>
    </form>
  );
};

export default BulkProductImport;
