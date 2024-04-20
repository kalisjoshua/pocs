import type { ComponentProps } from "../ComponentProps";

function Component({ data, render }: ComponentProps) {
  return <div>Hello 2</div>;
}

const text = "Option 2 (the first alternate)";

export { Component, text };
