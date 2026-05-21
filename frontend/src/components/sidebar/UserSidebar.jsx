import BaseSidebar from "./BaseSidebar.jsx";

const menuSections = [
  {
    label: "GENEL",
    items: [
      { label: "Ana Sayfa", href: "/", icon: "⌂" },
      { label: "Panel", href: "/dashboard", icon: "▦" },
    ],
  },
  {
    label: "PROJE",
    items: [
      { label: "Gruplarım", href: "/groups", icon: "☰" },
      { label: "Grup Projeleri", href: "/group-projects", icon: "\u{1F4C1}" },
    ],
  },
  {
    label: "HESAP",
    items: [
      { label: "Profilim", href: "/profile", icon: "☃" },
      { label: "Ayarlar", href: "/settings", icon: "⚙" },
    ],
  },
];

export default function Sidebar() {
  return <BaseSidebar menuSections={menuSections} activeColor="teal" />;
}
