import BaseSidebar from "./BaseSidebar.jsx";

const menuSections = [
  {
    label: "GENEL",
    items: [
      { label: "Ana Sayfa", href: "/instructor", icon: "⌂" },
      { label: "Derslerim", href: "/instructor/lessons", icon: "\u{1F393}" },
    ],
  },
  {
    label: "HESAP",
    items: [
      { label: "Profilim", href: "/instructor/profile", icon: "☃" },
      { label: "Ayarlar", href: "/instructor/settings", icon: "⚙" },
    ],
  },
];

export default function CoordinatorSidebar() {
  return <BaseSidebar menuSections={menuSections} activeColor="blue" />;
}
