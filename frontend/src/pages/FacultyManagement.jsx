import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const FacultyManagement = () => {
  const queryClient = useQueryClient();

  // SADECE GEREKLİ STATELER (Eski faculties ve universities stateleri silindi)
  const [filterUniversityId, setFilterUniversityId] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', university_id: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);

  // --- REACT QUERY ---
  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: async () => {
      const response = await api.get('/universities/');
      return response.data;
    }
  });

  const { data: faculties = [], isLoading: isFacultiesLoading } = useQuery({
    queryKey: ['faculties', filterUniversityId],
    queryFn: async () => {
      const url = filterUniversityId ? `/faculties/?university=${filterUniversityId}` : '/faculties/';
      const response = await api.get(url);
      return response.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        return await api.put(`/faculties/${data.id}/`, data);
      }
      return await api.post('/faculties/', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
      setIsFormModalOpen(false);
    },
    onError: (error) => {
      console.error('Kaydetme işlemi başarısız:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/faculties/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
      setIsDeleteModalOpen(false);
      setFacultyToDelete(null);
    },
    onError: (error) => {
      console.error('Silme işlemi başarısız:', error);
    }
  });

  // --- FONKSİYONLAR ---
  const handleAddNew = () => {
    setFormData({ id: null, name: '', university_id: '' });
    setIsFormModalOpen(true);
  };

  const handleEdit = (faculty) => {
    setFormData({ 
      id: faculty.id, 
      name: faculty.name, 
      university_id: faculty.university?.id || '' 
    });
    setIsFormModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDeleteClick = (faculty) => {
    setFacultyToDelete(faculty);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(facultyToDelete.id);
  };

  return (
    <div className="faculty-management-container" style={{ padding: '20px' }}>
      <h2>Fakülte Yönetimi</h2>

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

      {isFacultiesLoading ? (
        <p>Veriler yükleniyor...</p>
      ) : (
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
      )}

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
                <button type="submit" disabled={saveMutation.isLoading}>
                  {saveMutation.isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button type="button" onClick={() => setIsFormModalOpen(false)} style={{ marginLeft: '10px' }}>İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal" style={modalStyle}>
          <div style={modalContentStyle}>
            <h3>Silme Onayı</h3>
            <p><b>{facultyToDelete?.name}</b> fakültesini silmek istediğinize emin misiniz?</p>
            <button onClick={confirmDelete} disabled={deleteMutation.isLoading} style={{ color: 'white', backgroundColor: 'red' }}>
              {deleteMutation.isLoading ? 'Siliniyor...' : 'Evet, Sil'}
            </button>
            <button onClick={() => setIsDeleteModalOpen(false)} style={{ marginLeft: '10px' }}>Vazgeç</button>
          </div>
        </div>
      )}
    </div>
  );
};

const modalStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const modalContentStyle = {
  backgroundColor: 'white', padding: '20px', borderRadius: '8px', minWidth: '300px'
};

export default FacultyManagement;