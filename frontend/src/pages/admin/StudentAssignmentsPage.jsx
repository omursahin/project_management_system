import { useMemo, useState } from "react";
import { Box, Text, HStack, Badge } from "@chakra-ui/react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import SearchableSelect from "../../components/ui/SearchableSelect.jsx";
import TermLessonStudentsPanel from "../../components/admin/TermLessonStudentsPanel.jsx";
import { termLessons, terms, lessons, users } from "../../services/resources.js";

export default function StudentAssignmentsPage() {
  const [selectedId, setSelectedId] = useState("");

  const { data: termLessonList = [], isLoading } = termLessons.useList();
  const { data: lessonList = [] } = lessons.useList();
  const { data: termList = [] } = terms.useList();
  const { data: instructorList = [] } = users.useList({ is_staff: true });

  const formatOptionLabel = (tl) => {
    const l = lessonList.find((x) => x.id === tl.lesson);
    const t = termList.find((x) => x.id === tl.term);
    const i = instructorList.find((x) => x.id === tl.instructor);
    const lessonStr = l ? `${l.code} - ${l.title}` : `Lesson #${tl.lesson}`;
    const termStr = t ? `${t.term} ${t.year}` : "";
    const instStr = i ? `${i.first_name} ${i.last_name}`.trim() || i.email : "";
    return `${lessonStr} (${termStr})${instStr ? ` • ${instStr}` : ""}`;
  };

  const selected = useMemo(
    () => termLessonList.find((tl) => String(tl.id) === String(selectedId)),
    [termLessonList, selectedId]
  );

  return (
    <Box>
      <PageHeader
        title="Öğrenci Atamaları"
        subtitle="Bir dönem-ders seçin ve o derse öğrenci ekleyip çıkarın."
      />

      <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5} mb={5}>
        <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={2}>
          Dönem-Ders Seç
        </Text>
        <SearchableSelect
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          placeholder={isLoading ? "Yükleniyor..." : "Ders kodu, adı veya eğitmen ara..."}
          options={termLessonList.map((tl) => ({ value: tl.id, label: formatOptionLabel(tl) }))}
        />

        {selected && (
          <HStack gap={2} mt={3}>
            <Badge colorPalette="blue" variant="subtle" borderRadius="full" px={2}>
              {(() => {
                const t = termList.find((x) => x.id === selected.term);
                return t ? `${t.term} ${t.year}` : "Dönem";
              })()}
            </Badge>
            <Badge colorPalette="purple" variant="subtle" borderRadius="full" px={2}>
              Maks. grup: {selected.max_group_size}
            </Badge>
          </HStack>
        )}
      </Box>

      <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5}>
        <TermLessonStudentsPanel termLesson={selected} />
      </Box>
    </Box>
  );
}
