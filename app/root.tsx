import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useEffect } from "react";

import "./app.css";
import { createEmptyContact, getContacts } from "./data";
import { Devtools } from "./components/devtools";
import {
  Accounts,
  Contacts,
  Dashboard,
  Expenses,
  Home,
  Reports,
  Sales,
  Settings,
} from "./components/icons";

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const nav_items = [
    "Home",
    "Dashboard",
    "Accounts",
    "Sales",
    "Expenses",
    "Contacts",
    "Reports",
    "Settings",
  ];
  return json({ nav_items });
};

const icons = {
  home: <Home />,
  dashboard: <Dashboard />,
  accounts: <Accounts />,
  sales: <Sales />,
  expenses: <Expenses />,
  contacts: <Contacts />,
  reports: <Reports />,
  settings: <Settings />,
};

export default function App() {
  const { nav_items } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="">
        <div className="h-screen flex pb-[500px]">
          <div className="w-72 bg-white border-r border-neutral-300 py-5 gap-4 flex flex-col ">
            <div>
              <img src="/logo.png" className="h-8 px-5" />
            </div>
            <div className="px-5">
              <form className="border border-neutral-300 px-2 rounded-md overflow-hidden flex gap-2">
                <div className="flex items-center text-neutral-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.667"
                      d="M17.5 17.5l-2.917-2.917m2.084-5a7.083 7.083 0 11-14.167 0 7.083 7.083 0 0114.167 0z"
                    ></path>
                  </svg>
                </div>

                <input
                  placeholder="Search"
                  className="leading-[2rem] outline-none text-sm"
                ></input>
              </form>
            </div>
            <div className="flex flex-col gap-2 px-3">
              {nav_items.map((nav_item) => (
                <NavLink
                  key={nav_item}
                  className={(props) => {
                    let className =
                      "p-2 rounded-md font-medium flex gap-2 text-sm hover:bg-neutral-50 text-neutral-600";

                    if (props.isActive) {
                      className += " bg-neutral-100 text-neutral-900";
                    }

                    return className;
                  }}
                  to={`/${nav_item.toLowerCase()}`}
                >
                  <span className="flex items-center gap-2 h-5 w-5">
                    {icons[nav_item.toLowerCase() as keyof typeof icons]}
                  </span>
                  <span>{nav_item}</span>
                </NavLink>
              ))}
            </div>
          </div>
          <Outlet />
        </div>
        <Devtools />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
