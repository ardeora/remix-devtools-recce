import type { LoaderFunctionArgs } from "@remix-run/node";
import fs from "fs";
import crypto from "crypto";

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

type LoaderStartPayload = {
  key: string;
  route: string;
  params: LoaderFunctionArgs["params"];
  headers: Record<string, string>;
  type: "start";
  timestamp: number;
};

type LoaderEndPayload = {
  key: string;
  route: string;
  params: LoaderFunctionArgs["params"];
  headers: Record<string, string>;
  type: "end";
  timestamp: number;
  data: any;
};

type LoaderPayload = LoaderStartPayload | LoaderEndPayload;

const getHeaders = (headers: LoaderFunctionArgs["request"]["headers"]) => {
  const result: { [key: string]: string } = {};
  for (const [key, value] of headers.entries()) {
    result[key] = value;
  }
  return result;
};

const transformRoutes = (routes: Routes) => {
  const transformedRoutes: Routes = {};
  for (const [id, route] of Object.entries(routes)) {
    const loader = route.module?.loader;
    if (loader) {
      const transformedLoader = async (params: LoaderFunctionArgs) => {
        const key = crypto.randomUUID();
        const startPayload: LoaderPayload = {
          key,
          route: id,
          params: params.params,
          headers: getHeaders(params.request.headers),
          type: "start",
          timestamp: Date.now(),
        };
        console.log(startPayload);
        return new Promise((resolve, reject) => {
          loader(params).then((result: any) => {
            result
              .clone()
              .json()
              .then((data: any) => {
                const endPayload = {
                  key,
                  route: id,
                  params: params.params,
                  headers: getHeaders(params.request.headers),
                  type: "end",
                  timestamp: Date.now(),
                  data,
                };
                console.log(endPayload);
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
