import { useState } from "react";
import { Box, Flex, Heading, Button, Text, HStack, Input, VStack } from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

const Lessons = () => {
  const queryClient = useQueryClient();
  const [departmentFilter, setDepartmentFilter] = useState("");

  // Modal ve Form State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, code: "", title: "", description: "", department: "", owner: "" });

  // 1. Dersleri API'den Çek (React Query)
  const { data: lessonsData, isLoading: isLoadingLessons } = useQuery({
    queryKey: ["lessons"],
    queryFn: () => api.get("/api/lesson/").then((res) => res.data)
  });

  // 2. Kullanıcıları Çek (Ders Sahibi atamak için)
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get("/api/account/users/").then((res) => res.data)
  });

  // 3. Bölümleri API'den Çek (Filtreleme ve Form için)
  const { data: departmentsData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get("/api/department/").then((res) => res.data)
  });

  // Django Rest Framework sayfalama yapıyorsa veriler .results içinde gelir, yapmıyorsa direkt gelir.
  const lessons = lessonsData?.results || lessonsData || [];
  const users = usersData?.results || usersData || [];
  const departments = departmentsData?.results || departmentsData || [];

  // Ekleme / Güncelleme İstekleri (Mutation)
  const mutation = useMutation({
    mutationFn: (data) => {
      if (data.id) {
        return api.put(`/api/lesson/${data.id}/`, data);
      }
      return api.post("/api/lesson/", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      closeModal();
    },
    onError: (error) => {
      console.error("İşlem hatası:", error.response?.data || error.message);
      alert("Bir hata oluştu, lütfen konsolu kontrol edin.");
    }
  });

  const openModal = (lesson = null) => {
    if (lesson) {
      setFormData({
        id: lesson.id,
        code: lesson.code || "",
        title: lesson.title || "",
        description: lesson.description || "",
        department: lesson.department?.id || lesson.department || "",
        owner: lesson.owner?.id || lesson.owner || ""
      });
    } else {
      setFormData({ id: null, code: "", title: "", description: "", department: "", owner: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Box p={4} bg="white" borderRadius="md" shadow="sm" position="relative">

      {/* ÜST BAR */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md" color="teal.700">Ders Yönetimi</Heading>
        <Button onClick={() => openModal()} colorScheme="teal" bg="teal.600" color="white" px={4} py={2} borderRadius="md" _hover={{ bg: "teal.700" }}>
          + Yeni Ders Ekle
        </Button>
      </Flex>

      {/* FİLTRELEME ALANI (Dinamik) */}
      <HStack mb={6}>
        <Text fontWeight="semibold" color="gray.600">Bölüm Filtresi:</Text>
        <select
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #E2E8F0", outline: "none", backgroundColor: "white" }}
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="">Tüm Bölümler</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </HStack>

      {/* DERSLER TABLOSU */}
      <Box overflowX="auto">
        {isLoadingLessons ? (
          <Text color="gray.500">Dersler yükleniyor...</Text>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#4A5568" }}>
                <th style={{ padding: "12px 8px" }}>Ders Kodu</th>
                <th style={{ padding: "12px 8px" }}>Ders Adı</th>
                <th style={{ padding: "12px 8px" }}>Açıklama</th>
                <th style={{ padding: "12px 8px" }}>Bölüm</th>
                <th style={{ padding: "12px 8px" }}>Ders Sahibi</th>
                <th style={{ padding: "12px 8px" }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {lessons
                .filter(lesson => departmentFilter === "" || String(lesson.department) === String(departmentFilter))
                .map((lesson) => {
                  const matchedDept = departments.find(d => d.id === (lesson.department?.id || lesson.department));
                  const deptName = matchedDept ? matchedDept.name : "Belirtilmedi";

                  return (
                    <tr key={lesson.id} style={{ borderBottom: "1px solid #EDF2F7" }}>
                      <td style={{ padding: "12px 8px", fontWeight: "bold" }}>{lesson.code}</td>
                      <td style={{ padding: "12px 8px" }}>{lesson.title}</td>
                      <td style={{ padding: "12px 8px" }}>{lesson.description}</td>
                      <td style={{ padding: "12px 8px" }}>{deptName}</td>
                      <td style={{ padding: "12px 8px" }}>
                        {lesson.owner?.first_name
                          ? `${lesson.owner.first_name} ${lesson.owner.last_name || ''}`
                          : users.find(u => u.id === lesson.owner)?.first_name || "Atanmadı"}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <Button onClick={() => openModal(lesson)} size="sm" variant="outline" color="blue.600" border="1px solid" borderColor="blue.200" px={3} py={1} borderRadius="md" _hover={{ bg: "blue.50" }}>
                          Düzenle
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </Box>

      {/* GİZLİ MODAL (FORM) KATMANI */}
      {isModalOpen && (
        <Box position="fixed" top={0} left={0} w="100vw" h="100vh" bg="blackAlpha.600" zIndex={1000} display="flex" alignItems="center" justify="center">
          <Box bg="white" p={6} borderRadius="lg" w="400px" shadow="xl" style={{ backgroundColor: "#ffffff" }}>
            <Heading size="sm" mb={4} color="teal.700">
              {formData.id ? "Dersi Düzenle" : "Yeni Ders Ekle"}
            </Heading>

            <form onSubmit={handleSubmit}>
              <VStack align="stretch" gap={4} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1} color="gray.600">Ders Kodu (Code)</Text>
                  <Input required placeholder="Örn: CENG201" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1} color="gray.600">Ders Adı (Title)</Text>
                  <Input required placeholder="Örn: Veri Yapıları" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1} color="gray.600">Açıklama (Description)</Text>
                  <Input required placeholder="Ders hakkında kısa bilgi..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1} color="gray.600">Bölüm (Dinamik)</Text>
                  <select
                    required
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #E2E8F0", outline: "none" }}
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  >
                    <option value="">Seçiniz...</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1} color="gray.600">Ders Sahibi</Text>
                  <select
                    required
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #E2E8F0", outline: "none" }}
                    value={formData.owner}
                    onChange={(e) => setFormData({...formData, owner: e.target.value})}
                  >
                    <option value="">Seçiniz...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </select>
                </Box>

                <Flex justify="flex-end" gap={2} mt={2}>
                  <Button type="button" onClick={closeModal} variant="ghost" color="gray.500">İptal</Button>
                  <Button type="submit" colorScheme="teal" bg="teal.600" color="white" _hover={{ bg: "teal.700" }} isLoading={mutation.isPending}>
                    Kaydet
                  </Button>
                </Flex>
              </VStack>
            </form>
          </Box>
        </Box>
      )}

    </Box>
  );
};

export default Lessons;