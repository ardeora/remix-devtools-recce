import type { Plugin, ViteDevServer } from "vite";
import fs from "fs";
import { parse } from "@babel/parser";
import express from "express";
import { createServer } from "./server";
// Setup express server

export const devtoolsPlugin: () => Plugin = () => {
  const PORT = 5175;

  const { listener } = createServer(PORT);

  return {
    name: "remix-devtools-plugin",
    configureServer(server) {
      listener.subscribe("loader_stats", () => {
        server.ws.send("remix-devtools-plugin:loader_stats", {
          type: "refetch",
        });
      });

      server.ws.on("remix-devtools-plugin:get_port", () => {
        server.ws.send("remix-devtools-plugin:port", {
          type: "port",
          port: PORT,
        });
      });
    },
    transform(code, id, options) {
      if (id.includes("virtual:server-entry")) {
        const loader = fs.readFileSync("./plugin/loader.js", "utf-8");
        const edited = code.replace("export const routes", "const route");
        return `
         ${edited}
         const API_URL = "http://localhost:${PORT}";
         ${loader}
         export const routes = transformRoutes(route);
        `;
      }
    },
  };
};

export default devtoolsPlugin;
