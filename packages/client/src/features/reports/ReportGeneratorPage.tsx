import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useDashboard } from '../dashboard/hooks/useDashboard';
import { useAuthStore } from '../../stores/auth.store';
import { FileDown, Calendar } from 'lucide-react';

export function ReportGeneratorPage() {
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';
  const [range, setRange] = useState('30d');

  const { data, isLoading } = useDashboard(storeId, range);

  const generatePDF = () => {
    if (!data) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('SellWise Analytics Report', 14, 22);

    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Reporting Period: Last ${range}`, 14, 36);

    // KPI Summary
    doc.setFontSize(14);
    doc.text('Performance Summary', 14, 50);

    autoTable(doc, {
      startY: 55,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', `BDT ${data.revenue.toLocaleString()}`],
        ['Total Orders', data.orders.toString()],
        ['Revenue Growth', `${data.revenueGrowth}%`],
        ['Health Score', `${data.healthScore}/100`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [170, 59, 255] }
    });

    // Top Products
    const finalY = (doc as any).lastAutoTable.finalY || 55;
    doc.text('Top Performing Products', 14, finalY + 15);

    const productData = data.topProducts.map(p => [
      p.productName,
      p.unitsSold.toString(),
      `BDT ${p.revenue.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Product Name', 'Units Sold', 'Revenue']],
      body: productData,
      theme: 'striped',
      headStyles: { fillColor: [170, 59, 255] }
    });

    doc.save(`sellwise_report_${range}_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          Reports
        </h1>
      </div>

      <div className="bg-card border border-border p-8 rounded-xl shadow-sm space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Generate PDF Report</h2>
          <p className="text-muted-foreground">
            Download a comprehensive summary of your store's performance, including revenue, growth metrics, and top products.
          </p>
        </div>

        <div className="flex items-center gap-6 p-6 bg-muted/30 rounded-lg border border-border">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              Reporting Period
            </label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-input rounded-md shadow-sm text-sm outline-none"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>

          <div className="pt-7">
            <button
              onClick={generatePDF}
              disabled={isLoading || !data}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 rounded-md shadow text-sm font-medium transition-opacity disabled:opacity-50 min-w-[200px]"
            >
              <FileDown className="mr-2 h-5 w-5" />
              {isLoading ? 'Loading Data...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {data && (
          <div className="text-sm text-muted-foreground pt-4 border-t border-border">
            <strong>Preview:</strong> This report will include {data.orders} orders totaling ৳{data.revenue.toLocaleString()} in revenue for the selected period.
          </div>
        )}
      </div>
    </div>
  );
}