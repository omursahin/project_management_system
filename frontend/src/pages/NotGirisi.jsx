import { Box, Heading, Flex, Button, Input } from "@chakra-ui/react";
import { useState } from "react";

const NotGirisi = () => {
  // Örnek öğrenci listesi (API hazır olunca bunlar veritabanından dolacak)
  const [students, setStudents] = useState([
    { id: 1, number: '101', name: 'Ali Yılmaz', vize: '', final: '', butun: '' },
    { id: 2, number: '102', name: 'Ayşe Kaya', vize: '', final: '', butun: '' },
  ]);

  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
      <Heading size="md" color="teal.600" mb={6}>Öğrenci Not Girişi</Heading>

      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontWeight: "600", color: "#4a5568" }}>Ders Seçimi:</label>
          <select style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #cbd5e0",
            backgroundColor: "#f8f9fa",
            color: "#2d3748",
            outline: "none",
            cursor: "pointer"
          }}>
            <option value="">Lütfen bir ders seçin...</option>
            <option value="1">Bilgisayar Mühendisliğine Giriş</option>
            <option value="2">Veri Yapıları ve Algoritmalar</option>
            <option value="3">Derin Öğrenme (Deep Learning)</option>
          </select>
        </div>

        <Button colorScheme="teal" size="sm" boxShadow="sm">✓ Tümünü Toplu Onayla</Button>
      </Flex>

      {/* Öğrenci Listesi Tablosu */}
      <Box overflowX="auto" border="1px solid" borderColor="gray.100" borderRadius="md">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #edf2f7" }}>
            <tr>
              <th style={{ padding: "12px", textAlign: "left", color: "#4a5568" }}>Öğrenci No</th>
              <th style={{ padding: "12px", textAlign: "left", color: "#4a5568" }}>Ad Soyad</th>
              <th style={{ padding: "12px", textAlign: "center", color: "#4a5568" }}>Vize</th>
              <th style={{ padding: "12px", textAlign: "center", color: "#4a5568" }}>Final</th>
              <th style={{ padding: "12px", textAlign: "center", color: "#4a5568" }}>Bütünleme</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} style={{ borderBottom: "1px solid #edf2f7" }}>
                <td style={{ padding: "12px", color: "#2d3748" }}>{student.number}</td>
                <td style={{ padding: "12px", fontWeight: "500", color: "#2d3748" }}>{student.name}</td>
                <td style={{ padding: "12px", textAlign: "center" }}><Input size="sm" type="number" w="80px" placeholder="0-100" /></td>
                <td style={{ padding: "12px", textAlign: "center" }}><Input size="sm" type="number" w="80px" placeholder="0-100" /></td>
                <td style={{ padding: "12px", textAlign: "center" }}><Input size="sm" type="number" w="80px" placeholder="0-100" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      {/* Kaydet Butonu */}
        <Button colorScheme="gray" mr={3} size="md">İptal</Button>
        <Button colorScheme="blue" size="md" boxShadow="md">💾 Notları Kaydet</Button>
      </Flex>
    </Box>
  );
};

export default NotGirisi;