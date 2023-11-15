import React, { useEffect, useLayoutEffect } from "react";
import { useHydrated } from "~/utils";

export const Devtools = () => {
  const hydrated = useHydrated();
  return hydrated ? <DevtoolsMain /> : null;
};

const DevtoolsMain = () => {
  useLayoutEffect(() => {
    const cb = (payload: any) => {
      console.log("devtools", payload);
    };

    if (import.meta.hot) {
      import.meta.hot.on("devtools", cb);
    }

    return () => {
      if (import.meta.hot) {
        import.meta.hot.dispose(cb);
      }
    };
  }, []);

  return (
    <div className="absolute flex flex-col bg-lime-400 h-[500px] bottom-0 left-0 right-0">
      <div className="h-12 bg-lime-700 flex-shrink-0"></div>
    </div>
  );
};
