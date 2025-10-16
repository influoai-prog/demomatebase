import nextConfig from "eslint-config-next";
import prettier from "eslint-config-prettier";
import tailwind from "eslint-plugin-tailwindcss";

export default [
  ...nextConfig(),
  prettier,
  {
    name: "tailwindcss",
    ...tailwind.configs["flat/recommended"],
    settings: {
      tailwindcss: {
        callees: ["cn"],
        config: "./tailwind.config.ts"
      }
    }
  },
  {
    rules: {
      "@next/next/no-img-element": "off"
    }
  }
];
