declare module "*.svg" {
  import { type FC, type SVGProps } from "react";
  const content: FC<SVGProps<SVGSVGElement>>;
  export default content;
}

declare module "*.svg?url" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any;
  export default content;
}

declare global {
  import type HighchartsDefault from "highcharts";
  interface Window {
    Highcharts: typeof HighchartsDefault;
  }
}

declare module "jotai-devtools/styles.css";
