import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box, Heading, Text, Flex, Badge, Button, HStack, VStack, SimpleGrid,
  Spinner, Alert, Separator,
} from "@chakra-ui/react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Modal from "../../components/ui/Modal.jsx";
import TermLessonStudentsPanel from "../../components/admin/TermLessonStudentsPanel.jsx";
import { getStoredUser } from "../../services/auth.js";
import {
  termLessons, lessons, terms, users,
  groups as groupsResource, groupMembers, groupProjects, termLessonStudents,
} from "../../services/resources.js";

const userFullName = (u) =>
  u ? ([u.first_name, u.last_name].filter(Boolean).join(" ") || u.email) : "";

const PROJECT_STATUSES = {
  draft: { label: "Taslak", color: "gray" },
  submitted: { label: "Onaya Gönderildi", color: "blue" },
  review: { label: "İncelemede", color: "yellow" },
  approved: { label: "Onaylandı", color: "green" },
  rejected: { label: "Reddedildi", color: "red" },
};

/* ───── Tek bir grup karti — uyeleri + bekleyen istekler ───── */
function GroupAdminCard({ group }) {
  const { data: detail } = groupsResource.useDetail(group.id);
  const g = detail || group;
  const members = g.members || [];
  const accepted = members.filter((m) => m.status === "accepted");
  const pending = members.filter((m) => m.status === "pending");

  const acceptMutation = groupMembers.useAction("accept", { method: "patch", invalidate: false });
  const rejectMutation = groupMembers.useAction("reject", { method: "patch", invalidate: false });
  const removeMutation = groupMembers.useDelete({ invalidate: false });
  const { refetch } = groupsResource.useList();
  const afterChange = () => refetch();

  return (
    <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4}>
      <Flex justify="space-between" align="start" mb={2}>
        <Box>
          <Heading size="sm" color="gray.800">{g.name}</Heading>
          {g.description && (
            <Text fontSize="xs" color="gray.500" lineClamp={2} mt={1}>{g.description}</Text>
          )}
        </Box>
        <Badge colorPalette={accepted.length >= g.max_members ? "red" : "green"} variant="subtle" borderRadius="full" px={2}>
          {accepted.length}/{g.max_members}
        </Badge>
      </Flex>

      {pending.length > 0 && (
        <Box mt={3}>
          <Text fontSize="xs" color="yellow.700" fontWeight="medium" mb={1}>
            Bekleyen istekler ({pending.length})
          </Text>
          <VStack align="stretch" gap={1}>
            {pending.map((m) => (
              <Flex
                key={m.id}
                bg="yellow.50"
                border="1px solid"
                borderColor="yellow.200"
                borderRadius="md"
                px={2}
                py={1}
                align="center"
                justify="space-between"
              >
                <Text fontSize="sm" color="gray.700">
                  {m.full_name || m.user_email || `User #${m.user}`}
                </Text>
                <HStack gap={1}>
                  <Button
                    size="xs"
                    bg="green.500"
                    color="white"
                    _hover={{ bg: "green.600" }}
                    onClick={() => acceptMutation.mutate({ id: m.id }, { onSuccess: afterChange })}
                    loading={acceptMutation.isPending && acceptMutation.variables?.id === m.id}
                  >
                    Kabul
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    colorPalette="red"
                    onClick={() => rejectMutation.mutate({ id: m.id }, { onSuccess: afterChange })}
                    loading={rejectMutation.isPending && rejectMutation.variables?.id === m.id}
                  >
                    Reddet
                  </Button>
                </HStack>
              </Flex>
            ))}
          </VStack>
        </Box>
      )}

      {accepted.length > 0 && (
        <Box mt={3}>
          <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={1}>Üyeler</Text>
          <VStack align="stretch" gap={1}>
            {accepted.map((m) => {
              const isLeader = m.user === g.owner;
              return (
                <Flex key={m.id} align="center" justify="space-between" py={0.5}>
                  <HStack gap={2}>
                    <Text fontSize="sm" color="gray.700">
                      {m.full_name || m.user_email || `User #${m.user}`}
                    </Text>
                    {isLeader && <Badge colorPalette="purple" variant="subtle" fontSize="xs">Lider</Badge>}
                  </HStack>
                  {!isLeader && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => removeMutation.mutate(m.id, { onSuccess: afterChange })}
                      loading={removeMutation.isPending && removeMutation.variables === m.id}
                    >
                      Çıkar
                    </Button>
                  )}
                </Flex>
              );
            })}
          </VStack>
        </Box>
      )}
    </Box>
  );
}

