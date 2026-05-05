import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FacultyManagement from '../pages/FacultyManagement';
import api from '../services/api';
import { BrowserRouter } from 'react-router-dom';

// 1. API'yi Taklit Ediyoruz (Mocking)
// Test çalışırken gerçekten backend'e (sunucuya) istek atmasını istemeyiz.
// Bu yüzden 'api' dosyamızın sahte bir versiyonunu oluşturuyoruz.
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('Faculty Management Sayfası Testleri', () => {
  
  it('sayfa sorunsuz yüklenmeli ve ana başlık ekranda görünmeli', async () => {
    
    // 2. Sahte Cevap Hazırlıyoruz
    // Sayfa açıldığında api.get çağrılacak. Biz de ona sanki veritabanı boşmuş gibi 
    // boş bir dizi [] döndürmesini söylüyoruz.
    api.get.mockResolvedValue({ data: [] });

    // 3. Sayfayı Sanal Olarak Çizdiriyoruz
    // React Router kullandığımız için sayfamızı BrowserRouter sarmalayıcısı içine alarak sanal ekrana çizdiriyoruz.
    render(
      <BrowserRouter>
        <FacultyManagement />
      </BrowserRouter>
    );

    // 4. Ekranda Eleman Arıyoruz ve Doğruluyoruz
    // Sayfadaki "Fakülte Yönetimi" başlıklı yazının sanal ekranda gerçekten var olup olmadığını kontrol ediyoruz.
    const baslik = await screen.findByText('Fakülte Yönetimi');
    
    // Eğer başlık sayfadaysa testimiz başarılı sayılacak.
    expect(baslik).toBeInTheDocument();
  });

});