import { z } from 'zod';
import { GameDataSchema } from './game-data';

export const ThndrDataPayloadSchema = z.object({
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
  }, GameDataSchema),
});

export type ThndrDataPayload = z.infer<typeof ThndrDataPayloadSchema>;
