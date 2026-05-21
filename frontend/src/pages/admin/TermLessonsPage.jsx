import { useMemo, useState } from "react";
import ResourceTable from "../../components/admin/ResourceTable.jsx";
import SearchableSelect from "../../components/ui/SearchableSelect.jsx";
import TermLessonStudentsDialog from "../../components/admin/TermLessonStudentsDialog.jsx";
import { termLessons, terms, lessons, users } from "../../services/resources.js";

const userLabel = (u) => {
  const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
  return name ? `${name} (${u.email})` : u.email;
};

export default function TermLessonsPage() {
  const [studentsFor, setStudentsFor] = useState(null);

  const { data: termList = [] } = terms.useList();
  const { data: lessonList = [] } = lessons.useList();
  const { data: instructorList = [] } = users.useList({ is_staff: true });

  const termOptions = useMemo(
    () => termList.map((t) => ({ value: t.id, label: `${t.term} ${t.year}` })),
    [termList]
  );
  const lessonOptions = useMemo(
    () => lessonList.map((l) => ({ value: l.id, label: `${l.code} - ${l.title}` })),
    [lessonList]
  );

  const termLabel = (id) => {
    const t = termList.find((x) => x.id === id);
    return t ? `${t.term} ${t.year}` : "-";
  };
  const lessonLabelById = (id) => {
    const l = lessonList.find((x) => x.id === id);
    return l ? `${l.code} - ${l.title}` : "-";
  };
  const instructorLabel = (id) => {
    const u = instructorList.find((x) => x.id === id);
    return u ? userLabel(u) : `#${id}`;
  };

  const displayTitle = (tl) => `${lessonLabelById(tl.lesson)} — ${termLabel(tl.term)}`;

  return (
    <>
      <ResourceTable
        resource={termLessons}
        title="Dönem-Ders Atamaları"
        subtitle="Dersleri dönemlere atayın, eğitmen ve grup kapasitesi belirleyin."
        addLabel="+ Yeni Atama"
        emptyForm={{ id: null, term: "", lesson: "", instructor: "", max_group_size: 5 }}
        getLabel={(r) => displayTitle(r)}
        columns={[
          { key: "id", header: "ID", render: (r) => `#${r.id}` },
          { key: "term", header: "DÖNEM", render: (r) => termLabel(r.term) },
          { key: "lesson", header: "DERS", render: (r) => lessonLabelById(r.lesson) },
          { key: "instructor", header: "EĞİTMEN", render: (r) => instructorLabel(r.instructor) },
          { key: "max_group_size", header: "MAKS. GRUP" },
        ]}
        fields={[
          { key: "term", label: "Dönem", options: termOptions, placeholder: "Dönem seçiniz..." },
          { key: "lesson", label: "Ders", options: lessonOptions, placeholder: "Ders seçiniz..." },
          {
            key: "instructor",
            label: "Eğitmen",
            render: ({ value, onChange }) => (
              <SearchableSelect
                label="Eğitmen"
                value={value}
                onChange={onChange}
                placeholder="İsim veya e-posta ile arayın..."
                useSearch={(q) => users.useList({ is_staff: true, ...(q ? { search: q } : {}) })}
                getOptionValue={(u) => u.id}
                getOptionLabel={userLabel}
              />
            ),
          },
          { key: "max_group_size", label: "Maksimum Grup Büyüklüğü", type: "number" },
        ]}
        extraActions={[
          {
            label: "Öğrenciler",
            colorPalette: "blue",
            onClick: (row) => setStudentsFor(row),
          },
        ]}
      />

      <TermLessonStudentsDialog
        open={!!studentsFor}
        onClose={() => setStudentsFor(null)}
        termLesson={studentsFor}
        displayTitle={studentsFor ? displayTitle(studentsFor) : ""}
      />
    </>
  );
}
