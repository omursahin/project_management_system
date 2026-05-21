import BaseSidebar from "./BaseSidebar.jsx";

const menuSections = [
  {
    label: "KOORDINASYON",
    items: [
      { label: "Gruplarım", href: "/coordinator/groups", icon: "☰" },
      { label: "Ders Yönetimi", href: "/coordinator/lessons", icon: "\u{1F393}" },
      { label: "Not Girişi", href: "/coordinator/grades", icon: "\u{1F4DD}" },
      { label: "Grup Projeleri", href: "/coordinator/group-projects", icon: "\u{1F4C1}" },
      { label: "Raporlar", href: "/coordinator/reports", icon: "\u{1F4CA}" },
    ],
  },
];

export default function CoordinatorSidebar() {
  return <BaseSidebar menuSections={menuSections} activeColor="blue" />;
}
