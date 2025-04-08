/**
 * THNDR Operator SDK
 *
 * This SDK facilitates secure messaging between the operator's website and a THNDR iframe. 
 * It handles token authentication, balance checks, and invoice payments via postMessage communication.
 * The SDK also includes a debug mode for logging key events during the integration process.
 */

/**
 * @constant {Object} MessageTypes
 * Defines the different types of messages that can be sent between the operator and the THNDR iframe.
 */
const MessageTypes = Object.freeze({
  GET_CONFIG: "operator_get_config", // Request the configuration from the operator
  SET_CONFIG: "operator_set_config", // Set the configuration for the THNDR SDK
  GET_TOKEN: "operator_get_token", // Request token from the operator
  SET_TOKEN: "operator_set_token", // Send token to the iframe
  GET_BALANCE: "operator_get_balance", // Request balance from the operator
  SET_BALANCE: "operator_set_balance", // Send the balance to the iframe
  DEMO_BALANCE_UPDATE: "operator_demo_balance_update", // Update the balance for demo purposes
  PAY_INVOICE: "operator_pay_invoice", // Pay an invoice
  CANCEL_INVOICE: "operator_cancel_invoice", // Cancel an invoice
  REDIRECT: "operator_redirect", // Redirect the user to a new page
  CLOSE: "operator_close", // Close the iframe
  HANDLE_ERROR: "operator_handle_error", // Handle errors
  ERROR_HANDLED: "operator_error_handled", // Error handled
});

export var demoBalance = 20000; // 200.00 USD
export var loggingEnabled = false; // Enable logging for debugging

/**
 * Tells the THNDR iframe that this invoice is not going to be paid and to disregard.
 */
export function cancelInvoice(invoice, origin) {
  postMessage({
    message: MessageTypes.CANCEL_INVOICE,
    invoice,
  }, origin);
}

export function enableLogging() {
  loggingEnabled = true;
}

/**
 * Initializes the THNDR SDK by listening for postMessage events from the iframe and responding accordingly.
 *
 * @async
 * @function initGame
 * @param {Object} config - Configuration object for the THNDR SDK.
 * @param {Function} getToken - Callback to retrieve the authentication token.
 * @param {Function} getBalance - Callback to retrieve the user's balance.
 * @param {Function} closeIframe - Callback to close the iframe.
 * @param {Function} handleError - Callback to handle an error.
 * @param {Function} [onPayInvoice] - Optional callback to process invoice payments.
 */
