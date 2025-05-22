import { z } from 'zod';
import { WidgetDataSchema } from './widget-data';

export const WidgetPayloadSchema = z.object({
  origin: z.string(),
  data: z.preprocess((raw) => {
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        // leave it unparsed so Zod will complain
        return raw;
      }
    }
    return raw;
  }, WidgetDataSchema),
});

export type WidgetPayload = z.infer<typeof WidgetPayloadSchema>;