/* ───── Proje karti (egitmen aksiyonlu) ───── */
function ProjectAdminCard({ project, groupName }) {
  const meta = PROJECT_STATUSES[project.status] || { label: project.status, color: "gray" };
  const approveMutation = groupProjects.useAction("approve", { method: "patch" });
  const rejectMutation = groupProjects.usePatch();

  const canApprove = !project.is_approved;
  const canReject = !project.is_approved && project.status !== "rejected";

  return (
    <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4}>
      <Flex justify="space-between" align="start" mb={2}>
        <Box flex="1">
          <Heading size="sm" color="gray.800">{project.title}</Heading>
          {groupName && (
            <Text fontSize="xs" color="gray.500">Grup: {groupName}</Text>
          )}
        </Box>
        <HStack gap={2}>
          <Badge colorPalette={meta.color} variant="subtle" borderRadius="full">
            {meta.label}
          </Badge>
          {project.is_approved && (
            <Badge colorPalette="green" variant="solid" borderRadius="full">Onaylı</Badge>
          )}
        </HStack>
      </Flex>
      {project.description && (
        <Text fontSize="sm" color="gray.500" lineClamp={3} mb={3}>{project.description}</Text>
      )}

      {(canApprove || canReject) && (
        <HStack gap={2} mt={2}>
          {canApprove && (
            <Button
              size="sm"
              bg="green.500"
              color="white"
              _hover={{ bg: "green.600" }}
              loading={approveMutation.isPending}
              onClick={() => approveMutation.mutate({ id: project.id })}
            >
              Onayla
            </Button>
          )}
          {canReject && (
            <Button
              size="sm"
              variant="outline"
              colorPalette="red"
              loading={rejectMutation.isPending}
              onClick={() => rejectMutation.mutate({ id: project.id, status: "rejected" })}
            >
              Reddet
            </Button>
          )}
        </HStack>
      )}
    </Box>
  );
}

