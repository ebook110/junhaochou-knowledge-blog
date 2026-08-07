import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default [
  { ignores: [".astro/", "dist/", "node_modules/", "playwright-report/", "test-results/"] },
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  { files: ["**/*.astro/*.ts"], languageOptions: { parser: tseslint.parser } },
];
