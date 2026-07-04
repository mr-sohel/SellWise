import { alertRepository } from '../repositories/alert.repository';

export class AlertService {
  async generateAlerts(storeId: string): Promise<{ alertsCreated: number }> {
    let alertsCreated = 0;

    // 1. Low stock alerts (stock < predicted demand)
    const lowStockProducts = await alertRepository.findLowStockProducts(storeId, 30);
    const newAlerts = [];
    
    for (const product of lowStockProducts) {
      if (product.stock_quantity === 0) {
        newAlerts.push({
          storeId, productId: product.id, alertType: 'out_of_stock', severity: 'critical',
          message: `'${product.name}' is out of stock`
        });
      } else {
        const safetyBuffer = product.predicted_demand * 0.2;
        const reorderQty = Math.ceil((product.predicted_demand + safetyBuffer) - product.stock_quantity);
        newAlerts.push({
          storeId, productId: product.id, alertType: 'low_stock', severity: 'warning',
          message: `${product.name} — current stock: ${product.stock_quantity}, predicted demand: ${Math.round(product.predicted_demand)} in 30 days. Restock recommended: ${reorderQty} units`
        });
      }
    }
    
    const deadStockProducts = await alertRepository.findDeadStock(storeId, 60);
    for (const product of deadStockProducts) {
      newAlerts.push({
        storeId, productId: product.id, alertType: 'dead_stock', severity: 'info',
        message: `'${product.name}' has ${product.stock_quantity} units but no sales in 60 days`
      });
    }

    if (newAlerts.length > 0) {
      await alertRepository.bulkCreateAlerts(newAlerts);
      alertsCreated = newAlerts.length;
    }

    return { alertsCreated };
  }

  async getAlerts(storeId: string, unreadOnly: boolean = false) {
    return alertRepository.findByStore(storeId, unreadOnly);
  }

  async markAsRead(id: string, storeId: string) {
    return alertRepository.markAsRead(id, storeId);
  }

  async markAllAsRead(storeId: string) {
    return alertRepository.markAllAsRead(storeId);
  }
}

export const alertService = new AlertService();
