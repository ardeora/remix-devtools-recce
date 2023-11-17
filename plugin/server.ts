import { LoaderFunctionArgs } from "@remix-run/node";
import express from "express";
import cors from "cors";
type SubscribeEvent = "loader_data";

export interface LoaderStatsPayload {
  key: string;
  route: string;
  path: string;
  params: LoaderFunctionArgs["params"];
  headers: Record<string, string>;
  startedAt: number;
  endedAt?: number;
  data?: any;
}

interface LoaderStats extends LoaderStatsPayload {
  route_name: string;
}

class PubSub {
  subscribers: Record<string, Function[]>;

  constructor() {
    this.subscribers = {};
  }

  subscribe(event: string, callback: (data: any) => void) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }

    this.subscribers[event].push(callback);
  }

  publish(event: string, data: any) {
    if (!this.subscribers[event]) {
      return;
    }

    this.subscribers[event].forEach((callback) => callback(data));
  }
}

const addRouteName = (payload: LoaderStatsPayload) => {
  const params = payload.params;
  let route_name = payload.route;

  if (route_name === "root") {
    return {
      ...payload,
      route_name: "/",
    };
  }

  route_name = "/" + route_name.replace("routes/", "");

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      route_name = route_name.replace(`$${key}`, value);
    }
  });

  route_name = route_name.replace(/\./g, "/");

  return {
    ...payload,
    route_name,
  };
};

const upsertLoaderStats = (
  loader_stats: LoaderStats[],
  payload: LoaderStatsPayload
) => {
  loader_stats.push(addRouteName(payload));
  const existing = loader_stats.find((item) => item.key === payload.key);
  if (!existing) {
    loader_stats.push(addRouteName(payload));
    return loader_stats;
  }
  const remaining = loader_stats.filter((item) => item.key !== payload.key);
  return [
    ...remaining,
    {
      ...existing,
      ...payload,
    },
  ];
};

export const createServer = (port: number) => {
  const app = express();
  let loader_stats: LoaderStats[] = [];

  const listener = new PubSub();

  app.use(cors());
  app.use(express.json());

  app.post("/send_loader_stats", (req, res) => {
    const data = req.body as LoaderStatsPayload;
    loader_stats = upsertLoaderStats(loader_stats, data);
    listener.publish("loader_stats", loader_stats);
    res.send({ status: "ok" });
  });

  app.get("/loader_stats", (req, res) => {
    res.json(loader_stats);
  });

  app.get("/reload", (req, res) => {
    loader_stats = [];
    res.send({ status: "ok" });
  });

  const server = app.listen(port, () => {
    console.log(`Loader stats server listening at http://localhost:${port}`);
  });

  return {
    listener,
    port,
    server,
  };
};
