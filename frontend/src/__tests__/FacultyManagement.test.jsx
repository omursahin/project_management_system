import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import FacultyManagement from '../pages/FacultyManagement';
import api from '../services/api';

// 1. API'yi Taklit Ediyoruz
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
    
    // Sahte Cevap Hazırlıyoruz
    api.get.mockResolvedValue({ data: [] });

    // Test için taze bir QueryClient oluşturuyoruz (Aksi halde testler hata verir)
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Test ortamında hata olursa tekrar denemesini kapatıyoruz
        },
      },
    });

    // 3. Sayfayı Sanal Olarak Çizdiriyoruz (Artık QueryClientProvider ile sarmalanmış)
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <FacultyManagement />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // 4. Ekranda Eleman Arıyoruz ve Doğruluyoruz
    // React Query asenkron çalıştığı için sayfa yüklenirken "Veriler yükleniyor..." yazabilir
    // Bu yüzden başlığın gelmesini bekliyoruz
    const baslik = await screen.findByText('Fakülte Yönetimi');
    
    expect(baslik).toBeInTheDocument();
  });

});