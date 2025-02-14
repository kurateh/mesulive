import { writeFileSync } from "fs";
import path from "path";

import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

writeFileSync(
  path.join(process.cwd(), "public/ads.txt"),
  process.env.GOOGLE_ADS_TXT_CONTENT,
);
