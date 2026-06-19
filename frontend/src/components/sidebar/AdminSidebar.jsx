import BaseSidebar from "./BaseSidebar.jsx";

const menuSections = [
  {
    label: "AKADEMİK YAPI",
    items: [
      { label: "Üniversiteler", href: "/admin/universities", icon: "\u{1F3DB}" },
      { label: "Fakülteler", href: "/admin/faculties", icon: "\u{1F3EB}" },
      { label: "Bölümler", href: "/admin/departments", icon: "\u{1F4DA}" },
    ],
  },
  {
    label: "DERS YÖNETİMİ",
    items: [
      { label: "Dönemler", href: "/admin/terms", icon: "\u{1F4C5}" },
      { label: "Dersler", href: "/admin/lessons", icon: "\u{1F393}" },
      { label: "Dönem-Ders Atama", href: "/admin/term-lessons", icon: "\u{1F517}" },
      { label: "Öğrenci Atama", href: "/admin/student-assignments", icon: "\u{1F468}‍\u{1F393}" },
    ],
  },
  {
    label: "SİSTEM",
    items: [
      { label: "Kullanıcılar", href: "/admin/users", icon: "\u{1F465}" },
      { label: "Sistem Ayarları", href: "/admin/settings", icon: "⚙" },
    ],
  },
];

export default function AdminSidebar() {
  return <BaseSidebar menuSections={menuSections} activeColor="teal" />;
}
