import type { Plugin, ViteDevServer } from "vite";
import fs from "fs";
import { parse } from "@babel/parser";
import express from "express";
// Setup express server

export const devtoolsPlugin: () => Plugin = () => {
  let server: ViteDevServer;
  // const PORT = 5175;
  // const app = express();

  // const val = {
  //   data: ["hello"],
  //   version: 1,
  // };

  // app.get("/loader", (req, res) => {
  //   return res.json(val);
  // });

  // app.get("/update_val", (req, res) => {
  //   val.data.push(req.query.data as string);
  //   val.version = val.version + 1;
  //   res.send("ok");
  // });

  // const s = app.listen(PORT, () => {});
  // console.log("ADDRESS", s.address());

  return {
    name: "remix-devtools-plugin",
    buildStart() {
      console.log("build start");
    },
    handleHotUpdate({ file, server }) {
      if (file.includes("loader.txt")) {
        const file = fs.readFileSync("loader.txt", "utf-8");
        const lines = file
          .split("\n")
          .map((line) => {
            if (line) {
              return JSON.parse(line);
            }
          })
          .filter(Boolean);
        server.ws.send("remix-devtools-plugin", {
          type: "loader",
          data: lines,
        });
      }
    },
    configureServer(server) {
      server.ws.on("remix-devtools-plugin", (data: any) => {
        if (data.type === "init") {
          const file = fs.readFileSync("loader.txt", "utf-8");
          const lines = file
            .split("\n")
            .map((line) => {
              if (line) {
                return JSON.parse(line);
              }
            })
            .filter(Boolean);
          server.ws.send("remix-devtools-plugin", {
            type: "loader",
            data: lines,
          });
        }
      });

      // server.middlewares.use((req, res, next) => {
      //   console.log(req.url);
      //   if (req.url?.includes("/@vite/client")) {
      //     fs.writeFileSync("loader.txt", "");
      //   }
      //   next();
      // });
    },
    transform(code, id, options) {
      if (id.includes("virtual:server-entry")) {
        const loader = fs.readFileSync("./plugin/loader.js", "utf-8");
        const edited = code.replace("export const routes", "const route");
        return `
         ${edited}
         ${loader}
         export const routes = transformRoutes(route);
        `;
        // console.log("running");
        // console.log(loader);
        // const parsed = parse(loader, {
        //   // parse in strict mode and allow module declarations
        //   sourceType: "module",
        //   plugins: ["typescript"],
        // });
        // const gen = generate(parsed);
        // console.log("Generated", gen.code);
      }
    },
    transformIndexHtml(html) {
      console.log(html);
    },
  };
};

export default devtoolsPlugin;
