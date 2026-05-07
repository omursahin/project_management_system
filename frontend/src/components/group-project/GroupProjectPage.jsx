import React, { useState, useEffect } from 'react';
// Az önce yaptığımız yapboz parçalarını (bileşenleri) çağırıyoruz:
import StatusBadge from './StatusBadge';
import ProjectForm from './ProjectForm';

// ÖNEMLİ: Kendi bulduğun api.js dosyasının yolunu buraya yazmalısın.
// Genelde '../../services/api' veya '../../api' şeklinde olur.
import api from '../../services/api';

const GroupProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sayfa ekranda ilk açıldığında API'den verileri çeken kısım
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // Backend'deki URL'ine (örn: /api/group-project/) GET isteği atıyoruz
      const response = await api.get('/api/group-project/');
      // Django'dan dönen veri yapısına göre response.data veya response.data.results olabilir
      setProjects(response.data);
    } catch (error) {
      console.error("Projeler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Formdan "Kaydet"e basılınca çalışacak ve API'ye POST isteği atacak kısım
  const handleCreateProject = async (formData) => {
    try {
      const response = await api.post('/api/group-project/', formData);
      // Yeni eklenen projeyi mevcut listeye dahil ediyoruz
      setProjects([...projects, response.data]);
      setShowForm(false); // İşlem bitince formu kapat
    } catch (error) {
      console.error("Proje eklenirken hata oluştu:", error);
    }
  };

  if (loading) return <p>Projeler yükleniyor, lütfen bekleyin...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Grup Projeleri</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {showForm ? 'İptal Et' : '+ Yeni Proje Oluştur'}
        </button>
      </div>

      <hr style={{ margin: '20px 0', borderColor: '#eee' }} />

      {/* Form Butona Basılınca Açılır */}
      {showForm && <ProjectForm onSubmit={handleCreateProject} />}

      {/* Backend'den Gelen Projeleri Ekrana Çizdiriyoruz */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {projects.length === 0 ? (
          <p>Henüz oluşturulmuş bir proje bulunmuyor.</p>
        ) : (
          projects.map((project) => (
            <div key={project.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{project.title}</h3>
                <StatusBadge status={project.status} />
              </div>

              <p style={{ margin: '0', color: '#666', lineHeight: '1.5' }}>{project.description}</p>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupProjectPage;