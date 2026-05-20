import Layout from "./Layout.jsx";
import AdminSidebar from "../sidebar/AdminSidebar.jsx";

export default function AdminLayout() {
  return <Layout SidebarComponent={AdminSidebar} />;
}
