import {
  Box, SimpleGrid, Heading, Text, Flex, Badge, Spinner, Button,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { getStoredUser } from "../../services/auth.js";
import { termLessonStudents, termLessons, terms, lessons, users } from "../../services/resources.js";

function LessonCard({ enrollment, termLesson, lesson, term, instructor }) {
  return (
    <Box
      as={Link}
      to={`/lessons/${termLesson?.id}`}
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="xl"
      p={5}
      cursor="pointer"
      transition="all 0.15s"
      _hover={{ shadow: "md", borderColor: "teal.300", transform: "translateY(-2px)" }}
      textDecoration="none"
      display="block"
    >
      <Flex justify="space-between" align="start" mb={2}>
        <Box>
          <Heading size="sm" color="gray.800" mb={1}>
            {lesson ? `${lesson.code} — ${lesson.title}` : `Ders #${enrollment.term_lesson}`}
          </Heading>
          <Text fontSize="xs" color="gray.500">
            {term ? `${term.term} ${term.year}` : ""}
            {instructor && (
              <> • {[instructor.first_name, instructor.last_name].filter(Boolean).join(" ") || instructor.email}</>
            )}
          </Text>
        </Box>
        <Badge
          colorPalette={enrollment.is_approved ? "green" : "yellow"}
          variant="subtle"
          borderRadius="full"
          px={2}
        >
          {enrollment.is_approved ? "Onaylandı" : "Beklemede"}
        </Badge>
      </Flex>

      {lesson?.description && (
        <Text fontSize="sm" color="gray.500" mt={2} lineClamp={2}>
          {lesson.description}
        </Text>
      )}

      <Button mt={4} size="sm" variant="outline" colorPalette="teal" w="full">
        Derse Git →
      </Button>
    </Box>
  );
}

export default function StudentLessonsPage() {
  const user = getStoredUser();

  const { data: enrollments = [], isLoading } = termLessonStudents.useList(
    user?.id ? { student: user.id } : null
  );

  // Lookup tablolari
  const { data: termLessonList = [] } = termLessons.useList();
  const { data: lessonList = [] } = lessons.useList();
  const { data: termList = [] } = terms.useList();
  const { data: instructorList = [] } = users.useList({ is_staff: true });

  const tlById = (id) => termLessonList.find((x) => x.id === id);
  const lessonById = (id) => lessonList.find((x) => x.id === id);
  const termById = (id) => termList.find((x) => x.id === id);
  const userById = (id) => instructorList.find((x) => x.id === id);

  return (
    <Box>
      <PageHeader
        title="Derslerim"
        subtitle="Kayıtlı olduğunuz dersleri görüntüleyin ve gruplara katılın."
      />

      {isLoading ? (
        <Flex justify="center" py={12}>
          <Spinner size="xl" color="teal.500" />
        </Flex>
      ) : enrollments.length === 0 ? (
        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={8} textAlign="center">
          <Text fontSize="3xl" mb={2}>{"\u{1F4D6}"}</Text>
          <Heading size="sm" color="gray.600" mb={1}>Henüz kayıtlı bir dersiniz yok</Heading>
          <Text fontSize="sm" color="gray.400">
            Bir derse atandığınızda burada görünecek. Eğitmen veya yönetici ile iletişime geçin.
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {enrollments.map((e) => {
            const tl = tlById(e.term_lesson);
            return (
              <LessonCard
                key={e.id}
                enrollment={e}
                termLesson={tl}
                lesson={tl ? lessonById(tl.lesson) : null}
                term={tl ? termById(tl.term) : null}
                instructor={tl ? userById(tl.instructor) : null}
              />
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}
