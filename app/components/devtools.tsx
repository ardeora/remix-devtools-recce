import { LoaderFunctionArgs } from "@remix-run/node";
import React, {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useHydrated } from "~/utils";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

export const Devtools = () => {
  const hydrated = useHydrated();
  return hydrated ? (
    <DevtoolsProvider>
      <DevtoolsMain />
    </DevtoolsProvider>
  ) : null;
};

const DevtoolsProvider = (props: { children: ReactNode }) => {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>{props.children}</QueryClientProvider>
  );
};

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

const DevtoolsMain = () => {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [port, setPort] = useState<number | null>(null);
  const loader_stats = useQuery({
    queryKey: ["loader_stats"],
    queryFn: async () => {
      const response = await fetch(`http://localhost:${port}/loader_stats`);
      return response.json() as Promise<LoaderStats[]>;
    },
    enabled: !!port,
    select(data) {
      return data.sort((a, b) => {
        return b.startedAt - a.startedAt;
      });
    },
  });

  useEffect(() => {
    const cb = (payload: { port: number; type: string }) => {
      setPort(payload.port);
    };

    if (import.meta.hot) {
      import.meta.hot.send("remix-devtools-plugin:get_port");
      import.meta.hot.on("remix-devtools-plugin:port", cb);
    }

    return () => {
      if (import.meta.hot) {
        import.meta.hot.dispose(cb);
      }
    };
  }, []);

  useEffect(() => {
    const beforeUnload = () => {
      fetch("http://localhost:5175/reload");
    };

    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, []);

  useEffect(() => {
    const listener = () => {
      loader_stats.refetch();
    };

    if (import.meta.hot) {
      import.meta.hot.on("remix-devtools-plugin:loader_stats", listener);
    }

    return () => {
      if (import.meta.hot) {
        import.meta.hot.dispose(listener);
      }
    };
  }, []);

  const selectedLoader = useMemo(() => {
    if (!selectedMessage) return null;
    return loader_stats.data?.find(
      (message) => message.key === selectedMessage
    );
  }, [selectedMessage, loader_stats]);

  return (
    <div className="absolute flex bg-white flex-col border-t border-gray-300 max-h-[500px] h-[500px] bottom-0 left-0 right-0">
      <div className="h-12 border-b border-gray-300 gap-2 bg-gray-50 flex-shrink-0 flex items-center px-2">
        <div className="h-8 w-8 bg-gray-400 relative rounded-md overflow-hidden">
          <img src="/remix-logo.svg" className=""></img>
        </div>
      </div>
      <div className="flex-1 flex min-h-0">
        <div className="bg-gray-50 border-r border-gray-300 w-12 flex py-2 items-center gap-2 flex-shrink-0 flex-col">
          <div className="bg-gray-200 h-8 w-8 rounded border border-gray-300 text-gray-600 flex justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10m0-20a15.3 15.3 0 00-4 10 15.3 15.3 0 004 10m0-20C6.477 2 2 6.477 2 12s4.477 10 10 10m0-20c5.523 0 10 4.477 10 10s-4.477 10-10 10M2.5 9h19m-19 6h19"
              ></path>
            </svg>
          </div>
          <div className="bg-gray-200 h-8 w-8 rounded border border-gray-300 text-gray-600 flex justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10m0-20a15.3 15.3 0 00-4 10 15.3 15.3 0 004 10m0-20C6.477 2 2 6.477 2 12s4.477 10 10 10m0-20c5.523 0 10 4.477 10 10s-4.477 10-10 10M2.5 9h19m-19 6h19"
              ></path>
            </svg>
          </div>
        </div>
        <div className="flex-1 flex">
          <div className="flex-1 overflow-y-auto flex-col flex">
            {loader_stats.data &&
              loader_stats.data.map((message) => {
                return (
                  <button
                    key={message.key}
                    className="border-b hover:bg-gray-200 w-full cursor-pointer rounded-none shadow-none border-gray-300 px-2 py-1"
                    onClick={() => {
                      setSelectedMessage((k) =>
                        k === message.key ? null : message.key
                      );
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-5 w-5 rounded ${
                          message.endedAt ? "bg-lime-500" : "bg-yellow-500"
                        }`}
                      ></div>
                      <div className="text-sm text-gray-600">
                        {message.route_name}
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
          {selectedMessage && selectedLoader && (
            <div className="flex-1 flex flex-col border-l border-gray-300 min-h-0 overflow-y-auto">
              <div className="py-1 text-sm text-gray-700 font-medium px-2 bg-gray-100">
                Loader Details
              </div>
              <div className="p-2">
                <div
                  className={`h-16 rounded border-2 text-sm flex items-center justify-center font-medium ${
                    selectedLoader.endedAt
                      ? "border-lime-400 bg-lime-300 text-lime-800"
                      : "border-yellow-400 bg-yellow-300 text-yellow-900"
                  }`}
                >
                  {selectedLoader.endedAt ? "Success" : "Pending"}
                </div>
              </div>
              <div className="py-1 text-sm text-gray-700 font-medium px-2 bg-gray-100">
                Loader Data
              </div>
              <div className="text-sm text-gray-600">
                <pre className="p-2 break-all">
                  {JSON.stringify(selectedLoader.data ?? {}, null, 2)}
                </pre>
              </div>
              <div className="py-1 text-sm text-gray-700 font-medium px-2 bg-gray-100">
                Headers
              </div>
              <div className="text-sm text-gray-600">
                <div className="flex bg-gray-100 border-y border-gray-300">
                  <div className="flex-1 flex-shrink-0 px-2 py-1 border-r border-gray-300">
                    Key
                  </div>
                  <div className="flex-1 flex-shrink-0 px-2 py-1">Value</div>
                </div>
                {Object.entries(selectedLoader.headers).map(([key, value]) => {
                  return (
                    <div key={key} className="flex border-b border-gray-300">
                      <div className="flex-1 min-w-1/2 font-medium flex-shrink-0 px-2 py-1 border-r border-gray-300">
                        {key}
                      </div>
                      <div className="flex-1 px-2 py-1 break-all">{value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
