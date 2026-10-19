import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

type ApiState = "checking" | "ok" | "error";

/** Gọi /api/health để kiểm tra API có sống không. Dùng AbortController để hủy request khi rời trang. */
function useApiHealth(): ApiState {
  const [state, setState] = useState<ApiState>("checking");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/health", { signal: controller.signal })
      .then((res) => (res.ok ? setState("ok") : setState("error")))
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setState("error");
        void err;
      });
    return () => controller.abort();
  }, []);

  return state;
}

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/imports", label: "Nhập dữ liệu", end: false },
  { to: "/sources", label: "Nguồn dữ liệu", end: false },
];

export function Layout() {
  const apiState = useApiHealth();
  const apiLabel =
    apiState === "ok" ? "API: ok" : apiState === "error" ? "API: lỗi" : "API: đang kiểm tra";
  const apiColor =
    apiState === "ok"
      ? "text-emerald-600"
      : apiState === "error"
        ? "text-red-600"
        : "text-slate-500";

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="flex w-56 flex-col border-r border-slate-200 bg-white p-4">
        <h1 className="mb-6 text-lg font-semibold">CN-019</h1>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className={`mt-auto text-xs ${apiColor}`}>{apiLabel}</p>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
