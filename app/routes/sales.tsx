import { LoaderFunctionArgs, json } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const nav_items = [
    "Overview",
    "Subscriptions",
    "Invoices",
    "Customer",
    "Deposits",
  ];
  return json({ nav_items });
};

export default function Sales() {
  const { nav_items } = useLoaderData<typeof loader>();

  return (
    <div className="p-5 flex-1">
      <h1 className="font-bold text-3xl text-neutral-700">Sales</h1>

      <div className="flex gap-2 mt-3 text-neutral-500">
        {nav_items.map((item) => (
          <NavLink
            className={(props) => {
              let className = "border px-3 py-1 rounded-md";

              if (props.isActive) {
                className += " bg-sky-100 text-sky-500 border-sky-400";
              }

              return className;
            }}
            to={`./${item.toLowerCase()}`}
            prefetch="intent"
            key={item}
          >
            {item}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
