import React, { useState } from 'react';

const ProjectForm = ({ onSubmit, initialData = {} }) => {
  // Kullanıcının yazdıklarını hafızada tutacağımız yerler
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');

  // Kaydet butonuna basılınca ne olacak?
  const handleSubmit = (e) => {
    e.preventDefault(); // Sayfanın gereksiz yere yenilenmesini engeller
    onSubmit({ title, description }); // Formdaki verileri alıp dışarıya aktarır
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', marginBottom: '20px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Proje Başlığı:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Açıklama:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows="4"
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <button
        type="submit"
        style={{ padding: '10px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Projeyi Kaydet
      </button>
    </form>
  );
};

export default ProjectForm;