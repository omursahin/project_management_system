import {
  Box,
  Grid,
  Text,
  Flex,
  Heading,
  Button,
  Textarea,
  Badge,
  VStack,
  Input,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import PageHeader from "../components/ui/PageHeader.jsx";
import api from "../services/api.js";

export default function UploadReport() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Bekleniyor");
  const [loading, setLoading] = useState(false);
  const [uploadedReports, setUploadedReports] = useState([]);

  const plagiarismRate = uploadedReports[0]?.plagiarism_rate || 0;

  const fetchReports = async () => {
    try {
      const response = await api.get("/api/project-report/");
      setUploadedReports(response.data);
      if (response.data.length > 0) {
        setStatus("Teslim Edildi");
      }
    } catch (error) {
      console.error("Raporlar alınamadı:", error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async () => {
    if (!file) {
      alert("Lütfen bir dosya seçin.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("description", description);
      formData.append("file", file);
      formData.append("is_submitted", "true");

      const response = await api.post("/api/project-report/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStatus("Teslim Edildi");
      setUploadedReports((prev) => [response.data, ...prev]);
      setFile(null);
      setDescription("");

      alert("Rapor başarıyla yüklendi.");
    } catch (error) {
      const errorData = error.response?.data;
      console.error("Rapor yükleme hatası:", errorData || error);

      alert(
        "Rapor yüklenirken hata oluştu:\n" +
          JSON.stringify(errorData || error.message, null, 2)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Rapor Yükleme"
        subtitle="Proje raporunuzu yükleyin, açıklama ekleyin ve teslim durumunu takip edin"
      />

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        <Box
          bg="white"
          border="1px solid"
          borderColor="gray.100"
          borderRadius="xl"
          p={6}
        >
          <Heading size="md" color="gray.700" mb={4}>
            Rapor Dosyası
          </Heading>

          <Flex
            direction="column"
            align="center"
            justify="center"
            border="2px dashed"
            borderColor="teal.200"
            borderRadius="xl"
            bg="teal.50"
            p={8}
            mb={5}
          >
            <Text fontSize="3xl" mb={2}>
              📤
            </Text>

            <Text fontWeight="medium" color="gray.700" mb={1}>
              Dosyanızı buraya sürükleyin veya seçin
            </Text>

            <Text fontSize="sm" color="gray.500" mb={4}>
              PDF, DOC veya DOCX formatları desteklenir
            </Text>

            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              bg="white"
              maxW="sm"
              onChange={(e) => setFile(e.target.files[0])}
            />

            {file && (
              <Badge colorScheme="green" mt={4} px={3} py={1} borderRadius="full">
                {file.name}
              </Badge>
            )}
          </Flex>

          <Box mb={5}>
            <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
              Rapor Açıklaması
            </Text>

            <Textarea
              placeholder="Rapor hakkında kısa bir açıklama yazın..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minH="120px"
            />
          </Box>

          <Button colorScheme="teal" onClick={handleSubmit} isLoading={loading}>
            Raporu Yükle
          </Button>
        </Box>

        <VStack spacing={4} align="stretch">
          <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={6}>
            <Heading size="md" color="gray.700" mb={4}>
              Teslim Durumu
            </Heading>

            <Badge
              colorScheme={status === "Teslim Edildi" ? "green" : "yellow"}
              px={3}
              py={1}
              borderRadius="full"
            >
              {status}
            </Badge>
          </Box>

          <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={6}>
            <Heading size="md" color="gray.700" mb={4}>
              İntihal Oranı
            </Heading>

            <Box bg="gray.100" borderRadius="full" h="10px" mb={2} overflow="hidden">
              <Box
                bg={plagiarismRate > 30 ? "red.400" : "green.400"}
                h="100%"
                w={`${plagiarismRate}%`}
              />
            </Box>

            <Text fontSize="sm" color="gray.500">
              %{plagiarismRate}
            </Text>
          </Box>

          <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={6}>
            <Heading size="md" color="gray.700" mb={4}>
              Versiyon Geçmişi
            </Heading>

            {uploadedReports.length === 0 ? (
              <Text fontSize="sm" color="gray.400">
                Henüz yüklenmiş rapor yok.
              </Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {uploadedReports.map((item, index) => (
                  <Flex
                    key={item.id || index}
                    justify="space-between"
                    align="center"
                    borderBottom="1px solid"
                    borderColor="gray.50"
                    pb={2}
                  >
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        v{item.version || index + 1}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {item.file ? item.file.split("/").pop() : "rapor.pdf"}
                      </Text>
                    </Box>

                    <Text fontSize="xs" color="gray.400">
                      Bugün
                    </Text>
                  </Flex>
                ))}
              </VStack>
            )}
          </Box>
        </VStack>
      </Grid>
    </Box>
  );
}