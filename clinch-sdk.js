/** clinch-operator-sdk.js
 * Clinch Operator SDK
 *
 * This SDK enables secure messaging between the operator's website
 * and the Clinch iframe. It handles token authentication requests, redirections,
 * and ensures messages are only processed from the trusted Clinch iframe.
 */ 

const MessageTypes = {
  GET_TOKEN: "operator_get_token",
  SET_TOKEN: "operator_set_token",
  REDIRECT: "operator_redirect"
};

/**
 * Initializes the Clinch SDK by setting up the message event listener.
 * @param {string} origin - The origin iFrame URL to validate messages from.
 * @param {string} redirectUrl - The URL to redirect to.
 * @param {function} getTokenCallback - A callback function that returns the token.
 */
export function loadClinch(origin, redirect, getTokenCallback) {
  // Setup the listener to receive events from the iFrame
  window.addEventListener('message', function(event) {
    if (!isMessageFromClinch(event, origin)) {
      return;
    }

    let messageData;
    try {
      messageData = JSON.parse(event.data);
    } catch (e) {
      console.error('IFRAME: Failed to parse message data:', e);
      return;
    }

    const message = messageData.message;
    try {
      if (message === MessageTypes.GET_TOKEN) {
        const token = getTokenCallback();
        setToken(token, origin);
      } else if (message == MessageTypes.REDIRECT) {
        window.location.href = redirect;
      }
    } catch (e) {
      console.error('IFRAME: Error handling message:', e);
    }
  });
}

/**
 * Checks if the message is from Clinch and is valid.
 * @param {MessageEvent} event - The message event.
 * @param {string} origin - The origin URL to validate messages from.
 * @returns {boolean} - True if the message is from Clinch and valid, otherwise false.
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
 * Sends the token to the Clinch iframe.
 * @param {string} token - The token to send.
 * @param {string} origin - The origin URL of the iframe.
 */
function setToken(token, origin) {
  const tokenObject = {
    message: MessageTypes.SET_TOKEN,
    token,
  };
  const tokenObjectJSON = JSON.stringify(tokenObject);
  const iframe = document.querySelector("iframe");

  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(tokenObjectJSON, origin);
  } else {
    console.error('IFRAME: Unable to find the iframe to send the token');
  }
}
