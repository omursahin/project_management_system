import { useState, useMemo } from "react";
import {
  Box, Flex, Button, Text, Input,
  Select, createListCollection, Spinner, Alert,
} from "@chakra-ui/react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import {
  termLessons as termLessonsResource,
  termLessonStudents as termLessonStudentsResource,
} from "../../services/resources.js";

function currentUserId() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}")?.id ?? null;
  } catch {
    return null;
  }
}

export default function NotGirisi() {
  const [selectedTermLesson, setSelectedTermLesson] = useState("");
  const [edits, setEdits] = useState({}); // { studentId: { midterm, final, make_up } }
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const me = currentUserId();
  const { data: termLessons = [], isLoading: tlLoading } =
    termLessonsResource.useList();
  const myTermLessons = useMemo(
    () => termLessons.filter((tl) => tl.instructor === me),
    [termLessons, me]
  );

  const { data: students = [], isLoading: studentsLoading } =
    termLessonStudentsResource.useList(
      selectedTermLesson ? { term_lesson: selectedTermLesson } : undefined
    );

  const patchStudent = termLessonStudentsResource.usePatch();
  const approveStudent = termLessonStudentsResource.useAction("approve", {
    method: "patch",
  });

  const collection = createListCollection({
    items: myTermLessons,
    itemToString: (i) => `Dönem ${i.term} - Ders ${i.lesson}`,
    itemToValue: (i) => String(i.id),
  });

  const handleGradeChange = (studentId, field, value) => {
    setEdits((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    const ids = Object.keys(edits);
    if (ids.length === 0) {
      setSuccess("Kaydedilecek değişiklik yok.");
      return;
    }
    try {
      for (const sid of ids) {
        const e = edits[sid];
        const payload = {};
        if (e.midterm !== undefined && e.midterm !== "") payload.midterm = Number(e.midterm);
        if (e.final !== undefined && e.final !== "") payload.final = Number(e.final);
        if (e.make_up !== undefined && e.make_up !== "") payload.make_up = Number(e.make_up);
        if (Object.keys(payload).length === 0) continue;
        await patchStudent.mutateAsync({ id: Number(sid), ...payload });
      }
      setEdits({});
      setSuccess("Notlar kaydedildi.");
    } catch (err) {
      setError(err?.response?.data?.detail || "Kayıt sırasında hata oluştu.");
    }
  };

  const handleBulkApprove = async () => {
    setError("");
    setSuccess("");
    try {
      for (const s of students) {
        if (!s.is_approved) {
          await approveStudent.mutateAsync({ id: s.id });
        }
      }
      setSuccess("Tüm onaylar tamamlandı.");
    } catch (err) {
      setError(err?.response?.data?.detail || "Onay sırasında hata oluştu.");
    }
  };

  return (
    <Box>
      <PageHeader
        title="Öğrenci Not Girişi"
        subtitle="Verdiğiniz dönem dersine kayıtlı öğrencilerin notlarını girin."
      />

      {error && (
        <Alert.Root status="error" mb={4} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title fontSize="sm">{error}</Alert.Title>
        </Alert.Root>
      )}
      {success && (
        <Alert.Root status="success" mb={4} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title fontSize="sm">{success}</Alert.Title>
        </Alert.Root>
      )}

      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Flex align="center" gap={3}>
          <Text fontWeight="semibold" color="gray.600">Ders Seçimi:</Text>
          <Box minW="280px">
            <Select.Root
              collection={collection}
              value={selectedTermLesson ? [selectedTermLesson] : []}
              onValueChange={(e) => setSelectedTermLesson(e.value[0] ?? "")}
              disabled={tlLoading}
            >
              <Select.Trigger>
                <Select.ValueText
                  placeholder={tlLoading ? "Yükleniyor..." : "Bir ders seçin"}
                />
              </Select.Trigger>
              <Select.Content>
                {myTermLessons.map((tl) => (
                  <Select.Item key={tl.id} item={tl}>
                    Dönem {tl.term} - Ders {tl.lesson}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
        </Flex>

        {selectedTermLesson && (
          <Button
            onClick={handleBulkApprove}
            colorPalette="teal"
            size="sm"
            loading={approveStudent.isPending}
          >
            Tümünü Toplu Onayla
          </Button>
        )}
      </Flex>

      {!selectedTermLesson && (
        <Text color="gray.500" textAlign="center" py={10}>
          Not girişi için önce bir ders seçin.
        </Text>
      )}

      {selectedTermLesson && studentsLoading && (
        <Flex justify="center" py={10}><Spinner color="teal.500" /></Flex>
      )}

      {selectedTermLesson && !studentsLoading && students.length === 0 && (
        <Text color="gray.500" textAlign="center" py={10}>
          Bu derse kayıtlı öğrenci yok.
        </Text>
      )}

      {selectedTermLesson && !studentsLoading && students.length > 0 && (
        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="md" overflowX="auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #edf2f7" }}>
              <tr>
                <th style={{ padding: "12px", textAlign: "left", color: "#4a5568" }}>Öğrenci</th>
                <th style={{ padding: "12px", textAlign: "center", color: "#4a5568" }}>Vize</th>
                <th style={{ padding: "12px", textAlign: "center", color: "#4a5568" }}>Final</th>
                <th style={{ padding: "12px", textAlign: "center", color: "#4a5568" }}>Bütünleme</th>
                <th style={{ padding: "12px", textAlign: "center", color: "#4a5568" }}>Durum</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #edf2f7" }}>
                  <td style={{ padding: "12px", color: "#2d3748", fontWeight: 500 }}>
                    {s.student_name || `#${s.student}`}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <Input
                      size="sm" type="number" w="80px" min={0} max={100}
                      defaultValue={s.midterm ?? ""}
                      onChange={(e) => handleGradeChange(s.id, "midterm", e.target.value)}
                    />
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <Input
                      size="sm" type="number" w="80px" min={0} max={100}
                      defaultValue={s.final ?? ""}
                      onChange={(e) => handleGradeChange(s.id, "final", e.target.value)}
                    />
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <Input
                      size="sm" type="number" w="80px" min={0} max={100}
                      defaultValue={s.make_up ?? ""}
                      onChange={(e) => handleGradeChange(s.id, "make_up", e.target.value)}
                    />
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <Text fontSize="sm" color={s.is_approved ? "green.600" : "gray.500"}>
                      {s.is_approved ? "Onaylı" : "Beklemede"}
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}

      {selectedTermLesson && students.length > 0 && (
        <Flex justify="flex-end" mt={6} gap={3}>
          <Button variant="ghost" onClick={() => setEdits({})}>İptal</Button>
          <Button colorPalette="blue" onClick={handleSave} loading={patchStudent.isPending}>
            Notları Kaydet
          </Button>
        </Flex>
      )}
    </Box>
  );
}
