import type { Asset } from "./Asset";

export type ComponentProps = {
  data: Asset[];
  render: (d: Asset[]) => JSX.Element;
};
