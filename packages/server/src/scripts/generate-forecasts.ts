import { forecastService } from '../services/forecast.service';
import { db } from '../config/db';

async function generate() {
  const storeId = '38a5c61f-4b03-40d0-a63d-093f46dc4279';
  console.log(`Generating forecasts for store ${storeId}...`);
  const result = await forecastService.generateForecasts(storeId);
  console.log(`Done. Products processed: ${result.productsProcessed}`);
  await db.end();
}

generate().catch(e => { console.error(e); process.exit(1); });
