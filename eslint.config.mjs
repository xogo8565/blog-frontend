import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // 의존 규칙: app → features → shared. feature끼리는 import하지 않는다.
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app", partialMatch: false },
        { type: "feature", pattern: "src/features/*", partialMatch: false, capture: ["feature"] },
        { type: "shared", pattern: "src/shared", partialMatch: false },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        2,
        {
          default: "disallow",
          policies: [
            { allow: { to: { module: { origin: "external" } } } },
            { allow: { to: { module: { origin: "core" } } } },
            {
              from: { element: { type: "app" } },
              allow: { to: { element: { types: { anyOf: ["app", "feature", "shared"] } } } },
            },
            {
              from: { element: { type: "feature" } },
              allow: { to: { element: { type: "shared" } } },
            },
            {
              from: { element: { type: "feature" } },
              allow: {
                to: {
                  element: {
                    type: "feature",
                    captured: { feature: "{{ from.element.captured.feature }}" },
                  },
                },
              },
            },
            {
              from: { element: { type: "shared" } },
              allow: { to: { element: { type: "shared" } } },
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/shared/api/schema.d.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
