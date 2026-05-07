import BaseSidebar from "./BaseSidebar.jsx";

const menuSections = [
  {
    label: "KOORDINASYON",
    items: [
      { label: "Gruplarım", href: "/coordinator/groups", icon: "\u2630" },
      { label: "Ders Yönetimi", href: "/coordinator/lessons", icon: "\u{1F393}" },
      { label: "Raporlar", href: "/coordinator/reports", icon: "\u{1F4CA}" },
    ],
  },
];

export default function CoordinatorSidebar() {
  return <BaseSidebar menuSections={menuSections} activeColor="blue" />;
}
