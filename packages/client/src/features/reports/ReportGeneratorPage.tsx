import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useDashboard } from '../dashboard/hooks/useDashboard';
import { useAuthStore } from '../../stores/auth.store';
import { FileDown, Calendar } from 'lucide-react';
import { PageHeader } from '../../components/ui/page-header';

export function ReportGeneratorPage() {
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';
  const [range, setRange] = useState('30d');

  const { data, isLoading } = useDashboard(storeId, range);

  const generatePDF = () => {
    if (!data) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('SellWise Analytics Report', 14, 22);

    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Reporting Period: Last ${range}`, 14, 36);

    doc.setFontSize(14);
    doc.text('Performance Summary', 14, 50);

    autoTable(doc, {
      startY: 55,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', `BDT ${Number(data.revenue).toLocaleString()}`],
        ['Total Orders', data.orders.toString()],
        ['Revenue Growth', `${data.revenueGrowth}%`],
        ['Health Score', `${data.healthScore}/100`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [23, 23, 23] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 55;
    doc.text('Top Performing Products', 14, finalY + 15);

    const productData = data.topProducts.map(p => [
      p.productName,
      p.unitsSold.toString(),
      `BDT ${Number(p.revenue).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Product Name', 'Units Sold', 'Revenue']],
      body: productData,
      theme: 'striped',
      headStyles: { fillColor: [23, 23, 23] }
    });

    const topProdY = (doc as any).lastAutoTable.finalY || finalY + 20;
    doc.setFontSize(14);
    doc.text('Inventory Status', 14, topProdY + 15);

    autoTable(doc, {
      startY: topProdY + 20,
      head: [['Metric', 'Value']],
      body: [
        ['Total Inventory Value', `BDT ${Number(data.inventoryStatus.totalValue).toLocaleString()}`],
        ['Inventory Turnover Rate', data.inventoryStatus.turnoverRate.toString()],
      ],
      theme: 'grid',
      headStyles: { fillColor: [23, 23, 23] }
    });

    const invY = (doc as any).lastAutoTable.finalY || topProdY + 20;

    if (invY > 230) {
      doc.addPage();
    }

    const page2Y = invY > 230 ? 20 : invY + 15;
    doc.setFontSize(14);
    doc.text('Customer Insights', 14, page2Y);

    autoTable(doc, {
      startY: page2Y + 5,
      head: [['Metric', 'Value']],
      body: [
        ['Total Customers (Period)', data.customerInsights.totalCustomers.toString()],
        ['Retained Customers', data.customerInsights.retainedCustomers.toString()],
        ['Retention Rate', `${data.customerInsights.retentionRate}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [23, 23, 23] }
    });

    doc.save(`sellwise_report_${range}_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="w-full space-y-6 max-w-[1600px] mx-auto">
      <PageHeader title="Reports" />

      <div className="bg-card border border-border p-8 rounded-xl shadow-vercel-3 space-y-8">
        <div>
          <h2 className="text-lg font-medium mb-2">Generate PDF Report</h2>
          <p className="text-sm text-body">
            Download a comprehensive summary of your store's performance, including revenue, growth metrics, and top products.
          </p>
        </div>

        <div className="flex items-center gap-6 p-6 bg-canvas-soft rounded-xl border border-border">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Reporting Period
            </label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="flex h-12 w-full rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-muted-foreground appearance-none"
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
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 min-w-[200px]"
            >
              <FileDown className="h-5 w-5" />
              {isLoading ? 'Loading Data...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {data && (
          <div className="text-sm text-body pt-4 border-t border-border">
            <strong>Preview:</strong> This report will include {data.orders} orders totaling ৳{Number(data.revenue).toLocaleString()} in revenue for the selected period.
          </div>
        )}
      </div>
    </div>
  );
}
