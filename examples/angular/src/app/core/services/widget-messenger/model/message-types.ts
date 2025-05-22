export enum WidgetReceiveType {
  GET_SDK_VERSION = 'operator_get_sdk_version', // Get the version of the SDK
  GET_TOKEN = 'operator_get_token', // Request token from the operator
  GET_BALANCE = 'operator_get_balance', // Request balance from the operator
  DEMO_BALANCE_UPDATE = 'operator_demo_balance_update', // Update the balance for demo purposes
  PAY_INVOICE = 'operator_pay_invoice', // Pay an invoice
  CANCEL_INVOICE = 'operator_cancel_invoice', // Cancel an invoice
  REDIRECT = 'operator_redirect', // Redirect the user to a new page
  CLOSE = 'operator_close', // Close the iframe
  HANDLE_PAYMENT_ERROR = 'operator_handle_payment_error', // Handle payment errors
  ANALYTICS_EVENT = 'operator_analytics_event', // Analytics event from the iframe
}

export enum WidgetSendType {
  SET_SDK_VERSION = 'operator_set_sdk_version', // Set the version of the SDK
  SET_TOKEN = 'operator_set_token', // Send token to the iframe
  SET_BALANCE = 'operator_set_balance', // Send the balance to the iframe
  PAYMENT_ERROR_HANDLED = 'operator_payment_error_handled', // Error handled
}
