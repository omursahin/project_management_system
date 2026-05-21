import ResourceTable from "../../components/admin/ResourceTable.jsx";
import { terms } from "../../services/resources.js";

const TERM_OPTIONS = [
  { value: "Guz", label: "Güz" },
  { value: "Bahar", label: "Bahar" },
  { value: "Yaz", label: "Yaz" },
];

export default function TermsPage() {
  return (
    <ResourceTable
      resource={terms}
      title="Dönemler"
      subtitle="Akademik dönemleri (yarıyıl) yönetin."
      addLabel="+ Yeni Dönem"
      emptyForm={{ id: null, term: "", year: new Date().getFullYear() }}
      getLabel={(r) => `${r.term} ${r.year}`}
      columns={[
        { key: "id", header: "ID", render: (r) => `#${r.id}` },
        { key: "term", header: "DÖNEM" },
        { key: "year", header: "YIL" },
      ]}
      fields={[
        { key: "term", label: "Dönem", options: TERM_OPTIONS, placeholder: "Dönem seçiniz..." },
        { key: "year", label: "Yıl", type: "number" },
      ]}
    />
  );
}
