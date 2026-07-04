import { forecastService } from '../services/forecast.service';
import { db } from '../config/db';

async function generate() {
  const storeId = '5dd99099-1def-40c6-87de-1632f51c5a5d';
  console.log(`Generating forecasts for store ${storeId}...`);
  const result = await forecastService.generateForecasts(storeId);
  console.log(`Done. Products processed: ${result.productsProcessed}`);
  await db.end();
}

generate().catch(e => { console.error(e); process.exit(1); });
