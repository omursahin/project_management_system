import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box, SimpleGrid, Heading, Text, Flex, Badge, Button, HStack, VStack,
  Spinner, Alert, Separator,
} from "@chakra-ui/react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import FormField from "../../components/ui/FormField.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { getStoredUser } from "../../services/auth.js";
import {
  termLessons, lessons, terms, users,
  groups as groupsResource, groupMembers, groupProjects,
} from "../../services/resources.js";

/* ───────────── Yardimcilar ───────────── */
const userFullName = (u) =>
  u ? ([u.first_name, u.last_name].filter(Boolean).join(" ") || u.email) : "";

const PROJECT_STATUSES = {
  draft: { label: "Taslak", color: "gray" },
  submitted: { label: "Onaya Gönderildi", color: "blue" },
  review: { label: "İncelemede", color: "yellow" },
  approved: { label: "Onaylandı", color: "green" },
  rejected: { label: "Reddedildi", color: "red" },
};

/* ───────────── Dialog: Yeni Grup ───────────── */
function CreateGroupDialog({ open, onClose, termLessonId, maxSize }) {
  const [form, setForm] = useState({ name: "", description: "", max_members: maxSize || 5 });
  const create = groupsResource.useCreate({
    onSuccess: () => { setForm({ name: "", description: "", max_members: maxSize || 5 }); onClose(); },
  });

  const handleSave = () => {
    if (!form.name.trim()) return;
    create.mutate({
      name: form.name.trim(),
      description: form.description.trim(),
      max_members: Number(form.max_members) || 5,
      term_lesson: termLessonId,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Yeni Grup Oluştur">
      <VStack gap={4} align="stretch">
        <FormField
          label="Grup Adı"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Örn: Proje Takımı Alpha"
        />
        <FormField
          label="Açıklama"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          multiline
          rows={3}
        />
        <FormField
          label="Maksimum Üye Sayısı"
          type="number"
          value={form.max_members}
          onChange={(e) => setForm({ ...form, max_members: e.target.value })}
        />
        {create.error && (
          <Alert.Root status="error" borderRadius="md">
            <Alert.Indicator />
            <Alert.Title fontSize="sm">
              {create.error.response?.data?.detail || "Oluşturma başarısız."}
            </Alert.Title>
          </Alert.Root>
        )}
        <HStack justify="end" pt={2}>
          <Button variant="ghost" onClick={onClose}>Vazgeç</Button>
          <Button bg="teal.500" color="white" _hover={{ bg: "teal.600" }}
            loading={create.isPending} onClick={handleSave}>
            Oluştur
          </Button>
        </HStack>
      </VStack>
    </Modal>
  );
}

/* ───────────── Dialog: Davet Koduyla Katil ───────────── */
function JoinGroupDialog({ open, onClose }) {
  const [code, setCode] = useState("");
  const join = groupsResource.useAction("join", {
    onSuccess: () => { setCode(""); onClose(); },
  });

  const handleJoin = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    join.mutate({ invitation_code: trimmed });
  };

  return (
    <Modal open={open} onClose={onClose} title="Davet Koduyla Katıl">
      <VStack gap={4} align="stretch">
        <FormField
          label="Davet Kodu"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Örn: A1B2C3D4"
          maxLength={8}
        />
        {join.error && (
          <Alert.Root status="error" borderRadius="md">
            <Alert.Indicator />
            <Alert.Title fontSize="sm">
              {join.error.response?.status === 404
                ? "Bu koda ait grup bulunamadı."
                : join.error.response?.data?.detail || "Katılırken hata oluştu."}
            </Alert.Title>
          </Alert.Root>
        )}
        <HStack justify="end" pt={2}>
          <Button variant="ghost" onClick={onClose}>Vazgeç</Button>
          <Button bg="blue.500" color="white" _hover={{ bg: "blue.600" }}
            loading={join.isPending} onClick={handleJoin}>
            Katıl
          </Button>
        </HStack>
      </VStack>
    </Modal>
  );
}

/* ───────────── Dialog: Proje (yeni veya duzenle) ───────────── */
function ProjectDialog({ open, onClose, groupId, project }) {
  const isEdit = !!project?.id;
  const [form, setForm] = useState({ title: "", description: "" });

  // open=true olunca formu uygun degere set et (yeni veya edit)
  useEffect(() => {
    if (!open) return;
    setForm({
      title: project?.title || "",
      description: project?.description || "",
    });
  }, [open, project?.id]);

  const create = groupProjects.useCreate({ onSuccess: onClose });
  const update = groupProjects.usePatch({ onSuccess: onClose });
  const mutation = isEdit ? update : create;

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (isEdit) {
      update.mutate({
        id: project.id,
        title: form.title.trim(),
        description: form.description.trim(),
      });
    } else {
      create.mutate({
        group: groupId,
        title: form.title.trim(),
        description: form.description.trim(),
        status: "draft",
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Projeyi Düzenle" : "Yeni Proje Oluştur"}
    >
      <VStack gap={4} align="stretch">
        <FormField
          label="Proje Başlığı"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <FormField
          label="Açıklama"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          multiline
          rows={4}
        />
        {!isEdit && (
          <Text fontSize="xs" color="gray.400">
            Proje "Taslak" olarak oluşturulur. Hazır olduğunda "Onaya Gönder" ile eğitmenin onayına sunabilirsiniz.
          </Text>
        )}
        {mutation.error && (
          <Alert.Root status="error" borderRadius="md">
            <Alert.Indicator />
            <Alert.Title fontSize="sm">
              {mutation.error.response?.data?.detail || "İşlem başarısız."}
            </Alert.Title>
          </Alert.Root>
        )}
        <HStack justify="end" pt={2}>
          <Button variant="ghost" onClick={onClose}>Vazgeç</Button>
          <Button bg="purple.500" color="white" _hover={{ bg: "purple.600" }}
            loading={mutation.isPending} onClick={handleSave}>
            {isEdit ? "Kaydet" : "Oluştur"}
          </Button>
        </HStack>
      </VStack>
    </Modal>
  );
}

/* ───────────── Diger Grup Karti (kucuk) ───────────── */
function OtherGroupCard({ group }) {
  const isFull = group.member_count >= group.max_members;
  return (
    <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4}>
      <Flex justify="space-between" align="start" mb={2}>
        <Box>
          <Heading size="sm" color="gray.800">{group.name}</Heading>
          {group.description && (
            <Text fontSize="xs" color="gray.500" lineClamp={2} mt={1}>{group.description}</Text>
          )}
        </Box>
        <Badge colorPalette={isFull ? "red" : "green"} variant="subtle" borderRadius="full" px={2}>
          {group.member_count}/{group.max_members}
        </Badge>
      </Flex>
    </Box>
  );
}

/* ───────────── Senin Grubun Detay Karti ───────────── */
function MyGroupCard({ group, currentUserId, instructor }) {
  const isOwner = group.owner === currentUserId;
  const members = group.members || [];
  const accepted = members.filter((m) => m.status === "accepted");
  const pending = members.filter((m) => m.status === "pending");
  const [copied, setCopied] = useState(false);

  const acceptMutation = groupMembers.useAction("accept", { method: "patch", invalidate: false });
  const rejectMutation = groupMembers.useAction("reject", { method: "patch", invalidate: false });
  const removeMutation = groupMembers.useDelete({ invalidate: false });

  // groupMembers islemleri sonrasi groups cache'ini yenile
  const { refetch: refetchGroups } = groupsResource.useList();

  const handleAfterMemberChange = () => refetchGroups();

  const copyCode = () => {
    navigator.clipboard.writeText(group.invite_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <Box bg="white" border="2px solid" borderColor="teal.300" borderRadius="xl" p={5} shadow="md">
      <Flex justify="space-between" align="start" mb={3}>
        <Box>
          <HStack gap={2} mb={1}>
            <Heading size="md" color="gray.800">{group.name}</Heading>
            <Badge colorPalette="teal" variant="solid" borderRadius="full">
              {isOwner ? "Lider" : "Üye"}
            </Badge>
          </HStack>
          {group.description && (
            <Text fontSize="sm" color="gray.500">{group.description}</Text>
          )}
        </Box>
        <Badge colorPalette={accepted.length >= group.max_members ? "red" : "green"} variant="subtle" borderRadius="full" px={2}>
          {accepted.length}/{group.max_members}
        </Badge>
      </Flex>

      {/* Davet kodu */}
      <Flex
        align="center"
        justify="space-between"
        bg="gray.50"
        borderRadius="lg"
        px={4}
        py={3}
        mb={4}
      >
        <Box>
          <Text fontSize="xs" color="gray.400" fontWeight="medium">Davet Kodu</Text>
          <Text fontSize="lg" fontWeight="bold" fontFamily="mono" color="teal.600" letterSpacing="wider">
            {group.invite_code}
          </Text>
        </Box>
        <Button size="sm" variant={copied ? "solid" : "outline"} colorPalette={copied ? "green" : "teal"} onClick={copyCode}>
          {copied ? "Kopyalandı" : "Kopyala"}
        </Button>
      </Flex>

      {/* Danisman */}
      {instructor && (
        <Flex align="center" gap={3} bg="purple.50" borderRadius="lg" px={4} py={2} mb={4}>
          <Text fontSize="xl">{"\u{1F393}"}</Text>
          <Box flex="1">
            <Text fontSize="xs" color="purple.700" fontWeight="medium">Danışman</Text>
            <Text fontSize="sm" color="gray.700">
              {userFullName(instructor)} — {instructor.email}
            </Text>
          </Box>
        </Flex>
      )}

      {/* Bekleyen istekler (sadece lidere gosterilir) */}
      {isOwner && pending.length > 0 && (
        <Box mb={4}>
          <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
            Bekleyen Katılım İstekleri ({pending.length})
          </Text>
          <VStack align="stretch" gap={2}>
            {pending.map((m) => (
              <Flex
                key={m.id}
                bg="yellow.50"
                border="1px solid"
                borderColor="yellow.200"
                borderRadius="md"
                px={3}
                py={2}
                align="center"
                justify="space-between"
              >
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    {m.full_name || m.user_email || `User #${m.user}`}
                  </Text>
                  {m.user_email && (
                    <Text fontSize="xs" color="gray.500">{m.user_email}</Text>
                  )}
                </Box>
                <HStack gap={2}>
                  <Button
                    size="xs"
                    bg="green.500"
                    color="white"
                    _hover={{ bg: "green.600" }}
                    loading={acceptMutation.isPending && acceptMutation.variables?.id === m.id}
                    onClick={() => acceptMutation.mutate({ id: m.id }, { onSuccess: handleAfterMemberChange })}
                  >
                    Kabul
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    colorPalette="red"
                    loading={rejectMutation.isPending && rejectMutation.variables?.id === m.id}
                    onClick={() => rejectMutation.mutate({ id: m.id }, { onSuccess: handleAfterMemberChange })}
                  >
                    Reddet
                  </Button>
                </HStack>
              </Flex>
            ))}
          </VStack>
        </Box>
      )}

      {/* Uye listesi */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
          Üyeler ({accepted.length})
        </Text>
        {accepted.length === 0 ? (
          <Text fontSize="xs" color="gray.400">Henüz onaylı üye yok.</Text>
        ) : (
          <VStack align="stretch" gap={1}>
            {accepted.map((m) => {
              const isLeader = m.user === group.owner;
              const isCurrentUser = m.user === currentUserId;
              return (
                <Flex key={m.id} align="center" justify="space-between" py={1}>
                  <HStack gap={2}>
                    <Text fontSize="sm" color="gray.700">
                      {m.full_name || m.user_email || `User #${m.user}`}
                    </Text>
                    {isLeader && (
                      <Badge colorPalette="purple" variant="subtle" fontSize="xs">Lider</Badge>
                    )}
                    {isCurrentUser && !isLeader && (
                      <Badge colorPalette="gray" variant="subtle" fontSize="xs">Sen</Badge>
                    )}
                  </HStack>
                  {isOwner && !isLeader && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      loading={removeMutation.isPending && removeMutation.variables === m.id}
                      onClick={() => removeMutation.mutate(m.id, { onSuccess: handleAfterMemberChange })}
                    >
                      Çıkar
                    </Button>
                  )}
                </Flex>
              );
            })}
          </VStack>
        )}
      </Box>

      {isOwner && (
        <Text fontSize="xs" color="gray.400" mt={3}>
          Yeni üye eklemek için davet kodunu paylaş. Kodu kullanan öğrenciler "Bekleyen İstekler" altında belirir; onaylaman gerekir.
        </Text>
      )}
    </Box>
  );
}

/* ───────────── Proje Karti ───────────── */
function ProjectCard({ project, isLeader, onEdit, onDelete }) {
  const meta = PROJECT_STATUSES[project.status] || { label: project.status, color: "gray" };
  const submitMutation = groupProjects.usePatch();

  const canSubmit = isLeader && project.status === "draft" && !project.is_approved;
  const canEdit = isLeader && !project.is_approved;
  const canDelete = isLeader && !project.is_approved;

  return (
    <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4}>
      <Flex justify="space-between" align="start" mb={2}>
        <Heading size="sm" color="gray.800">{project.title}</Heading>
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

      {project.status === "submitted" && !project.is_approved && (
        <Text fontSize="xs" color="blue.500" fontWeight="medium" mb={2}>
          Eğitmen onayı bekleniyor.
        </Text>
      )}
      {project.status === "rejected" && (
        <Text fontSize="xs" color="red.500" fontWeight="medium" mb={2}>
          Eğitmen tarafından reddedildi. Düzenleyip yeniden gönderebilirsiniz.
        </Text>
      )}

      {(canSubmit || canEdit || canDelete) && (
        <HStack gap={2} mt={2} flexWrap="wrap">
          {canSubmit && (
            <Button
              size="sm"
              bg="blue.500"
              color="white"
              _hover={{ bg: "blue.600" }}
              loading={submitMutation.isPending}
              onClick={() => submitMutation.mutate({ id: project.id, status: "submitted" })}
            >
              Onaya Gönder
            </Button>
          )}
          {canEdit && (
            <Button size="sm" variant="outline" colorPalette="orange" onClick={() => onEdit?.(project)}>
              Düzenle
            </Button>
          )}
          {canDelete && (
            <Button size="sm" variant="ghost" colorPalette="red" onClick={() => onDelete?.(project)}>
              Sil
            </Button>
          )}
        </HStack>
      )}
    </Box>
  );
}

/* ───────────── Ana Sayfa ───────────── */
export default function StudentLessonDetailPage() {
  const { id } = useParams();
  const termLessonId = Number(id);
  const user = getStoredUser();

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [projectDialog, setProjectDialog] = useState({ open: false, project: null });
  const [deleteProject, setDeleteProject] = useState(null);

  const deleteProjectMutation = groupProjects.useDelete({
    onSuccess: () => setDeleteProject(null),
  });

  const { data: tlList = [] } = termLessons.useList();
  const { data: lessonList = [] } = lessons.useList();
  const { data: termList = [] } = terms.useList();
  const { data: instructorList = [] } = users.useList({ is_staff: true });

  const tl = tlList.find((x) => x.id === termLessonId);
  const lessonInfo = tl ? lessonList.find((l) => l.id === tl.lesson) : null;
  const termInfo = tl ? termList.find((t) => t.id === tl.term) : null;
  const instructor = tl ? instructorList.find((u) => u.id === tl.instructor) : null;

  const { data: lessonGroups = [], isLoading: groupsLoading } = groupsResource.useList(
    { term_lesson: termLessonId }
  );
  const { data: myGroups = [] } = groupsResource.useList();

  const myGroupInThisLesson = myGroups.find(
    (g) => g.term_lesson === termLessonId && (
      g.owner === user?.id ||
      (g.members || []).some((m) => m.user === user?.id && m.status === "accepted")
    )
  );
  const isLeader = myGroupInThisLesson?.owner === user?.id;

  // Detayli grup objesi (uyeler ile)
  const { data: myGroupDetail } = groupsResource.useDetail(myGroupInThisLesson?.id, {
    enabled: !!myGroupInThisLesson?.id,
  });
  const myGroup = myGroupDetail || myGroupInThisLesson;

  const otherGroups = lessonGroups.filter((g) => g.id !== myGroupInThisLesson?.id);

  // Projeler
  const { data: projectList = [] } = groupProjects.useList(
    myGroupInThisLesson?.id ? { group: myGroupInThisLesson.id } : null
  );

  if (!tl && tlList.length > 0) {
    return (
      <Box>
        <PageHeader title="Ders Bulunamadı" />
        <Box bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.100">
          <Text color="gray.500">Bu derse erişiminiz yok ya da ders mevcut değil.</Text>
          <Button as={Link} to="/lessons" mt={3} variant="outline" colorPalette="teal">
            ← Derslerime Dön
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Button as={Link} to="/lessons" size="sm" variant="ghost" colorPalette="teal">
          ← Derslerim
        </Button>
      </Box>

      <PageHeader
        title={lessonInfo ? `${lessonInfo.code} — ${lessonInfo.title}` : "Ders"}
        subtitle={
          [
            termInfo ? `${termInfo.term} ${termInfo.year}` : "",
            instructor ? `Eğitmen: ${userFullName(instructor)}` : "",
          ].filter(Boolean).join("  •  ")
        }
      />

      {/* GRUBUM */}
      {myGroup ? (
        <Box mb={6}>
          <Heading size="md" color="gray.700" mb={3}>Grubun</Heading>
          <MyGroupCard
            group={myGroup}
            currentUserId={user?.id}
            instructor={instructor}
          />
        </Box>
      ) : (
        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5} mb={6}>
          <Flex justify="space-between" align="center" mb={3}>
            <Box>
              <Heading size="md" color="gray.700">Bu Derste Henüz Grubun Yok</Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Yeni bir grup oluştur ya da arkadaşının davet kodu ile mevcut bir gruba katıl.
              </Text>
            </Box>
            <HStack>
              <Button bg="teal.500" color="white" _hover={{ bg: "teal.600" }} onClick={() => setShowCreateGroup(true)}>
                + Yeni Grup
              </Button>
              <Button variant="outline" colorPalette="blue" onClick={() => setShowJoinGroup(true)}>
                Davet Kodu
              </Button>
            </HStack>
          </Flex>
        </Box>
      )}

      {/* PROJELER */}
      {myGroupInThisLesson && (
        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5} mb={6}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Heading size="md" color="gray.700">Projeler</Heading>
              <Text fontSize="xs" color="gray.400">
                "{myGroupInThisLesson.name}" grubunun projeleri
              </Text>
            </Box>
            {isLeader && (
              <Button
                bg="purple.500"
                color="white"
                _hover={{ bg: "purple.600" }}
                onClick={() => setProjectDialog({ open: true, project: null })}
              >
                + Yeni Proje
              </Button>
            )}
          </Flex>

          {projectList.length === 0 ? (
            <Box textAlign="center" py={6} color="gray.400" fontSize="sm">
              {isLeader
                ? "Henüz proje yok. İlk projeyi oluşturarak başla!"
                : "Grup lideri henüz proje oluşturmadı."}
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
              {projectList.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  isLeader={isLeader}
                  onEdit={(proj) => setProjectDialog({ open: true, project: proj })}
                  onDelete={(proj) => setDeleteProject(proj)}
                />
              ))}
            </SimpleGrid>
          )}
        </Box>
      )}

      {/* DIGER GRUPLAR */}
      {otherGroups.length > 0 && (
        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5}>
          <Heading size="md" color="gray.700" mb={3}>Diğer Gruplar</Heading>
          <Text fontSize="xs" color="gray.400" mb={4}>
            Bu derste oluşturulmuş diğer gruplar — davet kodları ile katılabilirsin.
          </Text>
          {groupsLoading ? (
            <Flex justify="center" py={4}><Spinner color="teal.500" /></Flex>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
              {otherGroups.map((g) => (
                <OtherGroupCard key={g.id} group={g} />
              ))}
            </SimpleGrid>
          )}
        </Box>
      )}

      <CreateGroupDialog
        open={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        termLessonId={termLessonId}
        maxSize={tl?.max_group_size}
      />
      <JoinGroupDialog open={showJoinGroup} onClose={() => setShowJoinGroup(false)} />
      <ProjectDialog
        open={projectDialog.open}
        project={projectDialog.project}
        onClose={() => setProjectDialog({ open: false, project: null })}
        groupId={myGroupInThisLesson?.id}
      />
      <Modal
        open={!!deleteProject}
        onClose={() => setDeleteProject(null)}
        title="Projeyi Sil"
        size="sm"
      >
        <Text>
          <strong>{deleteProject?.title}</strong> projesini silmek istediğinize emin misiniz?
          Bu işlem geri alınamaz.
        </Text>
        <HStack justify="end" pt={4}>
          <Button variant="ghost" onClick={() => setDeleteProject(null)}>Vazgeç</Button>
          <Button
            colorPalette="red"
            loading={deleteProjectMutation.isPending}
            onClick={() => deleteProjectMutation.mutate(deleteProject.id)}
          >
            Sil
          </Button>
        </HStack>
      </Modal>
    </Box>
  );
}
