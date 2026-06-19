import Layout from "./Layout.jsx";
import UserSidebar from "../sidebar/UserSidebar.jsx";

export default function UserLayout() {
  return <Layout SidebarComponent={UserSidebar} />;
}