/* ───── Ana sayfa ───── */
export default function InstructorLessonDetailPage() {
  const { id } = useParams();
  const termLessonId = Number(id);
  const user = getStoredUser();

  const { data: tlList = [] } = termLessons.useList();
  const { data: lessonList = [] } = lessons.useList();
  const { data: termList = [] } = terms.useList();

  const tl = tlList.find((x) => x.id === termLessonId);
  const lessonInfo = tl ? lessonList.find((l) => l.id === tl.lesson) : null;
  const termInfo = tl ? termList.find((t) => t.id === tl.term) : null;

  const { data: lessonGroups = [], isLoading: groupsLoading } = groupsResource.useList(
    { term_lesson: termLessonId }
  );
  const groupIds = new Set(lessonGroups.map((g) => g.id));

  // Tum projeleri cek, sonra bu derse ait olanlari filtrele
  const { data: allProjects = [] } = groupProjects.useList({ term_lesson: termLessonId });
  const submittedProjects = allProjects.filter((p) => p.status === "submitted" && !p.is_approved);
  const otherProjects = allProjects.filter((p) => !(p.status === "submitted" && !p.is_approved));

  const groupName = (gid) => lessonGroups.find((g) => g.id === gid)?.name || `Grup #${gid}`;

  // Yetki kontrolu
  const isMyLesson = tl && tl.instructor === user?.id;

  if (tlList.length > 0 && !tl) {
    return (
      <Box>
        <PageHeader title="Ders Bulunamadı" />
        <Text color="gray.500">Bu ders sistemde yok.</Text>
      </Box>
    );
  }

  if (tl && !isMyLesson) {
    return (
      <Box>
        <PageHeader title="Erişim Yok" />
        <Box bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100">
          <Text color="gray.500">Bu ders size atanmamış. Sadece kendi derslerinizi yönetebilirsiniz.</Text>
          <Button as={Link} to="/instructor/lessons" mt={3} variant="outline" colorPalette="teal">
            ← Derslerime Dön
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Button as={Link} to="/instructor/lessons" size="sm" variant="ghost" colorPalette="teal">
          ← Derslerim
        </Button>
      </Box>

      <PageHeader
        title={lessonInfo ? `${lessonInfo.code} — ${lessonInfo.title}` : "Ders"}
        subtitle={
          [
            termInfo ? `${termInfo.term} ${termInfo.year}` : "",
            tl ? `Maks. grup büyüklüğü: ${tl.max_group_size}` : "",
          ].filter(Boolean).join("  •  ")
        }
      />

      {/* ÖĞRENCİLER */}
      <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5} mb={6}>
        <Heading size="md" color="gray.700" mb={1}>Öğrenciler</Heading>
        <Text fontSize="xs" color="gray.500" mb={4}>
          Kayıtlı öğrencileri görüntüleyin, yeni ekleyin veya beklemedekileri onaylayın.
        </Text>
        <TermLessonStudentsPanel termLesson={tl} />
      </Box>

      {/* BEKLEYEN PROJELER */}
      <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5} mb={6}>
        <Flex justify="space-between" align="center" mb={3}>
          <Box>
            <Heading size="md" color="gray.700">Onay Bekleyen Projeler</Heading>
            <Text fontSize="xs" color="gray.500">
              Öğrencilerin "Onaya Gönder" ile sundukları projeler.
            </Text>
          </Box>
          {submittedProjects.length > 0 && (
            <Badge colorPalette="blue" variant="solid" borderRadius="full" px={3} py={1}>
              {submittedProjects.length} bekliyor
            </Badge>
          )}
        </Flex>
        {submittedProjects.length === 0 ? (
          <Box textAlign="center" py={6} color="gray.400" fontSize="sm">
            Onay bekleyen proje yok.
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
            {submittedProjects.map((p) => (
              <ProjectAdminCard key={p.id} project={p} groupName={groupName(p.group)} />
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* GRUPLAR + ÜYELERİ */}
      <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5} mb={6}>
        <Heading size="md" color="gray.700" mb={1}>Gruplar</Heading>
        <Text fontSize="xs" color="gray.500" mb={4}>
          Bu derse oluşturulmuş tüm gruplar. Bekleyen üyelik isteklerini kabul/reddedebilirsiniz.
        </Text>
        {groupsLoading ? (
          <Flex justify="center" py={4}><Spinner color="teal.500" /></Flex>
        ) : lessonGroups.length === 0 ? (
          <Box textAlign="center" py={6} color="gray.400" fontSize="sm">
            Henüz grup oluşturulmadı.
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
            {lessonGroups.map((g) => <GroupAdminCard key={g.id} group={g} />)}
          </SimpleGrid>
        )}
      </Box>

      {/* DİĞER PROJELER */}
      {otherProjects.length > 0 && (
        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5}>
          <Heading size="md" color="gray.700" mb={1}>Diğer Projeler</Heading>
          <Text fontSize="xs" color="gray.500" mb={4}>
            Taslak, onaylanmış veya reddedilmiş projeler.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
            {otherProjects.map((p) => (
              <ProjectAdminCard key={p.id} project={p} groupName={groupName(p.group)} />
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
}
