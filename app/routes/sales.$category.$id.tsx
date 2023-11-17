import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { invoice_list } from "~/db";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const { id } = params;
  if (!id) return redirect("/sales");

  const list = invoice_list;

  const item = list.find((item) => item.id == id);
  if (!item) return redirect("/sales");

  const payload = {
    ...item,
    pro_plan: item.amount * 0.2,
    custom_plan: item.amount * 0.8,
  };

  return json({ invoice: payload });
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
  const { invoice } = useLoaderData<typeof loader>();
  const params = useParams();

  const days = getDaysFromToday(invoice.due_date);
  const str =
    days == 0
      ? "DUE TODAY"
      : days < 0
      ? "PAID"
      : days == 1
      ? "DUE TOMORROW"
      : `IN ${days} DAYS`;

  return (
    <div className="flex-1 max-w-[50%] p-4">
      <div className="text-sm text-neutral-500">INVOICE #{invoice.id}</div>
      <div className="text-2xl mt-1 font-bold text-neutral-700">
        {invoice.company}
      </div>
      <div className="text-neutral-500 font-medium text-sm">
        {str} · INVOICED {new Date(invoice.due_date).toLocaleDateString()}{" "}
      </div>
      <div className="flex flex-col mt-6">
        <div className="py-2 flex justify-between border-y items-center text-sm">
          <div className="text-neutral-500">PRO PLAN</div>
          <div className="text-neutral-500 font-semibold">
            {formatCurrency(invoice.pro_plan)}
          </div>
        </div>
        <div className="py-2 flex justify-between border-b items-center text-sm">
          <div className="text-neutral-500">CUSTOM PLAN</div>
          <div className="text-neutral-500 font-semibold">
            {formatCurrency(invoice.custom_plan)}
          </div>
        </div>
        <div className="py-2 flex justify-between border-b items-center text-sm">
          <div className="text-neutral-700 font-semibold">TOTAL</div>
          <div className="text-neutral-700 font-semibold">
            {formatCurrency(invoice.amount)}
          </div>
        </div>
      </div>
    </div>
  );
}
