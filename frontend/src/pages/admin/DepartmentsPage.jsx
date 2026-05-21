import ResourceTable from "../../components/admin/ResourceTable.jsx";
import { departments, faculties } from "../../services/resources.js";

export default function DepartmentsPage() {
  const { data: facultyList = [] } = faculties.useList();

  const facultyOptions = facultyList.map((f) => ({ value: f.id, label: f.title }));
  const facultyName = (id) => facultyList.find((f) => f.id === id)?.title || "-";

  return (
    <ResourceTable
      resource={departments}
      title="Bölümler"
      subtitle="Fakültelere bağlı bölümleri yönetin."
      addLabel="+ Yeni Bölüm"
      emptyForm={{ id: null, faculty: "", name: "" }}
      getLabel={(r) => r.name}
      columns={[
        { key: "id", header: "ID", render: (r) => `#${r.id}` },
        { key: "name", header: "BÖLÜM ADI" },
        { key: "faculty", header: "FAKÜLTE", render: (r) => facultyName(r.faculty) },
      ]}
      fields={[
        { key: "faculty", label: "Fakülte", options: facultyOptions, placeholder: "Fakülte seçiniz..." },
        { key: "name", label: "Bölüm Adı" },
      ]}
    />
  );
}
