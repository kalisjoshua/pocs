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

type ColumnsConfig = {
  offset: {
    col: number;
    row: number;
  };
  prop: keyof Asset;
  span: number;
  text: string;
};

const columnsRaw: Array<[string, keyof Asset, number]> = [
  ["Name", "name", 6],
  ["Tags", "tags", 3],
  ["Type", "type", 1],
  ["Date Added", "date_added", 1],
  // plus one for the expand/collapse + selected-record (meta) columns

  ["Folder", "folder", 0],
  ["Added By", "addedBy", 0],
  ["Assigned Salespersons", "assignedTo", 0],
  ["Keywords", "keywords", 0],
  ["Notes", "notes", 0],
  // additional row for "Edit" (or "Save") and "Delete"
];
const columns: Array<ColumnsConfig> = columnsRaw.reduce<ColumnsConfig[]>(
  (acc, [text, prop, span], index) => {
    const prev = acc[index - 1];

    acc.push({
      offset: {
        col: index && span ? prev.offset.col + prev.span : 1,
        row: !span ? prev.offset.row + 1 : 1,
      },
      prop,
      span,
      text,
    });

    return acc;
  },
  [],
);
const data = raw as unknown as Asset[];
const options: Array<Option> = [option1, option2];

const isArray = (function () {
  const regex = /array/i;

  return (q: unknown) => regex.test({}.toString.call(q));
})();

type Children<T = JSX.Element | string> = T | T[];

function Badge({ text }: { text: string }) {
  return (
    <span
      className="border border-slate-400 inline-block mr-1 whitespace-nowrap px-2 rounded-lg text-ellipsis overflow-hidden ... min-w-28 w-28 hover:w-auto"
      title={text}
    >
      {text}
    </span>
  );
}

type FieldProps = {
  children: Children;
  col?: number;
  row?: number;
  span?: number;
};

function Field({ children, col = 0, row = 0, span = 0 }: FieldProps) {
  return (
    <div
      style={{
        gridColumnEnd: row === 1 ? col + span : 999,
        gridColumnStart: col,
        gridRowEnd: row,
        gridRowStart: row,
      }}
    >
      {children}
    </div>
  );
}

type ItemProps = {
  children?: JSX.Element;
  columns: Array<ColumnsConfig>;
  label: string;
  render: (a: { prop: keyof Asset; text: string }) => Children;
};

function Item({ children, columns, label, render }: ItemProps) {
  return (
    <div className={`even:bg-gray-200 grid grid-cols-12 p-3`}>
      {columns.map(({ offset, prop, span, text }) => (
        <Field key={`${label}-${prop}`} {...{ span, ...offset }}>
          {render({ prop, text })}
        </Field>
      ))}

      {children}
    </div>
  );
}

function Display({ data }: { data: Asset[] }) {
  return (
    <div>
      <Item
        columns={columns.filter(({ offset }) => offset.row === 1)}
        label={"heading"}
        render={({ text }: { text: string }) => <strong>{text}</strong>}
      >
        <Field>{""}</Field>
      </Item>

      {data.map((asset) => (
        <Item
          columns={columns}
          key={asset.id}
          label={"asset"}
          render={({ prop }) =>
            !isArray(asset[prop])
              ? (asset[prop] as string)
              : (asset[prop] as string[]).map((text) => (
                  <Badge key={text} text={text} />
                ))
          }
        >
          <Field col={12} row={1} span={1}>
            {"+?"}
          </Field>
        </Item>
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
