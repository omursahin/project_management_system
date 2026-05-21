import BaseSidebar from "./BaseSidebar.jsx";

const menuSections = [
  {
    label: "GENEL",
    items: [
      { label: "Ana Sayfa", href: "/", icon: "\u2302" },
      { label: "Panel", href: "/dashboard", icon: "\u25A6" },
    ],
  },
  {
    label: "PROJE",
    items: [
      { label: "Gruplarım", href: "/groups", icon: "\u2630" },
        { label: "Rapor Yükle", href: "/upload-report", icon: "📤" },
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
