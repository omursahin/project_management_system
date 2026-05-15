import BaseSidebar from "./BaseSidebar.jsx";

const menuSections = [
  {
    label: "YÖNETİM",
    items: [
      { label: "Üniversiteler", href: "/admin/universities", icon: "\u2302" },
      { label: "Sistem Ayarları", href: "/admin/settings", icon: "\u2699" },
      { label: "Kullanıcılar", href: "/admin/users", icon: "\u{1F465}" },
    ],
  },
];

export default function AdminSidebar() {
  return <BaseSidebar menuSections={menuSections} activeColor="teal" />;
}
