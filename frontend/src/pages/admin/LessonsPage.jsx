import ResourceTable from "../../components/admin/ResourceTable.jsx";
import { lessons, departments } from "../../services/resources.js";

export default function LessonsPage() {
  const { data: departmentList = [] } = departments.useList();

  const departmentOptions = departmentList.map((d) => ({ value: d.id, label: d.name }));
  const departmentName = (id) => departmentList.find((d) => d.id === id)?.name || "-";

  return (
    <ResourceTable
      resource={lessons}
      title="Dersler"
      subtitle="Bölümlere bağlı dersleri yönetin."
      addLabel="+ Yeni Ders"
      emptyForm={{ id: null, department: "", code: "", title: "", description: "" }}
      columns={[
        { key: "id", header: "ID", render: (r) => `#${r.id}` },
        { key: "code", header: "KOD" },
        { key: "title", header: "DERS ADI" },
        { key: "department", header: "BÖLÜM", render: (r) => departmentName(r.department) },
      ]}
      fields={[
        { key: "department", label: "Bölüm", options: departmentOptions, placeholder: "Bölüm seçiniz..." },
        { key: "code", label: "Ders Kodu", placeholder: "Örn: CENG201" },
        { key: "title", label: "Ders Adı" },
        { key: "description", label: "Açıklama", multiline: true, rows: 3 },
      ]}
    />
  );
}
