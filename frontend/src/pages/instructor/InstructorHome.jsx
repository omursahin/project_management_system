import { useMemo } from "react";
import {
  Box, SimpleGrid, Heading, Text, Flex, Badge, Button, HStack,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { getStoredUser } from "../../services/auth.js";
import { termLessons, lessons, terms, groups, groupProjects } from "../../services/resources.js";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

function StatBox({ label, value, sub }) {
  return (
    <Box bg="whiteAlpha.200" borderRadius="lg" px={4} py={3} minW="120px">
      <Text fontSize="2xl" fontWeight="bold" lineHeight="1">{value}</Text>
      <Text fontSize="xs" opacity={0.85} mt={1}>{label}</Text>
      {sub && <Text fontSize="xs" opacity={0.6} mt={0.5}>{sub}</Text>}
    </Box>
  );
}

function LessonCard({ tl, lessonInfo, termInfo, groupCount, projectCount }) {
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
      <Flex justify="space-between" align="start" mb={2}>
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

      <HStack gap={6} mt={3} mb={4}>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="blue.600" lineHeight="1">{groupCount}</Text>
          <Text fontSize="xs" color="gray.500">Grup</Text>
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="purple.600" lineHeight="1">{projectCount}</Text>
          <Text fontSize="xs" color="gray.500">Proje</Text>
        </Box>
      </HStack>

      <Button size="sm" variant="outline" colorPalette="blue" w="full">
        Yönet →
      </Button>
    </Box>
  );
}

function SectionPlaceholder({ title, text, icon }) {
  return (
    <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={6} textAlign="center">
      <Text fontSize="3xl" mb={2}>{icon}</Text>
      <Heading size="sm" color="gray.600" mb={1}>{title}</Heading>
      <Text fontSize="sm" color="gray.400">{text}</Text>
    </Box>
  );
}

export default function InstructorHome() {
  const user = getStoredUser();
  const greeting = getGreeting();

  // Eğitmenin tüm dönem-ders atamaları
  const { data: myTermLessons = [], isLoading: tlLoading } = termLessons.useList(
    user?.id ? { instructor: user.id } : null
  );

  // Tüm dersler, dönemler — label çözümü için
  const { data: lessonList = [] } = lessons.useList();
  const { data: termList = [] } = terms.useList();

  // Grup ve projeler (tablo lookup'ları için tek seferde çek)
  const { data: allGroups = [] } = groups.useList();
  const { data: allProjects = [] } = groupProjects.useList();

  const stats = useMemo(() => {
    const tlIds = new Set(myTermLessons.map((t) => t.id));
    const myGroups = allGroups.filter((g) => tlIds.has(g.term_lesson));
    const myProjects = allProjects.filter((p) => {
      const g = allGroups.find((x) => x.id === p.group);
      return g && tlIds.has(g.term_lesson);
    });
    const studentCount = myGroups.reduce((acc, g) => acc + (g.member_count || 0), 0);
    return {
      lessonCount: myTermLessons.length,
      groupCount: myGroups.length,
      studentCount,
      projectCount: myProjects.length,
    };
  }, [myTermLessons, allGroups, allProjects]);

  const lessonInfo = (id) => lessonList.find((l) => l.id === id);
  const termInfo = (id) => termList.find((t) => t.id === id);
  const countGroups = (tlId) => allGroups.filter((g) => g.term_lesson === tlId).length;
  const countProjects = (tlId) => allProjects.filter((p) => {
    const g = allGroups.find((x) => x.id === p.group);
    return g && g.term_lesson === tlId;
  }).length;

  return (
    <Box>
      {/* HERO */}
      <Box
        bgGradient="to-r"
        gradientFrom="blue.500"
        gradientTo="teal.400"
        borderRadius="2xl"
        p={{ base: 6, md: 8 }}
        color="white"
        mb={6}
      >
        <Text fontSize="sm" opacity={0.85} mb={1}>{greeting}</Text>
        <Heading size="xl" mb={1}>
          {user?.first_name || "Eğitmen"} {user?.last_name || ""}
        </Heading>
        <Text fontSize="sm" opacity={0.9} mb={5}>
          Derslerinize, gruplarınıza ve projelere buradan göz atın.
        </Text>
        <Flex gap={3} flexWrap="wrap">
          <StatBox label="Yürüttüğüm Ders" value={stats.lessonCount} />
          <StatBox label="Grup" value={stats.groupCount} />
          <StatBox label="Öğrenci" value={stats.studentCount} />
          <StatBox label="Proje" value={stats.projectCount} />
        </Flex>
      </Box>

      {/* MY LESSONS */}
      <Flex align="center" justify="space-between" mb={3}>
        <Heading size="md" color="gray.700">Bu Dönem Verdiğim Dersler</Heading>
        <Text fontSize="sm" color="gray.500">{myTermLessons.length} ders</Text>
      </Flex>

      {tlLoading ? (
        <Text color="gray.500" fontSize="sm">Yükleniyor...</Text>
      ) : myTermLessons.length === 0 ? (
        <SectionPlaceholder
          icon={"\u{1F4D6}"}
          title="Henüz atanmış ders yok"
          text="Yönetici bu döneme ait bir ders atamasi yaptığında burada görünecek."
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4} mb={8}>
          {myTermLessons.map((tl) => (
            <LessonCard
              key={tl.id}
              tl={tl}
              lessonInfo={lessonInfo(tl.lesson)}
              termInfo={termInfo(tl.term)}
              groupCount={countGroups(tl.id)}
              projectCount={countProjects(tl.id)}
            />
          ))}
        </SimpleGrid>
      )}

      {/* UPCOMING + ACTIVITY */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <SectionPlaceholder
          icon={"\u{1F4C5}"}
          title="Yaklaşan Tarihler"
          text="Not girişi ve proje teslim tarihleri burada listelenecek. (Yakında)"
        />
        <SectionPlaceholder
          icon={"\u{1F514}"}
          title="Son Aktiviteler"
          text="Yeni grup oluşturma, proje gönderimi gibi olaylar burada görünecek. (Yakında)"
        />
      </SimpleGrid>
    </Box>
  );
}
