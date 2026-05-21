import {
  Box, SimpleGrid, Heading, Text, Flex, Badge, Button, HStack, Spinner,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { getStoredUser } from "../../services/auth.js";
import { termLessons, terms, lessons, termLessonStudents, groupProjects } from "../../services/resources.js";

function LessonCard({ tl, lessonInfo, termInfo, studentCount, pendingProjectCount }) {
  return (
    <Box
      as={Link}
      to={`/instructor/lessons/${tl.id}`}
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="xl"
      p={5}
      transition="all 0.15s"
      _hover={{ shadow: "md", borderColor: "blue.300", transform: "translateY(-2px)" }}
      textDecoration="none"
      display="block"
    >
      <Flex justify="space-between" align="start" mb={3}>
        <Box>
          <Heading size="sm" color="gray.800" mb={1}>
            {lessonInfo ? `${lessonInfo.code} — ${lessonInfo.title}` : `TermLesson #${tl.id}`}
          </Heading>
          <Text fontSize="xs" color="gray.500">
            {termInfo ? `${termInfo.term} ${termInfo.year}` : ""}
          </Text>
        </Box>
        <Badge colorPalette="blue" variant="subtle" borderRadius="full" px={2}>
          {tl.max_group_size} kişilik
        </Badge>
      </Flex>

      <HStack gap={6} mb={4}>
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="teal.600" lineHeight="1">
            {studentCount}
          </Text>
          <Text fontSize="xs" color="gray.500">Kayıtlı Öğrenci</Text>
        </Box>
        {pendingProjectCount > 0 && (
          <Box>
            <Text fontSize="xl" fontWeight="bold" color="blue.600" lineHeight="1">
              {pendingProjectCount}
            </Text>
            <Text fontSize="xs" color="gray.500">Onay Bekleyen</Text>
          </Box>
        )}
      </HStack>

      <Button size="sm" variant="outline" colorPalette="blue" w="full">
        Yönet →
      </Button>
    </Box>
  );
}

export default function MyTermLessonsPage() {
  const user = getStoredUser();

  const { data: myTermLessons = [], isLoading } = termLessons.useList(
    user?.id ? { instructor: user.id } : null
  );
  const { data: lessonList = [] } = lessons.useList();
  const { data: termList = [] } = terms.useList();
  const { data: enrollments = [] } = termLessonStudents.useList();
  const { data: allProjects = [] } = groupProjects.useList();

  const lessonInfo = (id) => lessonList.find((l) => l.id === id);
  const termInfo = (id) => termList.find((t) => t.id === id);
  const studentCount = (tlId) => enrollments.filter((e) => e.term_lesson === tlId).length;
  // Bu derse ait, onaya gonderilmis ve hala onaylanmamis projeler
  const pendingProjectCount = (tlId) => {
    // group_project'lerin term_lesson erisimi yok serializer'da - bu yuzden direkt sayamiyoruz
    // simdilik tum bekleyen projeleri donelim (detay sayfasinda dogru filtre var)
    return allProjects.filter((p) => p.status === "submitted" && !p.is_approved).length;
  };

  return (
    <Box>
      <PageHeader
        title="Derslerim"
        subtitle="Bu dönem yürüttüğünüz dersler. Detay için karta tıklayın."
      />

      {isLoading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="teal.500" />
        </Box>
      ) : myTermLessons.length === 0 ? (
        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={8} textAlign="center">
          <Text fontSize="3xl" mb={2}>{"\u{1F4D6}"}</Text>
          <Heading size="sm" color="gray.600" mb={1}>Henüz atanmış ders yok</Heading>
          <Text fontSize="sm" color="gray.400">
            Yönetici size bir ders ataması yaptığında burada görünecek.
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {myTermLessons.map((tl) => (
            <LessonCard
              key={tl.id}
              tl={tl}
              lessonInfo={lessonInfo(tl.lesson)}
              termInfo={termInfo(tl.term)}
              studentCount={studentCount(tl.id)}
              pendingProjectCount={pendingProjectCount(tl.id)}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
