/**
 * Clinch Operator SDK
 *
 * This SDK facilitates secure messaging between the operator's website and a Clinch iframe. 
 * It handles token authentication, redirections, balance checks, and invoice payments via postMessage communication.
 * The SDK also includes a debug mode for logging key events during the integration process.
 */

/**
 * @constant {Object} MessageTypes
 * Defines the different types of messages that can be sent between the operator and the Clinch iframe.
 */
const MessageTypes = Object.freeze({
  GET_TOKEN: "operator_get_token", // Request token from the operator
  SET_TOKEN: "operator_set_token", // Send token to the iframe
  GET_BALANCE: "operator_get_balance", // Request balance from the operator
  REDIRECT: "operator_redirect", // Redirect the user to a new URL
  CLOSE: "operator_close", // Close the Clinch iframe
  PAY_INVOICE: "operator_pay_invoice", // Pay an invoice
});

/**
 * Initializes the Clinch SDK by listening for postMessage events from the iframe and responding accordingly.
 *
 * @async
 * @function loadClinch
 * @param {Object} config - Configuration object for the Clinch SDK.
 * @param {Function} getToken - Callback to retrieve the authentication token.
 * @param {Function} getBalance - Callback to retrieve the user's balance.
 * @param {Function} closeClinch - Callback to close the Clinch iframe.
 * @param {Function} payInvoice - Callback to process invoice payments.
 */
export async function loadClinch(
  config,
  getToken,
  getBalance,
  closeClinch,
  payInvoice
) {
  const origin = config.clinchUrl;
  const redirectUrl = config.redirectUrl;

  /**
   * Logs debug messages to the console when debug mode is enabled.
   *
   * @param {string} message - The debug message to be logged.
   */
  function logDebug(message) {
    if (config.debug) {
      console.debug(`Clinch SDK: ${message}`);
    }
  }

  /**
   * Event listener for incoming postMessage events from the Clinch iframe.
   * Handles messages based on their type (e.g., token requests, balance requests, etc.).
   */
  window.addEventListener("message", async function (event) {
    logDebug(`Received message from origin ${event.origin}`);
    
    // Validate the origin of the message
    if (!isMessageFromClinch(event, origin)) {
      logDebug("Message ignored: not from Clinch.");
      return;
    }

    // Parse the incoming message
    let messageData;
    try {
      messageData = JSON.parse(event.data);
      logDebug(`Parsed message: ${JSON.stringify(messageData)}`);
    } catch (e) {
      console.error("Clinch SDK: Failed to parse message data", e);
      return;
    }

    // Handle the message based on its type
    try {
      await handleMessage(messageData.message, messageData, origin, getToken, getBalance, closeClinch, payInvoice);
    } catch (e) {
      console.error("Clinch SDK: Error handling message", e);
    }
  });

  /**
   * Handles specific message types by executing the appropriate callback or action.
   *
   * @async
   * @function handleMessage
   * @param {string} message - The message type (e.g., GET_TOKEN, REDIRECT).
   * @param {Object} messageData - The full message object received from the iframe.
   * @param {string} origin - The origin of the message (for validation).
   * @param {Function} getToken - Callback to retrieve the authentication token.
   * @param {Function} getBalance - Callback to retrieve the user's balance.
   * @param {Function} closeClinch - Callback to close the Clinch iframe.
   * @param {Function} payInvoice - Callback to process invoice payments.
   */
  async function handleMessage(message, messageData, origin, getToken, getBalance, closeClinch, payInvoice) {
    logDebug(`Handling message: ${message}`);
    switch (message) {
      case MessageTypes.GET_TOKEN:
        postMessage({
          message: MessageTypes.SET_TOKEN,
          token: getToken(),
        }, origin);
        logDebug("Sent token in response to GET_TOKEN");
        break;
      case MessageTypes.REDIRECT:
        window.location.href = redirectUrl;
        logDebug(`Redirected to: ${redirectUrl}`);
        break;
      case MessageTypes.CLOSE:
        closeClinch();
        logDebug("Clinch closed via CLOSE message");
        break;
      case MessageTypes.PAY_INVOICE:
        payInvoice(messageData.invoice);
        logDebug(`Invoice handled: ${JSON.stringify(messageData.invoice)}`);
        break;
      case MessageTypes.GET_BALANCE:
        postMessage({
          message: MessageTypes.SET_TOKEN,
          balance: getBalance(),
        }, origin);
        logDebug("Sent balance in response to GET_BALANCE");
        break;
      default:
        logDebug(`Unknown message type received: ${message}`);
    }
  }
}

/**
 * Validates if a message originates from the expected Clinch iframe.
 *
 * @function isMessageFromClinch
 * @param {Object} event - The postMessage event received from the iframe.
 * @param {string} origin - The expected origin of the iframe (for security validation).
 * @returns {boolean} - Returns true if the message is valid, false otherwise.
 */
function isMessageFromClinch(event, origin) {
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
 * Sends a message to the Clinch iframe via postMessage.
 *
 * @function postMessage
 * @param {Object} messageObject - The message object to send to the iframe.
 * @param {string} origin - The origin of the iframe (for security validation).
 */
function postMessage(messageObject, origin) {
  const messageJSON = JSON.stringify(messageObject);
  const iframe = document.querySelector("iframe");
  if (iframe && iframe.contentWindow) {
    logDebug(`Posting message to iframe: ${messageJSON}`);
    iframe.contentWindow.postMessage(messageJSON, origin);
  } else {
    console.error("Clinch SDK: Unable to find the iframe");
  }
}
