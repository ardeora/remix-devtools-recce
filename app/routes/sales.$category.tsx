import { LoaderFunctionArgs, json } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { invoice_list } from "~/db";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const list = invoice_list;

  return json({ list });
};

const toProperCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
};

const getDaysFromToday = (date: string) => {
  const today = new Date();
  const due_date = new Date(date);
  const diff = due_date.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default function Sales() {
  const { list } = useLoaderData<typeof loader>();
  const params = useParams();

  return (
    <div className="mt-4">
      <h1 className="font-semibold text-xl text-neutral-600">
        {toProperCase(params.category || "")}
      </h1>

      <div className="border mt-2 h-[380px] flex rounded-md">
        <div className="flex-1 max-w-[50%] flex flex-col overflow-y-auto border-r">
          {list.map((item) => {
            const days = getDaysFromToday(item.due_date);
            const str =
              days == 0
                ? "DUE TODAY"
                : days < 0
                ? "PAID"
                : days == 1
                ? "DUE TOMORROW"
                : `IN ${days} DAYS`;
            return (
              <NavLink
                key={item.id}
                to={`./${item.id}`}
                prefetch="intent"
                className={(props) => {
                  let className = "border-b flex flex-col";

                  if (props.isActive) {
                    className += " bg-sky-100 text-sky-500 group selected";
                  } else if (props.isPending) {
                    className += " bg-neutral-100 opacity-50";
                  } else {
                    className += " hover:bg-neutral-50";
                  }

                  return className;
                }}
              >
                <span className="w-full p-3 flex flex-col">
                  <span className="flex justify-between font-bold text-neutral-700 group-[.selected]:text-sky-600">
                    <span>{item.company}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </span>
                  <span className="flex justify-between text-neutral-500 text-sm group-[.selected]:text-sky-500">
                    <span>{new Date(item.due_date).getFullYear()}</span>
                    <span>{str}</span>
                  </span>
                </span>
              </NavLink>
            );
          })}
        </div>
        <Outlet />
      </div>
    </div>
  );
}
