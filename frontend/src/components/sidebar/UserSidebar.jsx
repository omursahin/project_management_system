import BaseSidebar from "./BaseSidebar.jsx";

const menuSections = [
  {
    label: "GENEL",
    items: [
      { label: "Ana Sayfa", href: "/", icon: "⌂" },
      { label: "Derslerim", href: "/lessons", icon: "\u{1F393}" },
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
