/**
 * THNDR Operator SDK Type Definitions
 * 
 * This file provides TypeScript type definitions for the THNDR SDK.
 */

/**
 * Message types used for communication between the operator and the THNDR iframe.
 */
declare const MessageTypes: {
  readonly GET_SDK_VERSION: "operator_get_sdk_version";
  readonly SET_SDK_VERSION: "operator_set_sdk_version";
  readonly GET_TOKEN: "operator_get_token";
  readonly SET_SDK_TOKEN: "operator_set_token";
  readonly GET_BALANCE: "operator_get_balance";
  readonly SET_BALANCE: "operator_set_balance";
  readonly DEMO_BALANCE_UPDATE: "operator_demo_balance_update";
  readonly PAY_INVOICE: "operator_pay_invoice";
  readonly CANCEL_INVOICE: "operator_cancel_invoice";
  readonly REDIRECT: "operator_redirect";
  readonly CLOSE: "operator_close";
  readonly HANDLE_ERROR: "operator_handle_error";
  readonly ERROR_HANDLED: "operator_error_handled";
};

/**
 * SDK version string.
 */
declare const SDK_VERSION: string;

/**
 * Demo balance for testing purposes.
 */
declare const demoBalance: number;

/**
 * Flag to enable or disable logging.
 */
declare const loggingEnabled: boolean;

/**
 * Tells the THNDR iframe that this invoice is not going to be paid and to disregard.
 * 
 * @param invoice - The invoice to cancel.
 * @param origin - The origin of the iframe.
 */
declare function cancelInvoice(invoice: any, origin: string): void;

/**
 * Enables logging for debugging purposes.
 */
declare function enableLogging(): void;

/**
 * Initializes the THNDR SDK by listening for postMessage events from the iframe and responding accordingly.
 *
 * @param iframeId - The id of the iframe.
 * @param iframeUrl - The url of the iframe.
 * @param getToken - Callback to retrieve the authentication token.
 * @param getBalance - Callback to retrieve the user's balance.
 * @param closeIframe - Callback to close the iframe.
 * @param handleError - Callback to handle an error.
 * @param onPayInvoice - Optional callback to process invoice payments.
 */
declare function initGame(
  iframeId: string,
  iframeUrl: string,
  getToken: () => string | Promise<string>,
  getBalance: () => { balance: number; currency: string } | Promise<{ balance: number; currency: string }>,
  closeIframe: () => void,
  handleError: (error: { code: string }) => boolean | Promise<boolean>,
  onPayInvoice?: (invoice: any) => void
): Promise<void>;

/**
 * Sends a message to the THNDR iframe via postMessage.
 *
 * @param messageObject - The message object to send to the iframe.
 * @param origin - The origin of the iframe (for security validation).
 * @param iframeId - The id of the iframe.
 */
declare function postMessage(messageObject: any, origin: string, iframeId?: string): void;

/**
 * Waits for an element to be added to the DOM.
 *
 * @param selector - The CSS selector for the element to wait for.
 * @returns A promise that resolves when the element is found.
 */
declare function waitForElm(selector: string): Promise<Element>;

/**
 * Validates if a message originates from the expected THNDR iframe.
 *
 * @param event - The postMessage event received from the iframe.
 * @param origin - The expected origin of the iframe (for security validation).
 * @returns Returns true if the message is valid, false otherwise.
 */
declare function isMessageFromTHNDR(event: MessageEvent, origin: string): boolean; 