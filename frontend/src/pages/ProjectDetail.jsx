import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Alert,
  Separator,
  Spinner,
  Tabs,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api.js";

const STATUS_MAP = {
  pending: { label: "Beklemede", color: "yellow" },
  in_progress: { label: "Devam Ediyor", color: "blue" },
  completed: { label: "Tamamlandı", color: "green" },
};

function OverviewTab({ project }) {
  const status = STATUS_MAP[project.status] || { label: project.status, color: "gray" };
  return (
    <VStack align="stretch" gap={5}>
      <Box bg="gray.50" borderRadius="lg" p={5}>
        <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={2}>PROJE BİLGİLERİ</Text>
        <VStack align="stretch" gap={3}>
          <Flex justify="space-between">
            <Text color="gray.600">Durum</Text>
            <Badge colorPalette={status.color} variant="subtle" px={3} py={1} borderRadius="full">{status.label}</Badge>
          </Flex>
          <Flex justify="space-between">
            <Text color="gray.600">Onay</Text>
            <Badge colorPalette={project.is_approved ? "green" : "orange"} variant="outline">
              {project.is_approved ? "Onaylandı" : "Onay Bekliyor"}
            </Badge>
          </Flex>
          <Flex justify="space-between">
            <Text color="gray.600">Grup</Text>
            <Text fontWeight="medium">{project.group_name}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="gray.600">Oluşturulma</Text>
            <Text fontWeight="medium">{new Date(project.created_at).toLocaleDateString("tr-TR")}</Text>
          </Flex>
        </VStack>
      </Box>
      <Box>
        <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={2}>AÇIKLAMA</Text>
        <Text color="gray.700">{project.description || "Açıklama eklenmemiş."}</Text>
      </Box>
    </VStack>
  );
}

function ProjectSettingsTab({ project, onSave }) {
  const [form, setForm] = useState({ title: project.title, description: project.description, status: project.status });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

const handleSave = async () => {
  setSaving(true);
  setMsg("");
  try {
    const res = await api.put(`/api/group-project/${project.id}/`, form);
    setMsg("Kaydedildi.");
    onSave(res.data || form);
  } catch {
    setMsg("Hata oluştu.");
  } finally {
    setSaving(false);
  }
};

  return (
    <VStack align="stretch" gap={4} maxW="500px">
      {msg && (
        <Alert.Root status={msg === "Kaydedildi." ? "success" : "error"} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title>{msg}</Alert.Title>
        </Alert.Root>
      )}
      <Box>
        <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>Proje Başlığı</Text>
        <Input name="title" value={form.title} onChange={handleChange} />
      </Box>
      <Box>
        <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>Açıklama</Text>
        <Textarea name="description" value={form.description} onChange={handleChange} rows={4} />
      </Box>
      <Box>
        <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>Durum</Text>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #E2E8F0",
            fontSize: "14px",
          }}
        >
          <option value="pending">Beklemede</option>
          <option value="in_progress">Devam Ediyor</option>
          <option value="completed">Tamamlandı</option>
        </select>
      </Box>
      <Button colorPalette="teal" onClick={handleSave} loading={saving} alignSelf="start">Kaydet</Button>
    </VStack>
  );
}

function GroupTab({ project }) {
  return (
    <VStack align="stretch" gap={4}>
      <Box bg="gray.50" borderRadius="lg" p={5}>
        <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={3}>GRUP: {project.group_name}</Text>
        <VStack align="stretch" gap={2}>
          {(project.members || []).map((m) => (
            <Flex key={m.id} justify="space-between" align="center" py={2} px={3} bg="white" borderRadius="md" border="1px solid" borderColor="gray.100">
              <Text fontSize="sm" color="gray.700">{m.full_name}</Text>
              <Badge colorPalette={m.role === "leader" ? "purple" : "gray"} variant="subtle" fontSize="xs">
                {m.role === "leader" ? "Lider" : "Üye"}
              </Badge>
            </Flex>
          ))}
          {(!project.members || project.members.length === 0) && (
            <Text color="gray.400" fontSize="sm">Üye bilgisi yok.</Text>
          )}
        </VStack>
      </Box>
    </VStack>
  );
}

function ReportsTab({ project }) {
  const reports = project.reports || [];
  return (
    <VStack align="stretch" gap={3}>
      {reports.length === 0 ? (
        <Text color="gray.400">Henüz rapor yüklenmemiş.</Text>
      ) : (
        reports.map((r) => (
          <Box key={r.id} border="1px solid" borderColor="gray.200" borderRadius="lg" p={4} bg="white">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="medium" color="gray.800">{r.report_name}</Text>
                <Text fontSize="xs" color="gray.400">Versiyon: {r.version}</Text>
              </Box>
              <HStack gap={2}>
                <Badge colorPalette={r.is_submitted ? "green" : "gray"} variant="subtle" fontSize="xs">
                  {r.is_submitted ? "Teslim Edildi" : "Taslak"}
                </Badge>
                <Badge
                  colorPalette={r.plagiarism_rate > 15 ? "red" : r.plagiarism_rate > 5 ? "yellow" : "green"}
                  variant="subtle"
                  fontSize="xs"
                >
                  %{r.plagiarism_rate} benzerlik
                </Badge>
              </HStack>
            </Flex>
          </Box>
        ))
      )}
    </VStack>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/group-project/${id}/`);
      setProject(res.data);
    } catch {
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  if (loading) return <Flex justify="center" py={16}><Spinner size="lg" color="teal.500" /></Flex>;
  if (!project) return <Text color="red.400" textAlign="center" py={16}>Proje bulunamadı.</Text>;

  const handleDelete = async () => {
    if (!window.confirm(`"${project.title}" projesini silmek istediğine emin misin?`)) return;
    try {
      await api.delete(`/api/group-project/${project.id}/`);
      navigate("/projects");
    } catch {
      alert("Proje silinirken hata oluştu.");
    }
  };

  return (
    <Box>
      <Button variant="ghost" colorPalette="teal" mb={4} onClick={() => navigate("/projects")}>
        ← Projelere Dön
      </Button>

      <Flex justify="space-between" align="start" mb={6}>
        <Box>
          <Heading size="lg" color="gray.800">{project.title}</Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>{project.group_name}</Text>
        </Box>
        <Button variant="ghost" colorPalette="red" size="sm" onClick={handleDelete}>Projeyi Sil</Button>
      </Flex>

      <Tabs.Root defaultValue="overview" variant="line" colorPalette="teal">
        <Tabs.List mb={5}>
          <Tabs.Trigger value="overview">Genel Bakış</Tabs.Trigger>
          <Tabs.Trigger value="settings">Proje Ayarları</Tabs.Trigger>
          <Tabs.Trigger value="group">Grup</Tabs.Trigger>
          <Tabs.Trigger value="reports">Raporlar</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="overview"><OverviewTab project={project} /></Tabs.Content>
        <Tabs.Content value="settings">
        <ProjectSettingsTab
          project={project}
          onSave={(updated) =>
            setProject((prev) => ({
              ...prev,
              ...updated,
            }))
          }
        />
      </Tabs.Content>
        <Tabs.Content value="group"><GroupTab project={project} /></Tabs.Content>
        <Tabs.Content value="reports"><ReportsTab project={project} /></Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}
