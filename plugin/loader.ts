import type { LoaderFunctionArgs } from "@remix-run/node";
import fs from "fs";
import crypto from "crypto";
import { LoaderStatsPayload } from "./server";

type Routes = {
  [key: string]: {
    id: string;
    parentId: string;
    path: string;
    index: boolean;
    caseSensitive: boolean;
    module: {
      loader?: (params: LoaderFunctionArgs) => Promise<any>;
    };
  };
};

const getHeaders = (headers: LoaderFunctionArgs["request"]["headers"]) => {
  const result: { [key: string]: string } = {};
  for (const [key, value] of headers.entries()) {
    result[key] = value;
  }
  return result;
};

const sendStats = (payload: LoaderStatsPayload) => {
  // @ts-expect-error
  fetch(API_URL + "/send_loader_stats", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const transformRoutes = (routes: Routes) => {
  const transformedRoutes: Routes = {};
  for (const [id, route] of Object.entries(routes)) {
    const loader = route.module?.loader;
    if (loader) {
      const transformedLoader = async (params: LoaderFunctionArgs) => {
        const key = crypto.randomUUID();
        const startPayload: LoaderStatsPayload = {
          key,
          route: id,
          path: route.path,
          params: params.params,
          headers: getHeaders(params.request.headers),
          startedAt: Date.now(),
        };
        sendStats(startPayload);
        return new Promise((resolve, reject) => {
          loader(params).then((result: any) => {
            result
              .clone()
              .json()
              .then((data: any) => {
                const endPayload = {
                  ...startPayload,
                  data,
                  endedAt: Date.now(),
                };
                sendStats(endPayload);
              });
            resolve(result);
          });
        });
      };

      route.module = {
        ...route.module,
        loader: transformedLoader,
      };
    }
    transformedRoutes[id] = route;
  }
  return transformedRoutes;
};
