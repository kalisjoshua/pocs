export const debounce = (fn: Function, delay = 200) => {
  let pending: ReturnType<typeof setTimeout>;

  return (...args: unknown[]) => {
    pending && clearTimeout(pending);
    pending = setTimeout(fn.bind(this, ...args), delay);
  };
};
