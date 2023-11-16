import crypto from "crypto";
const getHeaders = (headers) => {
    const result = {};
    for (const [key, value] of headers.entries()) {
        result[key] = value;
    }
    return result;
};
const sendStats = (payload) => {
    // @ts-expect-error
    fetch(API_URL + "/send_loader_stats", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });
};
const transformRoutes = (routes) => {
    const transformedRoutes = {};
    for (const [id, route] of Object.entries(routes)) {
        const loader = route.module?.loader;
        if (loader) {
            const transformedLoader = async (params) => {
                const key = crypto.randomUUID();
                const startPayload = {
                    key,
                    route: id,
                    path: route.path,
                    params: params.params,
                    headers: getHeaders(params.request.headers),
                    startedAt: Date.now(),
                };
                sendStats(startPayload);
                return new Promise((resolve, reject) => {
                    loader(params).then((result) => {
                        result
                            .clone()
                            .json()
                            .then((data) => {
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
