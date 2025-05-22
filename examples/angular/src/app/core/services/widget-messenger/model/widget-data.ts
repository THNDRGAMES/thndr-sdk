import { z } from 'zod';
import { WidgetReceiveType, WidgetSendType } from './message-types';

// Base fields
const BaseDataSchema = z.object({
  message: z.string(),
  source: z.string().optional(),
});

// Variants
const PayInvoiceSchema = BaseDataSchema.extend({
  message: z.literal(WidgetReceiveType.PAY_INVOICE),
  data: z.object({
    invoice: z.string(),
  }),
});

const DemoBalanceUpdateSchema = BaseDataSchema.extend({
  message: z.literal(WidgetReceiveType.DEMO_BALANCE_UPDATE),
  balanceInc: z.number(),
});

const HandleErrorSchema = BaseDataSchema.extend({
  message: z.literal(WidgetReceiveType.HANDLE_PAYMENT_ERROR),
  data: z.object({
    error: z.unknown(),
  }),
});

const AnalyticsEventSchema = BaseDataSchema.extend({
  message: z.literal(WidgetReceiveType.ANALYTICS_EVENT),
  data: z.object({
    eventName: z.string(),
  }),
});

const SimpleMessageSchema = BaseDataSchema.extend({
  message: z.union([
    z.literal(WidgetReceiveType.GET_SDK_VERSION),
    z.literal(WidgetReceiveType.GET_TOKEN),
    z.literal(WidgetReceiveType.GET_BALANCE),
    z.literal(WidgetReceiveType.CANCEL_INVOICE),
    z.literal(WidgetReceiveType.REDIRECT),
    z.literal(WidgetReceiveType.CLOSE),

    z.literal(WidgetSendType.SET_SDK_VERSION),
    z.literal(WidgetSendType.SET_TOKEN),
    z.literal(WidgetSendType.SET_BALANCE),
    z.literal(WidgetSendType.PAYMENT_ERROR_HANDLED),
  ]),
});

export const WidgetDataSchema = z.union([
  PayInvoiceSchema,
  DemoBalanceUpdateSchema,
  HandleErrorSchema,
  AnalyticsEventSchema,
  SimpleMessageSchema,
]);
