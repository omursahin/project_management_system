import BaseSidebar from "./BaseSidebar.jsx";

const menuSections = [
  {
    label: "YÖNETİM",
    items: [
      { label: "Üniversiteler", href: "/admin/universities", icon: "⌂" },
      { label: "Ders Yönetimi", href: "/admin/lessons", icon: "\u{1F393}" },
      { label: "Not Girişi", href: "/admin/grades", icon: "\u{1F4DD}" },
      { label: "Sistem Ayarları", href: "/admin/settings", icon: "⚙" },
      { label: "Kullanıcılar", href: "/admin/users", icon: "\u{1F465}" },
    ],
  },
];

export default function AdminSidebar() {
  return <BaseSidebar menuSections={menuSections} activeColor="teal" />;
}
