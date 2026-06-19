import ResourceTable from "../../components/admin/ResourceTable.jsx";
import { faculties, universities } from "../../services/resources.js";

export default function FacultiesPage() {
  const { data: universityList = [] } = universities.useList();

  const universityOptions = universityList.map((u) => ({ value: u.id, label: u.name }));
  const universityName = (id) => universityList.find((u) => u.id === id)?.name || "-";

  return (
    <ResourceTable
      resource={faculties}
      title="Fakülteler"
      subtitle="Üniversitelere bağlı fakülteleri yönetin."
      addLabel="+ Yeni Fakülte"
      emptyForm={{ id: null, university: "", title: "", short_title: "", faculty_code: "", description: "" }}
      columns={[
        { key: "id", header: "ID", render: (r) => `#${r.id}` },
        { key: "title", header: "FAKÜLTE ADI" },
        { key: "short_title", header: "KISA AD" },
        { key: "faculty_code", header: "KOD" },
        { key: "university", header: "ÜNİVERSİTE", render: (r) => universityName(r.university) },
        {
          key: "description",
          header: "AÇIKLAMA",
          render: (r) => (
            <span title={r.description || ""}>
              {r.description
                ? (r.description.length > 60 ? `${r.description.slice(0, 60)}…` : r.description)
                : <span style={{ color: "#A0AEC0" }}>—</span>}
            </span>
          ),
        },
      ]}
      fields={[
        { key: "university", label: "Üniversite", options: universityOptions, placeholder: "Üniversite seçiniz..." },
        { key: "title", label: "Fakülte Adı" },
        { key: "short_title", label: "Kısa Ad" },
        { key: "faculty_code", label: "Fakülte Kodu" },
        { key: "description", label: "Açıklama", multiline: true, rows: 3 },
      ]}
    />
  );
}
