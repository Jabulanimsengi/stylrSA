import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Reduce churn and allow incremental typing cleanup
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Allow apostrophes/quotes in text content without HTML entities
      "react/no-unescaped-entities": "off",
      // Prefer, but don't fail builds for <img>
      "@next/next/no-img-element": "warn",
      // Noise in large refactors; keep as warn for now
      "react-hooks/exhaustive-deps": "warn",
      // Style nit — warn only
      "prefer-const": "warn",
    },
  },
];

export default eslintConfig;
