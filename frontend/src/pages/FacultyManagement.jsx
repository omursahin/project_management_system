import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Projendeki mevcut API servis dosyasını çağırıyoruz

const FacultyManagement = () => {
  // --- STATE TANIMLAMALARI ---
  // Fakülte ve üniversite listelerini tutacağımız stateler
  const [faculties, setFaculties] = useState([]);
  const [universities, setUniversities] = useState([]);
  
  // Filtreleme için seçili üniversiteyi tutan state
  const [filterUniversityId, setFilterUniversityId] = useState('');

  // Form (Ekleme/Düzenleme) görünürlüğünü ve verilerini tutan stateler
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', university_id: '' });

  // Silme onayı penceresi için stateler
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);

  // --- API İSTEKLERİ ---
  
  // Sayfa ilk yüklendiğinde üniversiteleri ve fakülteleri API'den çeker
  // 1. Üniversiteleri Çekme
  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: async () => {
      const response = await api.get('/universities/');
      return response.data;
    }
  });

  // 2. Fakülteleri Çekme (Filtre değiştiğinde otomatik çalışır)
  const { data: faculties = [], isLoading: isFacultiesLoading } = useQuery({
    queryKey: ['faculties', filterUniversityId],
    queryFn: async () => {
      const url = filterUniversityId ? `/faculties/?university=${filterUniversityId}` : '/faculties/';
      const response = await api.get(url);
      return response.data;
    }
  });

  // Üniversiteleri getiren fonksiyon
  const fetchUniversities = async () => {
    try {
      const response = await api.get('/universities/');
      setUniversities(response.data);
    } catch (error) {
      console.error('Üniversiteler çekilirken hata oluştu:', error);
    }
  };

  // Fakülteleri getiren fonksiyon (Opsiyonel olarak üniversite ID'sine göre filtreler)
  const fetchFaculties = async (universityId = '') => {
    try {
      // Eğer bir üniversite seçiliyse query parameter olarak ekliyoruz
      const url = universityId ? `/faculties/?university=${universityId}` : '/faculties/';
      const response = await api.get(url);
      setFaculties(response.data);
    } catch (error) {
      console.error('Fakülteler çekilirken hata oluştu:', error);
    }
  };

  // --- FORM VE CRUD İŞLEMLERİ ---

  // Yeni ekleme butonuna tıklandığında formu sıfırlayıp açar
  const handleAddNew = () => {
    setFormData({ id: null, name: '', university_id: '' });
    setIsFormModalOpen(true);
  };

  // Düzenleme butonuna tıklandığında mevcut verilerle formu açar
  const handleEdit = (faculty) => {
    setFormData({ id: faculty.id, name: faculty.name, university_id: faculty.university.id });
    setIsFormModalOpen(true);
  };

  // Form gönderildiğinde (Ekleme veya Güncelleme) çalışır
  const handleSubmit = async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engeller
    try {
      if (formData.id) {
        // ID varsa güncelleme (PUT) işlemi yapılır
        await api.put(`/faculties/${formData.id}/`, formData);
      } else {
        // ID yoksa yeni kayıt (POST) işlemi yapılır
        await api.post('/faculties/', formData);
      }
      setIsFormModalOpen(false); // Formu kapat
      fetchFaculties(filterUniversityId); // Listeyi güncelle
    } catch (error) {
      console.error('Kaydetme işlemi başarısız:', error);
    }
  };

  // Silme butonuna basıldığında onay penceresini açar
  const handleDeleteClick = (faculty) => {
    setFacultyToDelete(faculty);
    setIsDeleteModalOpen(true);
  };

  // Silme işlemi onaylandığında çalışır
  const confirmDelete = async () => {
    try {
      await api.delete(`/faculties/${facultyToDelete.id}/`);
      setIsDeleteModalOpen(false);
      setFacultyToDelete(null);
      fetchFaculties(filterUniversityId); // Listeyi güncelle
    } catch (error) {
      console.error('Silme işlemi başarısız:', error);
    }
  };

  return (
    <div className="faculty-management-container" style={{ padding: '20px' }}>
      <h2>Fakülte Yönetimi</h2>

      {/* Üst Kısım: Filtreleme ve Ekleme Butonu */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <label>Üniversiteye Göre Filtrele: </label>
          <select 
            value={filterUniversityId} 
            onChange={(e) => setFilterUniversityId(e.target.value)}
          >
            <option value="">Tüm Üniversiteler</option>
            {universities.map(uni => (
              <option key={uni.id} value={uni.id}>{uni.name}</option>
            ))}
          </select>
        </div>
        <button onClick={handleAddNew}>+ Yeni Fakülte Ekle</button>
      </div>

      {/* Fakülte Listesi (Tablo formatında) */}
      <table border="1" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fakülte Adı</th>
            <th>Bağlı Olduğu Üniversite</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {faculties.map(faculty => (
            <tr key={faculty.id}>
              <td>{faculty.id}</td>
              <td>{faculty.name}</td>
              {/* API'den gelen veride university objesinin adını yazdırıyoruz */}
              <td>{faculty.university?.name || 'Bilinmiyor'}</td>
              <td>
                <button onClick={() => handleEdit(faculty)}>Düzenle</button>
                <button onClick={() => handleDeleteClick(faculty)} style={{ marginLeft: '10px', color: 'red' }}>Sil</button>
              </td>
            </tr>
          ))}
          {faculties.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>Kayıtlı fakülte bulunamadı.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Ekleme/Düzenleme Form Dialogu */}
      {isFormModalOpen && (
        <div className="modal" style={modalStyle}>
          <div style={modalContentStyle}>
            <h3>{formData.id ? 'Fakülte Düzenle' : 'Yeni Fakülte Ekle'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label>Fakülte Adı: </label>
                <input 
                  type="text" 
                  required
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Üniversite: </label>
                <select 
                  required
                  value={formData.university_id} 
                  onChange={(e) => setFormData({...formData, university_id: e.target.value})}
                >
                  <option value="">Üniversite Seçiniz</option>
                  {universities.map(uni => (
                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <button type="submit">Kaydet</button>
                <button type="button" onClick={() => setIsFormModalOpen(false)} style={{ marginLeft: '10px' }}>İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Silme Onayı Dialogu */}
      {isDeleteModalOpen && (
        <div className="modal" style={modalStyle}>
          <div style={modalContentStyle}>
            <h3>Silme Onayı</h3>
            <p><b>{facultyToDelete?.name}</b> fakültesini silmek istediğinize emin misiniz?</p>
            <button onClick={confirmDelete} style={{ color: 'white', backgroundColor: 'red' }}>Evet, Sil</button>
            <button onClick={() => setIsDeleteModalOpen(false)} style={{ marginLeft: '10px' }}>Vazgeç</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Basit modal (açılır pencere) tasarımları (kendi CSS/Tailwind sınıflarınla değiştirebilirsin)
const modalStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const modalContentStyle = {
  backgroundColor: 'white', padding: '20px', borderRadius: '8px', minWidth: '300px'
};

export default FacultyManagement;