import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImportedProduct {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  costPrice: number;
}

interface ImportProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (products: ImportedProduct[]) => Promise<void>;
}

export const ImportProductsDialog = ({
  open,
  onOpenChange,
  onImport,
}: ImportProductsDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ImportedProduct[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const resetState = () => {
    setFile(null);
    setParsedProducts([]);
    setErrors([]);
    setProgress(0);
    setImporting(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    
    if (!validTypes.includes(selectedFile.type) && 
        !selectedFile.name.endsWith('.xlsx') && 
        !selectedFile.name.endsWith('.xls') && 
        !selectedFile.name.endsWith('.csv')) {
      setErrors(['Please upload an Excel (.xlsx, .xls) or CSV file']);
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

      if (jsonData.length < 2) {
        setErrors(['File is empty or has no data rows']);
        return;
      }

      // Get headers (first row)
      const headers = jsonData[0].map(h => String(h).toLowerCase().trim());
      
      // Map column indices
      const columnMap = {
        name: headers.findIndex(h => h.includes('name') || h.includes('product')),
        sku: headers.findIndex(h => h.includes('sku') || h.includes('code') || h.includes('id')),
        category: headers.findIndex(h => h.includes('category') || h.includes('type')),
        quantity: headers.findIndex(h => h.includes('quantity') || h.includes('stock') || h.includes('qty')),
        minStock: headers.findIndex(h => h.includes('min') || h.includes('threshold') || h.includes('reorder')),
        price: headers.findIndex(h => h.includes('price') || h.includes('sell')),
        costPrice: headers.findIndex(h => h.includes('cost') || h.includes('purchase')),
      };

      const parseErrors: string[] = [];
      const products: ImportedProduct[] = [];

      // Parse data rows
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0 || row.every(cell => !cell)) continue;

        const name = columnMap.name >= 0 ? String(row[columnMap.name] || '').trim() : '';
        const sku = columnMap.sku >= 0 ? String(row[columnMap.sku] || '').trim() : `SKU-${Date.now()}-${i}`;
        const category = columnMap.category >= 0 ? String(row[columnMap.category] || 'Uncategorized').trim() : 'Uncategorized';
        const quantity = columnMap.quantity >= 0 ? parseInt(String(row[columnMap.quantity])) || 0 : 0;
        const minStock = columnMap.minStock >= 0 ? parseInt(String(row[columnMap.minStock])) || 10 : 10;
        const price = columnMap.price >= 0 ? parseFloat(String(row[columnMap.price])) || 0 : 0;
        const costPrice = columnMap.costPrice >= 0 ? parseFloat(String(row[columnMap.costPrice])) || 0 : 0;

        if (!name) {
          parseErrors.push(`Row ${i + 1}: Missing product name`);
          continue;
        }

        products.push({
          name,
          sku,
          category,
          quantity,
          minStock,
          price,
          costPrice,
        });
      }

      setParsedProducts(products);
      setErrors(parseErrors);

    } catch (error) {
      setErrors(['Failed to parse file. Please check the format.']);
    }
  };

  const handleImport = async () => {
    if (parsedProducts.length === 0) return;

    setImporting(true);
    setProgress(0);

    try {
      await onImport(parsedProducts);
      setProgress(100);
      setTimeout(() => {
        onOpenChange(false);
        resetState();
      }, 500);
    } catch (error) {
      setErrors(['Failed to import products. Please try again.']);
      setImporting(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!importing) {
      onOpenChange(open);
      if (!open) resetState();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Products
          </DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file with your product data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          {!file && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground mt-1">
                Excel (.xlsx, .xls) or CSV files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Selected File */}
          {file && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {parsedProducts.length} products found
                  </p>
                </div>
              </div>
              {!importing && (
                <Button variant="ghost" size="icon" onClick={resetState}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ScrollArea className="max-h-24">
                  {errors.map((error, i) => (
                    <div key={i}>{error}</div>
                  ))}
                </ScrollArea>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {parsedProducts.length > 0 && (
            <div>
              <p className="font-medium mb-2">Preview (first 5 products)</p>
              <ScrollArea className="h-48 border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">SKU</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-right p-2">Qty</th>
                      <th className="text-right p-2">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedProducts.slice(0, 5).map((product, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{product.name}</td>
                        <td className="p-2 text-muted-foreground">{product.sku}</td>
                        <td className="p-2">{product.category}</td>
                        <td className="p-2 text-right">{product.quantity}</td>
                        <td className="p-2 text-right">${product.price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
              {parsedProducts.length > 5 && (
                <p className="text-sm text-muted-foreground mt-2">
                  ...and {parsedProducts.length - 5} more products
                </p>
              )}
            </div>
          )}

          {/* Import Progress */}
          {importing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm">Importing products...</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Expected Format Info */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">Expected columns:</p>
            <p>Name (required), SKU, Category, Quantity, Min Stock, Price, Cost Price</p>
            <p className="mt-1">The importer will try to match column headers automatically.</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleClose(false)} disabled={importing}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={parsedProducts.length === 0 || importing}
            >
              {importing ? 'Importing...' : `Import ${parsedProducts.length} Products`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};