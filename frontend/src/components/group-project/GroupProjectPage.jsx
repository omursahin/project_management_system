import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StatusBadge from './StatusBadge';
import ProjectForm from './ProjectForm';
import api from '../../services/api';

const GroupProjectPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // 1. VERİ ÇEKME (GET) - useEffect ve useState(loading) yerine artık bu var!
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['groupProjects'],
    queryFn: async () => {
      const response = await api.get('/api/group-project/');
      return response.data; // Django'nun yanıtına göre burası response.data.results da olabilir
    }
  });

  // 2. VERİ EKLEME (POST) - Form gönderildiğinde çalışacak yapı
  const createProjectMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post('/api/group-project/', formData);
      return response.data;
    },
    onSuccess: () => {
      // Başarılı olursa, 'groupProjects' listesini otomatik olarak arka planda yenile
      queryClient.invalidateQueries({ queryKey: ['groupProjects'] });
      setShowForm(false); // Formu kapat
    }
  });

  if (isLoading) return <p>Projeler yükleniyor, lütfen bekleyin...</p>;

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

      {/* Form Gönderiminde Mutation'ı Tetikliyoruz */}
      {showForm && <ProjectForm onSubmit={(data) => createProjectMutation.mutate(data)} />}

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