export async function initGame(
  config,
  getToken,
  getBalance,
  closeIframe,
  handleError,
  onPayInvoice = null
) {
  const origin = config.THNDRUrl;
  const iframeId = config.iframeId ? `#${config.iframeId}` : 'frame';

  await waitForElm(iframeId);

  postMessage({
    message: MessageTypes.SET_CONFIG,
    config,
  }, origin, iframeId);

  /**
   * Logs debug messages to the console when debug mode is enabled.
   *
   * @param {string} message - The debug message to be logged.
   */
  function logDebug(message) {
    if (loggingEnabled) {
      console.log(`THNDR SDK: ${message}`);
    }
  }

  /**
   * Event listener for incoming postMessage events from the THNDR iframe.
   * Handles messages based on their type (e.g., token requests, balance requests, etc.).
   */
  window.addEventListener("message", async function (event) {
    // Validate the origin of the message
    if (!isMessageFromTHNDR(event, origin)) {
      return;
    }

    logDebug(`Received message from origin ${event.origin}`);
    
    // Parse the incoming message
    let messageData;
    try {
      messageData = JSON.parse(event.data);
      logDebug(`Message: ${JSON.stringify(messageData.message)}`);
    } catch (e) {
      console.error("THNDR SDK: Failed to parse message data", e);
      return;
    }

    // Handle the message based on its type
    try {
      await handleMessage(messageData.message, messageData, origin, iframeId, getToken, getBalance, closeIframe, onPayInvoice);
    } catch (e) {
      console.error("THNDR SDK: Error handling message", e);
    }
  });

  /**
   * Handles specific message types by executing the appropriate callback or action.
   *
   * @async
   * @function handleMessage
   * @param {string} message - The message type (e.g., GET_TOKEN).
   * @param {Object} messageData - The full message object received from the iframe.
   * @param {string} origin - The origin of the message (for validation).
   * @param {string} iframeId - The iframe id
   * @param {Function} getToken - Callback to retrieve the authentication token.
   * @param {Function} getBalance - Callback to retrieve the user's balance.
   * @param {Function} onPayInvoice - Callback to process invoice payments.
   */
  async function handleMessage(message, messageData, origin, iframeId, getToken, getBalance, closeIframe, onPayInvoice) {
    logDebug(`Handling message: ${message}`);
    switch (message) {
      case MessageTypes.GET_CONFIG:
        logDebug("Sent config in response to SET_CONFIG");
        postMessage({
          message: MessageTypes.SET_CONFIG,
          config: config,
        }, origin, iframeId);
        break;
      case MessageTypes.GET_TOKEN:
        logDebug("Sent token in response to GET_TOKEN");
        postMessage({
          message: MessageTypes.SET_TOKEN,
          token: await Promise.resolve(getToken()),
        }, origin, iframeId);
        break;
      case MessageTypes.PAY_INVOICE:
        if (onPayInvoice) {
          logDebug(`Invoice received: ${JSON.stringify(messageData.data.invoice)}`);
          onPayInvoice(messageData.data.invoice);
        }
        break;
      case MessageTypes.GET_BALANCE:
        logDebug("Sent balance in response to GET_BALANCE");
        const balance = await Promise.resolve(getBalance());
        postMessage({
          message: MessageTypes.SET_BALANCE,
          balance: balance.balance,
          currency: balance.currency,
        }, origin, iframeId);
        break;
      case MessageTypes.REDIRECT:
      case MessageTypes.CLOSE:
        closeIframe();
        break;
      case MessageTypes.DEMO_BALANCE_UPDATE:
        demoBalance += messageData.data.balanceInc;
        break;
      case MessageTypes.HANDLE_ERROR:
        logDebug("Error received from iframe HANDLE_ERROR");
        postMessage({
          message: MessageTypes.ERROR_HANDLED,
          handled: await Promise.resolve(handleError(messageData.data.error)),
        }, origin, iframeId);
        break;
      default:
        logDebug(`Unknown message type received: ${message}`);
    }
  }
}

/**
 * Validates if a message originates from the expected THNDR iframe.
 *
 * @function isMessageFromTHNDR
 * @param {Object} event - The postMessage event received from the iframe.
 * @param {string} origin - The expected origin of the iframe (for security validation).
 * @returns {boolean} - Returns true if the message is valid, false otherwise.
 */
function isMessageFromTHNDR(event, origin) {
  if (event.origin !== origin) {
    return false;
  }
  try {
    const data = JSON.parse(event.data);
    return Object.values(MessageTypes).includes(data.message);
  } catch (e) {
    return false;
  }
}

/**
 * Sends a message to the THNDR iframe via postMessage.
 *
 * @function postMessage
 * @param {Object} messageObject - The message object to send to the iframe.
 * @param {string} origin - The origin of the iframe (for security validation).
 */
export function postMessage(messageObject, origin, iframeId) {
  const messageJSON = JSON.stringify(messageObject);
  const iframe = document.querySelector(iframeId);
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(messageJSON, origin);
  } else {
    console.error("THNDR SDK: Unable to find the iframe");
  }
}


function waitForElm(selector) {
  return new Promise(resolve => {
      if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(mutations => {
          if (document.querySelector(selector)) {
              observer.disconnect();
              resolve(document.querySelector(selector));
          }
      });

      observer.observe(document.body, {
          childList: true,
          subtree: true
      });
  });
}