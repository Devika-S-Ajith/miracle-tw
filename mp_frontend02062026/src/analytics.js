import ReactGA from "react-ga4";

const gaId = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;

export const initGA = () => {
  if (gaId) {
    ReactGA.initialize(gaId, {
      gaOptions: {
        anonymizeIp: true, // extra safety
      },
    });
  }
};

/**
 * Regex patterns
 */

// UUID v1–v5
const UUID_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;

// Numeric IDs inside path segments
const NUMERIC_ID_REGEX = /\/\d+(?=\/|$)/g;

/**
 * Sanitize URL before sending to GA
 */
const sanitizePath = (path) => {
  let cleanPath = path;

  // Mask UUIDs
  cleanPath = cleanPath.replace(UUID_REGEX, ":id");

  // Mask numeric IDs
  cleanPath = cleanPath.replace(NUMERIC_ID_REGEX, "/:id");

  return cleanPath;
};

export const logPageView = () => {
  const cleanPath = sanitizePath(window.location.pathname);

  ReactGA.send({
    hitType: "pageview",
    page: cleanPath,
  });
};

export const logEvent = (eventName, eventParams = {}) => {
  ReactGA.event(eventName, eventParams);
};