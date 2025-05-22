import { z } from 'zod';

export const ThndrPayloadSchema = z.object({
  origin: z.string(),
  data: z.preprocess(
    (raw: unknown) => {
      if (typeof raw !== 'string') {
        return undefined;
      }

      try {
        const parsed = JSON.parse(raw);
        // Only accept if it's an object and has a 'message' key
        if (typeof parsed === 'object' && parsed !== null && 'message' in parsed) {
          return parsed;
        }
        return undefined;
      } catch {
        return undefined;
      }
    },
    z.object({ message: z.unknown() }),
  ),
});
