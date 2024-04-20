import { useReducer } from "react";

import type { ComponentProps } from "../ComponentProps";

type ComponentSate = {
  data: ComponentProps["data"];
  term: string;
};

function Component({ data, render }: ComponentProps) {
  const [state, dispatch] = useReducer(
    (_previousState: ComponentSate, term: string) => ({
      data: data.filter((row) => {
        const text = Object.values(row).join(" ").toLowerCase();

        return term
          .toLowerCase()
          .split(/\s+/)
          .filter((str) => str.length > 1)
          .every((part) => text.includes(part));
      }),
      term,
    }),
    { data, term: "" },
  );

  return (
    <div>
      <div className="flex pb-3 pt-3">
        <input
          className="border p-2 w-full"
          onChange={(e) => dispatch(e.target.value)}
          type="text"
          value={state.term}
        />
      </div>

      {render(state.data)}
    </div>
  );
}

const text = "Option 1 (the standard)";

export { Component, text };
