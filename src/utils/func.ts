// debounce prevents the func from executing, unless the debounce function is not called until timeout expires.
// default timeout of 1500ms.
export const debounce = (func, timeout = 1500) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}