import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local-only agent worktrees: full copies of the repo plus third-party
    // code, excluded from git via .git/info/exclude. Linting them buries any
    // real finding from src/ under thousands of irrelevant problems.
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
