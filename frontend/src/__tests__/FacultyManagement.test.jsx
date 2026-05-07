import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
    
    // API'den boş liste dönüyormuş gibi davranıyoruz
    api.get.mockResolvedValue({ data: [] });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <FacultyManagement />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // 1. Başlığı esnek bir Regex (/.../i) ve rol (heading) ile arıyoruz.
    // Bu sayede görünmez boşluklara veya harf büyüklüğüne takılmaz!
    const baslik = screen.getByRole('heading', { level: 2 });
    expect(baslik).toHaveTextContent(/Fakülte Yönetimi/i);
    
    // 2. React Query'nin çalışmayı bitirmesini garantiye almak için
    // tablodaki boş durum yazısının ekrana gelmesini bekliyoruz.
    await waitFor(() => {
      expect(screen.getByText(/Kayıtlı fakülte bulunamadı/i)).toBeInTheDocument();
    });
  });

});