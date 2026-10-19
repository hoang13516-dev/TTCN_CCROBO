import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { UploadPage } from "./features/imports/UploadPage";
import { SourcesPage } from "./features/sources/SourcesPage";

/**
 * Khai báo route theo cấu trúc lồng nhau:
 * Layout (sidebar + khung chung) bọc các trang con qua <Outlet />.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "imports", element: <UploadPage /> },
      { path: "sources", element: <SourcesPage /> },
    ],
  },
]);
