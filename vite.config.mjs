import { defineConfig } from "vite";

export default defineConfig(async () => {
  const tsConfigPaths = (await import("vite-tsconfig-paths")).default;

  return {
    plugins: [tsConfigPaths()],
    test: {
      dir: "src",
      workspace: [
        {
          extends: true,
          test: {
            name: "unit",
            dir: "src/use-cases",
          },
        },
        {
          extends: true,
          test: {
            name: "e2e",
            dir: "src/http/controllers",
            environment:
              "./prisma/vitest-environment-prisma/prisma-test-environment.ts",
          },
        },
      ],
    },
  };
});
