import type { KnipConfig } from "knip";

const config: KnipConfig = {
  project: ["src/**"],
  entry: [],
  ignore: [
    "src/components/ui/**", // not all shadcn components are used
    "src/kc.gen.tsx",
  ],
  ignoreDependencies: [],
};

export default config;
