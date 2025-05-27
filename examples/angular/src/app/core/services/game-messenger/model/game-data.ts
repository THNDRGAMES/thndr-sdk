import { z } from 'zod';
import { GameReceiveType, GameSendType } from './message-types';

// Base fields
const BaseDataSchema = z.object({
  message: z.string(),
  source: z.string().optional(),
});

// Variants
const PayInvoiceSchema = BaseDataSchema.extend({
  message: z.literal(GameReceiveType.PAY_INVOICE),
  data: z.object({
    invoice: z.string(),
  }),
});

const HandleErrorSchema = BaseDataSchema.extend({
  message: z.literal(GameReceiveType.HANDLE_PAYMENT_ERROR),
  data: z.object({
    error: z.unknown(),
  }),
});

const AnalyticsEventSchema = BaseDataSchema.extend({
  message: z.literal(GameReceiveType.ANALYTICS_EVENT),
  data: z.object({
    eventName: z.string(),
  }),
});

const SimpleMessageSchema = BaseDataSchema.extend({
  message: z.union([
    z.literal(GameReceiveType.GET_SDK_VERSION),
    z.literal(GameReceiveType.GET_TOKEN),
    z.literal(GameReceiveType.GET_BALANCE),
    z.literal(GameReceiveType.CANCEL_INVOICE),
    z.literal(GameReceiveType.REDIRECT),
    z.literal(GameReceiveType.CLOSE),

    z.literal(GameSendType.SET_SDK_VERSION),
    z.literal(GameSendType.SET_TOKEN),
    z.literal(GameSendType.SET_BALANCE),
    z.literal(GameSendType.PAYMENT_ERROR_HANDLED),
  ]),
});

export const GameDataSchema = z.union([
  PayInvoiceSchema,
  HandleErrorSchema,
  AnalyticsEventSchema,
  SimpleMessageSchema,
]);
