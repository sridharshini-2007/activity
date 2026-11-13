/**
 * FLAT CO2: Regular Expressions & Regular Languages
 * 
 * Demonstrates regular expressions for validating HTTP Request Lines,
 * token sequence patterns, and header structures.
 */

// 1. HTTP Request-Line RFC 2616 specification regex
// Format: Method <SP> Request-URI <SP> HTTP-Version
const HTTP_REQUEST_LINE_REGEX = /^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\s+(\/[a-zA-Z0-9_\-\/\.]*)\s+HTTP\/(1\.[01]|2\.0)$/;

// 2. Regular Language expression for valid session token sequence
// Pattern: Must start with AUTH_LOGIN, can have any number of GET_PROFILE or POST_ORDER, ends with POST_LOGOUT
const VALID_SEQUENCE_REGEX = /^AUTH_LOGIN(\s+(GET_PROFILE|POST_ORDER|PUT_PAYMENT))*\s+POST_LOGOUT$/;

// 3. HTTP Header validation regex: Key: Value
const HTTP_HEADER_REGEX = /^[a-zA-Z0-9\-]+:\s*.+$/;

/**
 * Validates an HTTP Request Line string
 * e.g. "POST /api/v1/orders HTTP/1.1"
 */
function validateRequestLine(input) {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      input,
      error: 'Empty or non-string input provided.',
      regex: HTTP_REQUEST_LINE_REGEX.source
    };
  }

  const trimmed = input.trim();
  const match = trimmed.match(HTTP_REQUEST_LINE_REGEX);

  if (match) {
    return {
      isValid: true,
      input: trimmed,
      regex: HTTP_REQUEST_LINE_REGEX.source,
      parsed: {
        method: match[1],
        uri: match[2],
        protocolVersion: `HTTP/${match[3]}`
      },
      explanation: `Valid HTTP Request Line syntax. Matched Method=${match[1]}, URI=${match[2]}, Version=HTTP/${match[3]}`
    };
  }

  return {
    isValid: false,
    input: trimmed,
    regex: HTTP_REQUEST_LINE_REGEX.source,
    error: 'Does not match standard RFC HTTP Request Line pattern (Method <SP> /path <SP> HTTP/1.x)',
    explanation: 'Check whether HTTP method is in uppercase, path starts with /, and protocol version is HTTP/1.0, HTTP/1.1, or HTTP/2.0.'
  };
}

/**
 * Validates a space-delimited string of sequence tokens against regular language
 */
function validateSequencePattern(tokenString) {
  if (!tokenString || typeof tokenString !== 'string') {
    return {
      isValid: false,
      tokenString,
      regex: VALID_SEQUENCE_REGEX.source,
      error: 'Empty sequence'
    };
  }

  const trimmed = tokenString.trim();
  const isValid = VALID_SEQUENCE_REGEX.test(trimmed);

  return {
    isValid,
    tokenString: trimmed,
    regex: VALID_SEQUENCE_REGEX.source,
    explanation: isValid
      ? 'The token sequence belongs to the regular language defined by ^AUTH_LOGIN (...)* POST_LOGOUT$'
      : 'Sequence rejected: Language requires starting with AUTH_LOGIN and terminating with POST_LOGOUT.'
  };
}

module.exports = {
  HTTP_REQUEST_LINE_REGEX,
  VALID_SEQUENCE_REGEX,
  HTTP_HEADER_REGEX,
  validateRequestLine,
  validateSequencePattern
};
