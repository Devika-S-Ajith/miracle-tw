const CustomEventService = {
  on: (eventName, listener) => {
    document.addEventListener(eventName, listener);
  },
  off: (eventName, listener) => {
    document.removeEventListener(eventName, listener);
  },
  dispatch: (eventName, data) => {
    const id = getUniqueId();
    const event = new CustomEvent(eventName, { detail: { id, data } });
    document.dispatchEvent(event);
  },
};
export default CustomEventService;

function getUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36);
}
