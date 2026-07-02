import { alertRepository } from '../repositories/alert.repository';

export class AlertService {
  async generateAlerts(storeId: string): Promise<{ alertsCreated: number }> {
    let alertsCreated = 0;

    // 1. Low stock alerts
    const lowStockProducts = await alertRepository.findLowStockProducts(storeId);
    for (const product of lowStockProducts) {
      if (product.stock_quantity === 0) {
        // Out of stock — check if we already have an unread alert for this product
        await alertRepository.createAlert(
          storeId, product.id, 'out_of_stock', 'critical',
          `'${product.name}' is out of stock`
        );
      } else {
        await alertRepository.createAlert(
          storeId, product.id, 'low_stock', 'warning',
          `'${product.name}' is low on stock (${product.stock_quantity} remaining, threshold: ${product.low_stock_threshold})`
        );
      }
      alertsCreated++;
    }

    // 2. Dead stock alerts (no sales in 90 days but still in stock)
    const deadStockProducts = await alertRepository.findDeadStock(storeId, 90);
    for (const product of deadStockProducts) {
      await alertRepository.createAlert(
        storeId, product.id, 'dead_stock', 'info',
        `'${product.name}' has ${product.stock_quantity} units but no sales in 90 days`
      );
      alertsCreated++;
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
