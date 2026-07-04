import React, { useState } from 'react';
import Papa from 'papaparse';
import { useBulkImportProducts } from './hooks/useProducts';
import { useAuthStore } from '../../stores/auth.store';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import type { CreateProductDTO } from '@sellwise/shared';
import { createProductSchema } from '@sellwise/shared';
import { Link } from 'react-router-dom';

export function BulkImportPage() {
  const navigate = useNavigate();
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';
  const importMutation = useBulkImportProducts(storeId);

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleParse = () => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const validationErrors: string[] = [];
        const validProducts: CreateProductDTO[] = [];

        data.forEach((row, index) => {
          const parseResult = createProductSchema.safeParse(row);
          if (!parseResult.success) {
            validationErrors.push(`Row ${index + 2}: ${parseResult.error.errors.map(e => e.message).join(', ')}`);
          } else {
            validProducts.push(parseResult.data);
          }
        });

        setErrors(validationErrors);
        setParsedData(validProducts);
      },
      error: (error) => {
        setErrors([error.message]);
      }
    });
  };

  const handleImport = async () => {
    if (parsedData.length === 0 || errors.length > 0) return;

    try {
      await importMutation.mutateAsync(parsedData);
      alert('Products imported successfully!');
      navigate('/products');
    } catch (err) {
      console.error(err);
      alert('Failed to import products.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/products" className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display-md text-foreground">Bulk Import Products</h1>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-vercel-3 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Upload CSV File</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:opacity-90 file:cursor-pointer"
            />
            <button
              onClick={handleParse}
              disabled={!file}
              className="whitespace-nowrap px-4 py-2 border border-border bg-card text-foreground rounded-full text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Preview Data
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            CSV must include headers: name, selling_price, cost_price, sku, category, stock_quantity
          </p>
        </div>

        {errors.length > 0 && (
          <div className="bg-error-soft border border-destructive/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-destructive font-medium text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Validation Errors ({errors.length})</span>
            </div>
            <ul className="text-sm text-destructive/80 list-disc list-inside pl-4 max-h-40 overflow-y-auto">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        {parsedData.length > 0 && errors.length === 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-link-bg-soft text-link rounded-lg border border-link/20 flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              Ready to import {parsedData.length} products!
            </div>
            <button
              onClick={handleImport}
              disabled={importMutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Upload className="h-4 w-4" />
              {importMutation.isPending ? 'Importing...' : 'Confirm Import'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
