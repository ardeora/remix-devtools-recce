import * as entryServer from "/node_modules/.pnpm/@remix-run+dev@2.2.0_@remix-run+serve@2.2.0_typescript@5.2.2_vite@4.5.0/node_modules/@remix-run/dev/dist/config/defaults/entry.server.node.tsx";
import * as route0 from "/app/root.tsx";
import * as route1 from "/app/routes/contacts.$contactId.destroy.tsx";
import * as route2 from "/app/routes/contacts.$contactId_.edit.tsx";
import * as route3 from "/app/routes/contacts.$contactId.tsx";
import * as route4 from "/app/routes/_index.tsx";
export { default as assets } from "virtual:server-manifest";
export const assetsBuildDirectory = "public/build";
export const future = { v3_fetcherPersist: false };
export const publicPath = "/build/";
export const entry = { module: entryServer };
export const route = {
  root: {
    id: "root",
    parentId: undefined,
    path: "",
    index: undefined,
    caseSensitive: undefined,
    module: route0,
  },
  "routes/contacts.$contactId.destroy": {
    id: "routes/contacts.$contactId.destroy",
    parentId: "routes/contacts.$contactId",
    path: "destroy",
    index: undefined,
    caseSensitive: undefined,
    module: route1,
  },
  "routes/contacts.$contactId_.edit": {
    id: "routes/contacts.$contactId_.edit",
    parentId: "root",
    path: "contacts/:contactId/edit",
    index: undefined,
    caseSensitive: undefined,
    module: route2,
  },
  "routes/contacts.$contactId": {
    id: "routes/contacts.$contactId",
    parentId: "root",
    path: "contacts/:contactId",
    index: undefined,
    caseSensitive: undefined,
    module: route3,
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: undefined,
    index: true,
    caseSensitive: undefined,
    module: route4,
  },
};

const transformRoutes = (routes) => {
  const transformedRoutes = {};
  for (const [key, route] of Object.entries(routes)) {
    const loader = route.module?.loader;
    if (loader) {
      const transformedLoader = async (params) => {
        console.log(key + " loader started", params.request.headers);
        return new Promise((resolve, reject) => {
          loader(params).then((result) => {
            console.log(key + " loader ended", params.request.headers);
            resolve(result);
          });
        });
      };

      route.module = {
        ...route.module,
        loader: transformedLoader,
      };
    }
    transformedRoutes[key] = route;
  }
  return transformedRoutes;
};

export const routes = transformRoutes(route);
