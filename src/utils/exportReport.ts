import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, Sale } from '@/hooks/useInventory';

interface ReportData {
  products: Product[];
  sales: Sale[];
  stats: {
    inventoryValue: number;
    totalSales: number;
    potentialProfit: number;
    profitMargin: string;
  };
  categoryData: { name: string; count: number; value: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const exportToExcel = (data: ReportData, businessName: string = 'Shop') => {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['Shop Report - ' + businessName],
    ['Generated on: ' + formatDate(new Date())],
    [''],
    ['Key Metrics'],
    ['Inventory Value', formatCurrency(data.stats.inventoryValue)],
    ['Total Sales', formatCurrency(data.stats.totalSales)],
    ['Potential Profit', formatCurrency(data.stats.potentialProfit)],
    ['Profit Margin', data.stats.profitMargin + '%'],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Products Sheet
  const productsHeader = ['Name', 'SKU', 'Category', 'Quantity', 'Min Stock', 'Cost Price', 'Selling Price', 'Stock Value'];
  const productsRows = data.products.map(p => [
    p.name,
    p.sku,
    p.category,
    p.quantity,
    p.minStock,
    formatCurrency(p.costPrice),
    formatCurrency(p.price),
    formatCurrency(p.quantity * p.costPrice),
  ]);
  const productsSheet = XLSX.utils.aoa_to_sheet([productsHeader, ...productsRows]);
  XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');

  // Sales Sheet
  const salesHeader = ['Date', 'Product', 'Quantity', 'Unit Price', 'Total Amount'];
  const salesRows = data.sales.map(s => [
    formatDate(s.date),
    s.productName,
    s.quantity,
    formatCurrency(s.unitPrice),
    formatCurrency(s.totalAmount),
  ]);
  const salesSheet = XLSX.utils.aoa_to_sheet([salesHeader, ...salesRows]);
  XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales');

  // Category Distribution Sheet
  const categoryHeader = ['Category', 'Product Count', 'Total Value'];
  const categoryRows = data.categoryData.map(c => [
    c.name,
    c.count,
    formatCurrency(c.value),
  ]);
  const categorySheet = XLSX.utils.aoa_to_sheet([categoryHeader, ...categoryRows]);
  XLSX.utils.book_append_sheet(workbook, categorySheet, 'Categories');

  // Top Products Sheet
  const topHeader = ['Product', 'Units Sold', 'Revenue'];
  const topRows = data.topProducts.map(t => [
    t.name,
    t.quantity,
    formatCurrency(t.revenue),
  ]);
  const topSheet = XLSX.utils.aoa_to_sheet([topHeader, ...topRows]);
  XLSX.utils.book_append_sheet(workbook, topSheet, 'Top Products');

  // Download
  XLSX.writeFile(workbook, `${businessName}_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToPDF = (data: ReportData, businessName: string = 'Shop') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`${businessName} - Complete Report`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${formatDate(new Date())}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Key Metrics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Metrics', 14, yPos);
  yPos += 8;

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: [
      ['Inventory Value', formatCurrency(data.stats.inventoryValue)],
      ['Total Sales', formatCurrency(data.stats.totalSales)],
      ['Potential Profit', formatCurrency(data.stats.potentialProfit)],
      ['Profit Margin', data.stats.profitMargin + '%'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Category Distribution
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Inventory by Category', 14, yPos);
  yPos += 8;

  if (data.categoryData.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Products', 'Value']],
      body: data.categoryData.map(c => [c.name, c.count.toString(), formatCurrency(c.value)]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('No category data available', 14, yPos);
    yPos += 15;
  }

  // Top Selling Products
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Selling Products', 14, yPos);
  yPos += 8;

  if (data.topProducts.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Product', 'Units Sold', 'Revenue']],
      body: data.topProducts.map(t => [t.name, t.quantity.toString(), formatCurrency(t.revenue)]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('No sales data available', 14, yPos);
    yPos += 15;
  }

  // Products Inventory - New Page
  doc.addPage();
  yPos = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Products Inventory', 14, yPos);
  yPos += 8;

  if (data.products.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Name', 'SKU', 'Category', 'Qty', 'Price', 'Value']],
      body: data.products.map(p => [
        p.name,
        p.sku,
        p.category,
        p.quantity.toString(),
        formatCurrency(p.price),
        formatCurrency(p.quantity * p.costPrice),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('No products in inventory', 14, yPos);
  }

  // Sales History - New Page
  doc.addPage();
  yPos = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Sales History', 14, yPos);
  yPos += 8;

  if (data.sales.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Product', 'Qty', 'Unit Price', 'Total']],
      body: data.sales.map(s => [
        formatDate(s.date),
        s.productName,
        s.quantity.toString(),
        formatCurrency(s.unitPrice),
        formatCurrency(s.totalAmount),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('No sales recorded', 14, yPos);
  }

  // Download
  doc.save(`${businessName}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
