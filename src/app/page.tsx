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
  ["Name", "name", 7],
  ["Tags", "tags", 1],
  ["Assigned", "assignedTo", 1],
  ["Type", "type", 1],
  ["Date Added", "date_added", 1],
  // plus one for the expand/collapse + selected-record (meta) columns

  ["Folder", "folder", 0],
  ["Tags", "tags", 0],
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

const compareStrings = (a: string, b: string) => (a > b ? 1 : a < b ? -1 : 0);

type Children<T = JSX.Element | string> = T | T[];

function Badge({ text }: { text: string }) {
  return (
    <span
      className="border w-7 h-7 rounded-full inline-flex items-center justify-center bg-white text-gray-700 font-bold"
      title={text}
    >
      {text.at(0)}
    </span>
  );
}

type ItemProps = {
  columns: ColumnsConfig;
  detail?: ColumnsConfig;
  label: string;
  render: (a: { prop: keyof Asset; text: string }, b?: boolean) => Children;
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
              {render({ prop, text }, true)}
            </div>
          ))}

          <div className="flex gap-2 justify-end">
            <button className="bg-green-700 hover:bg-green-800 font-bold px-6 py-2 rounded-lg text-white">
              Edit
            </button>
            <button className="bg-red-700 hover:bg-red-800 font-bold px-6 py-2 rounded-lg text-white">
              Delete
            </button>
          </div>
        </details>
      )}
    </div>
  );
}

function DetailToggle({
  className,
  detail,
}: {
  className: string;
  detail: RefObject<HTMLDetailsElement>;
}) {
  const [hidden, setHidden] = useState(true);

  return (
    <button
      className={className}
      onClick={() => {
        if (detail.current) {
          setHidden(!hidden);
          detail.current.open = !detail.current.open;
        }
      }}
      title="Show (or Hide) the details for this item."
    >
      {hidden ? "Show" : "Hide"}
    </button>
  );
}

function Display({ data }: { data: Asset[] }) {
  const folders = Array.from(new Set(data.map(({ folder }) => folder)));
  const hidden = columns.filter((col) => col[2] === 0);
  const visible = columns.filter((col) => col[2] > 0);

  const [allFoldersOpen, setAllFoldersOpen] = useState(true);
  const [folderToggles, setFolderToggles] = useState<Record<string, boolean>>(
    {},
  );

  return (
    <div>
      <span
        onClick={() => {
          folders.forEach((name) => (folderToggles[name] = allFoldersOpen));

          setAllFoldersOpen(!allFoldersOpen);
        }}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        Toggle Folders {allFoldersOpen ? "Closed" : "Open"}
      </span>

      <div>
        <Item
          columns={visible}
          label={"heading"}
          render={({ text }: { text: string }) => <strong>{text}</strong>}
          Toggle={() => <div style={{ flex: "1 0 0%" }}>{""}</div>}
        />
      </div>

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
              key={`folder-${asset.folder}`}
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
              render={({ prop }, isDetailsSection = false) => {
                let val = asset[prop];

                if (prop !== "tags" && !isArray(val)) return val as string;

                val ??= []; // for consistency

                if (isDetailsSection) {
                  return (val as string[]).map((text) => (
                    <li key={text}>{text}</li>
                  ));
                }

                return <Badge text={"" + val.length} />;
              }}
              Toggle={({
                detail,
              }: {
                detail: RefObject<HTMLDetailsElement>;
              }) => (
                <div className="flex flex-1 gap-3 justify-end justify-items-end">
                  <button className="w-1/2">View</button>
                  <DetailToggle className="w-1/2 flex-grow-0" detail={detail} />
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
