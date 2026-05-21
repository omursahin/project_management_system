import { useState } from "react";
import {
  Box, Table, Button, HStack, Text, Badge, Spinner, Alert, VStack,
} from "@chakra-ui/react";
import SearchableSelect from "../ui/SearchableSelect.jsx";
import { termLessonStudents, users } from "../../services/resources.js";

const studentLabel = (u) => {
  const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
  return name ? `${name} (${u.email})` : u.email;
};

/**
 * Bir TermLesson icin ogrenci listesi + ekleme arayuzu (dialog disindan da kullanilabilir).
 */
export default function TermLessonStudentsPanel({ termLesson }) {
  const [selectedStudent, setSelectedStudent] = useState("");

  const enabled = termLesson?.id != null;

  const { data: enrollments = [], isLoading } = termLessonStudents.useList(
    enabled ? { term_lesson: termLesson.id } : null
  );

  const createMutation = termLessonStudents.useCreate({
    onSuccess: () => setSelectedStudent(""),
  });
  const deleteMutation = termLessonStudents.useDelete();
  const approveMutation = termLessonStudents.useAction("approve", { method: "patch" });

  const handleAdd = () => {
    if (!selectedStudent) return;
    createMutation.mutate({
      student: selectedStudent,
      term_lesson: termLesson.id,
      midterm: 0,
      final: 0,
      make_up: 0,
    });
  };

  const enrolledIds = new Set(enrollments.map((e) => e.student));

  if (!enabled) {
    return (
      <Box textAlign="center" py={8} color="gray.400" fontSize="sm">
        Öncelikle bir ders seçin.
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={5}>
        <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={2}>
          Yeni öğrenci ekle
        </Text>
        <HStack align="start">
          <Box flex="1">
            <SearchableSelect
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              placeholder="Öğrenci ara (ad, soyad veya e-posta)..."
              useSearch={(q) =>
                users.useList({
                  is_staff: false,
                  is_superuser: false,
                  ...(q ? { search: q } : {}),
                })
              }
              getOptionValue={(u) => u.id}
              getOptionLabel={(u) => {
                const base = studentLabel(u);
                return enrolledIds.has(u.id) ? `${base} — zaten kayıtlı` : base;
              }}
            />
          </Box>
          <Button
            bg="teal.500"
            color="white"
            _hover={{ bg: "teal.600" }}
            onClick={handleAdd}
            loading={createMutation.isPending}
            disabled={!selectedStudent || enrolledIds.has(Number(selectedStudent))}
          >
            Ekle
          </Button>
        </HStack>
        {createMutation.error && (
          <Alert.Root status="error" mt={2} borderRadius="md">
            <Alert.Indicator />
            <Alert.Title fontSize="sm">
              {createMutation.error.response?.data?.detail ||
               "Ekleme başarısız oldu."}
            </Alert.Title>
          </Alert.Root>
        )}
      </Box>

      <Box>
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            Kayıtlı öğrenciler ({enrollments.length})
          </Text>
          {termLesson?.max_group_size && (
            <Text fontSize="xs" color="gray.400">
              Maks. grup büyüklüğü: {termLesson.max_group_size}
            </Text>
          )}
        </HStack>

        {isLoading ? (
          <Box textAlign="center" py={6}>
            <Spinner size="sm" color="teal.500" />
          </Box>
        ) : enrollments.length === 0 ? (
          <Box textAlign="center" py={6} color="gray.400" fontSize="sm">
            Henüz kayıtlı öğrenci yok.
          </Box>
        ) : (
          <Box border="1px solid" borderColor="gray.100" borderRadius="md" overflow="hidden">
            <Table.Root size="sm" variant="striped">
              <Table.Header>
                <Table.Row bg="gray.50">
                  <Table.ColumnHeader>ÖĞRENCİ</Table.ColumnHeader>
                  <Table.ColumnHeader>DURUM</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">İŞLEM</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {enrollments.map((e) => (
                  <Table.Row key={e.id}>
                    <Table.Cell>
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" fontWeight="medium" color="gray.700">
                          {e.student_name || `User #${e.student}`}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          ID: {e.student}
                        </Text>
                      </VStack>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        colorPalette={e.is_approved ? "green" : "yellow"}
                        variant="subtle"
                        borderRadius="full"
                        px={2}
                      >
                        {e.is_approved ? "Onaylandı" : "Beklemede"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell textAlign="end">
                      <HStack gap={2} justify="end">
                        {!e.is_approved && (
                          <Button
                            size="xs"
                            bg="green.500"
                            color="white"
                            _hover={{ bg: "green.600" }}
                            onClick={() => approveMutation.mutate({ id: e.id })}
                            loading={approveMutation.isPending && approveMutation.variables?.id === e.id}
                          >
                            Onayla
                          </Button>
                        )}
                        <Button
                          size="xs"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => deleteMutation.mutate(e.id)}
                          loading={deleteMutation.isPending && deleteMutation.variables === e.id}
                        >
                          Çıkar
                        </Button>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </Box>
    </Box>
  );
}
