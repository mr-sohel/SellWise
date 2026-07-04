import { z } from 'zod';
const productFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
productFiltersSchema.parseAsync(undefined).then(console.log).catch(e => console.log("ERROR", JSON.stringify(e, null, 2)));
