"use client";

import { useState } from "react";

import type { Asset } from "./Asset";
import type { ComponentProps } from "./ComponentProps";

import raw from "../assets.json";

import * as option1 from "./options/one";
import * as option2 from "./options/two";

interface Option {
  Component: (props: ComponentProps) => JSX.Element;
  text: string;
}

// .container {
//   display: grid;
//   grid-template-columns: 50px 50px 50px 50px;
//   grid-template-rows: auto;
//   grid-template-areas:
//     "header header header header"
//     "main main . sidebar"
//     "footer footer footer footer";

//   grid-template-areas:
//     "name        tags      type       date_added"
//     "folder"
//     "addedBy     assignedTo"
//     "keywords"
//     "notes"
// }

const columns: Array<[string, keyof Asset, number]> = [
  ["Name", "name", 8],
  ["Tags", "tags", 6], // render tags fn
  ["Type", "type", 2],
  ["Date Added", "date_added", 2],

  ["Folder", "folder", 0],
  ["Added By", "addedBy", 0],
  ["Assigned Salespersons", "assignedTo", 0],
  ["Keywords", "keywords", 0],
  ["Notes", "notes", 0],
];
const columnUnitCount = columns.reduce((acc, [_a, _b, num]) => acc + num, 1);
const data = raw as unknown as Asset[];
const options: Array<Option> = [option1, option2];

const isArray = (function () {
  const regex = /array/i;

  return (q: unknown) => regex.test({}.toString.call(q));
})();

type Children = JSX.Element | string | Children[];

type CellProps = {
  children: Children;
  units: number;
};

function Cell({ children, units }: CellProps) {
  const attrs = {
    className: units ? "" : "hidden",
    style: {
      width: `calc(${units} * calc(100% / ${columnUnitCount}))`,
    },
  };

  return <div {...attrs}>{children}</div>;
}

function Row({
  children,
  label,
  render,
}: {
  children: JSX.Element;
  label: string;
  render: (a: { prop: keyof Asset; text: string }) => Children;
}) {
  return (
    <div className="even:bg-gray-200 flex flex-row p-3">
      {columns.map(([text, prop, units]) => (
        <Cell key={`${label}-${prop}`} units={units}>
          {render({ prop, text })}
        </Cell>
      ))}

      {children}
    </div>
  );
}

function Display({ data }: { data: Asset[] }) {
  return (
    <div>
      <Row
        label={"heading"}
        render={({ text }: { text: string }) => <strong>{text}</strong>}
      >
        <Cell units={1}>{""}</Cell>
      </Row>

      {data.map((asset) => (
        <Row
          key={asset.id}
          label={"asset"}
          render={({ prop }) =>
            isArray(asset[prop])
              ? (asset[prop] as string[]).map((text) => (
                  <span
                    className="bg-rose-900 text-white inline-block mr-1 -my-2 whitespace-nowrap px-2 py-1 rounded-lg text-ellipsis overflow-hidden ... min-w-28 w-28 hover:w-auto"
                    key={text}
                    title={text}
                  >
                    {text}
                  </span>
                ))
              : (asset[prop] as string)
          }
        >
          <Cell units={1}>{"+?"}</Cell>
        </Row>
      ))}
    </div>
  );
}

export default function Home() {
  const [selected, setSelected] = useState(0);
  const OptionComponent = options[selected].Component;

  return (
    <main className="flex gap-4">
      <nav className="flex-initial min-w-64">
        <ul>
          {options.map(({ text }, key) => (
            <li key={text}>
              <button onClick={() => setSelected(key)}>{text}</button>
            </li>
          ))}
        </ul>
      </nav>

      <article className="flex-auto">
        <OptionComponent
          data={data}
          render={(data: Asset[]) => <Display data={data} />}
        />
      </article>
    </main>
  );
}
