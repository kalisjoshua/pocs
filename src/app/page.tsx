"use client";

import { RefObject, useRef, useState } from "react";

import type { Asset } from "./Asset";
import type { ComponentProps } from "./ComponentProps";

import raw from "../assets.json";

import * as option1 from "./options/one";
import * as option2 from "./options/two";

interface Option {
  Component: (props: ComponentProps) => JSX.Element;
  text: string;
}

type ColumnsConfig = Array<[string, keyof Asset, number]>;

const columns: Array<[string, keyof Asset, number]> = [
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
const data = raw as unknown as Asset[];
const options: Array<Option> = [option1, option2];

const isArray = (function () {
  const regex = /array/i;

  return (q: unknown) => regex.test({}.toString.call(q));
})();

function compareStrings(a: string, b: string) {
  return a > b ? 1 : a < b ? -1 : 0;
}

type Children<T = JSX.Element | string> = T | T[];

function Badge({
  onClick,
  style,
  text,
  width = 28,
}: {
  onClick?: () => void;
  style?: object;
  text: string;
  width?: number;
}) {
  return (
    <span
      className={`border border-slate-400 inline-block mr-1 whitespace-nowrap px-2 rounded-lg text-ellipsis overflow-hidden ... min-w-${width} w-${width} hover:w-auto`}
      onClick={onClick}
      style={style}
      title={text}
    >
      {text}
    </span>
  );
}

type ItemProps = {
  columns: ColumnsConfig;
  detail?: ColumnsConfig;
  label: string;
  render: (a: { prop: keyof Asset; text: string }) => Children;
  Toggle: ({ detail }: { detail: RefObject<HTMLDetailsElement> }) => Children;
};

function Item({ columns, detail, label, render, Toggle }: ItemProps) {
  const detailRef = useRef<HTMLDetailsElement>(null);

  return (
    <div className={`even:bg-gray-200 p-3`}>
      <div className="flex">
        {columns.map(([text, prop, unit]) => (
          <div key={`${label}-${prop}`} style={{ flex: `${unit} 0 0%` }}>
            {render({ prop, text })}
          </div>
        ))}

        <Toggle detail={detailRef} />
      </div>

      {detail && (
        <details ref={detailRef}>
          <summary style={{ display: "none" }}></summary>
          {detail.map(([text, prop, unit]) => (
            <div key={`${label}-${prop}`} style={{ flex: `${unit} 0 0%` }}>
              <div>
                <strong>{text}</strong>
              </div>
              {render({ prop, text })}
            </div>
          ))}

          <button>Edit</button>
          <button>Delete</button>
        </details>
      )}
    </div>
  );
}

function DetailToggle({ detail }: { detail: RefObject<HTMLDetailsElement> }) {
  return (
    <Badge
      onClick={() => {
        if (detail.current) {
          detail.current.open = !detail.current.open;
        }
      }}
      style={{
        cursor: "pointer",
        textAlign: "center",
        userSelect: "none",
      }}
      text={"Details"}
      width={22}
    />
  );
}

function Display({ data }: { data: Asset[] }) {
  const [folderToggles, setFolderToggles] = useState<Record<string, boolean>>(
    {},
  );
  const hidden = columns.filter((col) => col[2] === 0);
  const visible = columns.filter((col) => col[2] > 0);

  return (
    <div>
      <Item
        columns={visible}
        label={"heading"}
        render={({ text }: { text: string }) => <strong>{text}</strong>}
        Toggle={() => <div style={{ flex: "1 0 0%" }}>{""}</div>}
      />

      {data
        .sort(
          (a, b) =>
            compareStrings(a.folder.toLowerCase(), b.folder.toLowerCase()) ||
            compareStrings(a.name.toLowerCase(), b.name.toLowerCase()),
        )
        .flatMap((asset, index) => [
          !(index && data[index - 1].folder === asset.folder) && (
            <div
              className="bg-gray-600 p-3 text-white"
              onClick={() => {
                setFolderToggles({
                  ...folderToggles,
                  [asset.folder]: !folderToggles[asset.folder],
                });
              }}
              style={{ borderBottom: "1px solid", cursor: "pointer", flex: 12 }}
            >
              <strong>{asset.folder}</strong>
            </div>
          ),
          !folderToggles[asset.folder] && (
            <Item
              columns={visible}
              detail={hidden}
              key={asset.id}
              label={"asset"}
              render={({ prop }) =>
                !isArray(asset[prop])
                  ? (asset[prop] as string)
                  : (asset[prop] as string[]).map((text) => (
                      <Badge key={text} text={text} />
                    ))
              }
              Toggle={({
                detail,
              }: {
                detail: RefObject<HTMLDetailsElement>;
              }) => (
                <div style={{ flex: "1 0 0%" }}>
                  <DetailToggle detail={detail} />
                </div>
              )}
            />
          ),
        ])}
    </div>
  );
}

export default function Home() {
  const [selected, setSelected] = useState(0);
  const OptionComponent = options[selected].Component;

  return (
    <main className="flex gap-4 p-8">
      {/* <nav className="flex-initial min-w-64">
        <ul>
          {options.map(({ text }, key) => (
            <li key={text}>
              <button onClick={() => setSelected(key)}>{text}</button>
            </li>
          ))}
        </ul>
      </nav> */}

      <article className="flex-auto">
        <OptionComponent
          data={data}
          render={(data: Asset[]) => <Display data={data} />}
        />
      </article>
    </main>
  );
}
