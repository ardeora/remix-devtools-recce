import fs from "fs";
import crypto from "crypto";
const getHeaders = (headers) => {
  const result = {};
  for (const [key, value] of headers.entries()) {
    result[key] = value;
  }
  return result;
};
const transformRoutes = (routes) => {
  const transformedRoutes = {};
  for (const [id, route] of Object.entries(routes)) {
    const loader = route.module?.loader;
    if (loader) {
      const transformedLoader = async (params) => {
        const key = crypto.randomUUID();
        fetch(API_URL + "/update_val?data=" + id);
        const startPayload = {
          key,
          route: id,
          params: params.params,
          headers: getHeaders(params.request.headers),
          type: "start",
          timestamp: Date.now(),
        };
        fs.appendFile(
          "loader.txt",
          JSON.stringify(startPayload) + "\n",
          () => {}
        );
        return new Promise((resolve, reject) => {
          loader(params).then((result) => {
            result
              .clone()
              .json()
              .then((data) => {
                const endPayload = {
                  key,
                  route: id,
                  params: params.params,
                  headers: getHeaders(params.request.headers),
                  type: "end",
                  timestamp: Date.now(),
                  data,
                };
                fs.appendFile(
                  "loader.txt",
                  JSON.stringify(endPayload) + "\n",
                  () => {}
                );
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
