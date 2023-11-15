import { LoaderFunctionArgs } from "@remix-run/node";
import React, { useEffect, useLayoutEffect, useMemo } from "react";
import { useHydrated } from "~/utils";

export const Devtools = () => {
  const hydrated = useHydrated();
  return hydrated ? <DevtoolsMain /> : null;
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

const getDynamicRouteName = (
  route: string,
  params: LoaderFunctionArgs["params"]
) => {
  let routeStr = route.split(".").join("/");
  if (routeStr.includes("$contactId_")) {
    // @ts-expect-error
    routeStr = routeStr.replace("$contactId_", params["contactId"]);
  }

  if (routeStr.includes("$contactId")) {
    // @ts-expect-error
    routeStr = routeStr.replace("$contactId", params["contactId"]);
  }

  return routeStr;
};

const DevtoolsMain = () => {
  const [messages, setMessages] = React.useState<LoaderPayload[]>([]);
  const [selectedMessage, setSelectedMessage] = React.useState<string | null>(
    null
  );

  useEffect(() => {
    const beforeUnload = () => {
      fetch("http://localhost:5175/update_val?data=reload");
    };

    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, []);

  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.send("remix-devtools-plugin", {
        type: "init",
      });
    }
  }, []);

  useEffect(() => {
    const handleMessage = (payload: {
      type: string;
      data: LoaderPayload[];
    }) => {
      setMessages(payload.data);
    };
    if (import.meta.hot) {
      import.meta.hot.on("remix-devtools-plugin", handleMessage);
    }
    return () => {
      if (import.meta.hot) {
        import.meta.hot.dispose(handleMessage);
      }
    };
  }, []);

  const reconciledMessages = useMemo(() => {
    const reconciledMessages: (LoaderPayload & {
      route_name: string;
      time_taken?: number;
    })[] = [];
    if (!messages) return [];
    const startMessages = messages.filter((m) => m.type === "start");
    const endMessages = messages.filter((m) => m.type === "end");

    startMessages.forEach((startMessage) => {
      const endMessage = endMessages.find(
        (endMessage) => endMessage.key === startMessage.key
      );
      if (endMessage) {
        reconciledMessages.push({
          ...endMessage,
          route_name: getDynamicRouteName(
            startMessage.route,
            startMessage.params
          ),
          time_taken: endMessage.timestamp - startMessage.timestamp,
        });
      } else {
        reconciledMessages.push({
          ...startMessage,
          route_name: getDynamicRouteName(
            startMessage.route,
            startMessage.params
          ),
        });
      }
    });

    return reconciledMessages.sort((a, b) => b.timestamp - a.timestamp);
  }, [messages]);

  const selectedLoader = useMemo(() => {
    if (!selectedMessage) return null;
    return reconciledMessages.find((m) => m.key === selectedMessage);
  }, [selectedMessage]);

  return (
    <div className="absolute flex bg-white flex-col border-t border-gray-300 max-h-[500px] h-[500px] bottom-0 left-0 right-0">
      <div className="h-12 border-b border-gray-300 gap-2 bg-gray-50 flex-shrink-0 flex items-center px-2">
        <div className="h-8 w-8 bg-gray-400 relative rounded-md overflow-hidden">
          <img src="/remix-logo.svg" className=""></img>
        </div>
      </div>
      <div className="flex-1 flex min-h-0">
        <div className="bg-gray-50 border-r border-gray-300 w-12 flex py-2 items-center flex-shrink-0 flex-col">
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
          <div className="flex-1 overflow-y-auto flex-col">
            {reconciledMessages.map((message) => {
              return (
                <div
                  key={message.key}
                  className="border-b hover:bg-gray-200 w-full cursor-pointer rounded-none shadow-none border-gray-300 px-2 py-1"
                  onClick={() =>
                    setSelectedMessage((c) =>
                      c === message.key ? null : message.key
                    )
                  }
                >
                  <div className="flex items-center gap-2 ">
                    <div
                      className={`h-5 w-5 rounded ${
                        message.type === "start"
                          ? "bg-yellow-500"
                          : "bg-lime-500"
                      }`}
                    ></div>
                    <div className="text-sm text-gray-600">
                      {message.route_name}{" "}
                      {message.time_taken && `(${message.time_taken}ms)`}
                    </div>
                  </div>
                </div>
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
                    selectedLoader.type === "end"
                      ? "border-lime-400 bg-lime-300 text-lime-800"
                      : "border-yellow-400 bg-yellow-300 text-yellow-900"
                  }`}
                >
                  {selectedLoader.type === "start" ? "Pending" : "Success"}
                </div>
              </div>
              <div className="py-1 text-sm text-gray-700 font-medium px-2 bg-gray-100">
                Loader Data
              </div>
              <div className="text-sm text-gray-600">
                <pre className="p-2 break-all">
                  {JSON.stringify(
                    selectedLoader.type == "end" ? selectedLoader.data : {},
                    null,
                    2
                  )}
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
