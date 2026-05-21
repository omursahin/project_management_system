import React, { useState, useEffect } from "react";
import { Box, Flex, Button, Input } from "@chakra-ui/react";
import axios from "axios";

const NotGirisi = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = "http://127.0.0.1:8000/api";

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(`${BASE_URL}/term-lesson-student/?term_lesson=1`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setStudents(response.data.results || response.data);
      } catch (error) {
        console.error("Öğrenciler çekilirken hata oluştu:", error);
        alert("Hata! Öğrenciler yüklenemedi.");
      }
    };

    fetchStudents();
  }, []);

  const handleGradeChange = (id, field, value) => {
    const numValue = value === "" ? null : Number(value);

    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === id ? { ...student, [field]: numValue } : student
      )
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      const promises = students.map((student) =>
        axios.patch(
          `${BASE_URL}/term-lesson-student/${student.id}/`,
          {
            midterm: student.midterm,
            final: student.final,
            make_up: student.make_up
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      );

      await Promise.all(promises);

      alert("Harika! Notlar başarıyla sisteme kaydedildi. 🚀");

    } catch (error) {
      console.error("Kaydetme hatası:", error);
      alert("Hata! Notlar kaydedilirken bir sorun oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
      <Box overflowX="auto" border="1px solid" borderColor="gray.100" borderRadius="md">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Öğrenci Adı</th>
              <th>Vize</th>
              <th>Final</th>
              <th>Büt</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "gray" }}>
                  Kayıtlı öğrenci bulunamadı veya yükleniyor...
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} style={{ borderBottom: "1px solid #EDF2F7" }}>
                  <td style={{ padding: "12px", fontWeight: "500" }}>
                    {student.student?.first_name} {student.student?.last_name}
                    {!student.student && `Öğrenci ID: ${student.student_id}`}
                  </td>

                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <Input
                      size="sm" w="80px" type="number"
                      value={student.midterm ?? ""}
                      onChange={(e) => handleGradeChange(student.id, "midterm", e.target.value)}
                    />
                  </td>

                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <Input
                      size="sm" w="80px" type="number"
                      value={student.final ?? ""}
                      onChange={(e) => handleGradeChange(student.id, "final", e.target.value)}
                    />
                  </td>

                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <Input
                      size="sm" w="80px" type="number"
                      value={student.make_up ?? ""}
                      onChange={(e) => handleGradeChange(student.id, "make_up", e.target.value)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>

      <Flex justify="flex-end" mt={6}>
        <Button colorScheme="blue" size="md" onClick={handleSave} isLoading={isLoading} loadingText="Kaydediliyor...">
          Notları Kaydet
        </Button>
      </Flex>
    </Box>
  );
};

export default NotGirisi;