import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Button, Badge, Spinner, Text
} from '@chakra-ui/react';
import api from '../services/api';

const LessonRegistration = () => {
  const [availableLessons, setAvailableLessons] = useState([]);
  const [registeredLessons, setRegisteredLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [availableRes, registeredRes] = await Promise.all([
          api.get('/lesson/'),
          api.get('/term-lesson-student/')
        ]);

        // Backend'in ne gönderdiğini konsolda görelim (F12 -> Console kısmından bakabilirsin)
        console.log("Django'dan Gelen Mevcut Dersler:", availableRes.data);
        console.log("Django'dan Gelen Kayıtlı Dersler:", registeredRes.data);

        // ÇÖKME KORUMASI: Gelen veri gerçekten bir dizi (Array) mi diye kontrol et
        const availableData = availableRes.data?.results || availableRes.data;
        setAvailableLessons(Array.isArray(availableData) ? availableData : []);

        const registeredData = registeredRes.data?.results || registeredRes.data;
        setRegisteredLessons(Array.isArray(registeredData) ? registeredData : []);

      } catch (error) {
        console.error("Veriler çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleRegister = async (lesson) => {
    setRegisteringId(lesson.id);
    try {
      const payload = { term_lesson: lesson.id };
      const response = await api.post('/term-lesson-student/', payload);

      setAvailableLessons(prev => prev.filter(l => l.id !== lesson.id));
      setRegisteredLessons(prev => [...prev, response.data]);

      alert(`${lesson.title} dersine başarıyla kayıt oldunuz!`);

    } catch (error) {
      console.error("Kayıt işlemi başarısız:", error);
      alert("Derse kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setRegisteringId(null);
    }
  };

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" color="blue.500" />
        <Text mt={4} fontSize="lg" fontWeight="medium">Dersler yükleniyor...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={8} color="gray.700">
        Öğrenci Ders Kayıt
      </Heading>

      {/* 1. Kısım: Mevcut Dönem Dersleri */}
      <Box mb={10} p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
        <Heading as="h3" size="md" mb={4} color="gray.600">
          Mevcut Dönem Dersleri
        </Heading>
        {availableLessons.length === 0 ? (
          <Text color="gray.500" fontWeight="medium">Şu anda alınabilecek yeni bir ders bulunmuyor.</Text>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 8px', color: '#4A5568' }}>Ders Kodu</th>
                  <th style={{ padding: '12px 8px', color: '#4A5568' }}>Ders Adı</th>
                  <th style={{ padding: '12px 8px', color: '#4A5568' }}>Açıklama</th>
                  <th style={{ padding: '12px 8px', color: '#4A5568', width: '150px' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {availableLessons.map((lesson) => (
                  <tr key={lesson.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '500' }}>{lesson.code}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{lesson.title}</td>
                    <td style={{ padding: '12px 8px' }}>{lesson.description || '-'}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <Button
                        colorScheme="blue"
                        size="sm"
                        onClick={() => handleRegister(lesson)}
                        isLoading={registeringId === lesson.id}
                        loadingText="Kaydediliyor"
                      >
                        Kayıt Ol
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Box>

      {/* 2. Kısım: Kayıtlı Dersler ve Durum Göstergesi */}
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
        <Heading as="h3" size="md" mb={4} color="gray.600">
          Kayıtlı Derslerim
        </Heading>
        {registeredLessons.length === 0 ? (
          <Text color="gray.500" fontWeight="medium">Henüz kayıt olduğunuz bir ders bulunmuyor.</Text>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 8px', color: '#4A5568' }}>Ders Adı</th>
                  <th style={{ padding: '12px 8px', color: '#4A5568', width: '200px' }}>Kayıt Durumu</th>
                </tr>
              </thead>
              <tbody>
                {registeredLessons.map((registration) => (
                  <tr key={registration.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{registration.term_lesson_display}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <Badge
                        colorScheme={registration.is_approved ? 'green' : 'yellow'}
                        p={2}
                        borderRadius="md"
                      >
                        {registration.is_approved ? 'Onaylandı' : 'Onay Bekliyor'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Box>
    </Box>
  );
};

export default LessonRegistration;