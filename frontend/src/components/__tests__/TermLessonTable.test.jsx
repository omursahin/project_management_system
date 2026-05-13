/**
 * @jest-environment jsdom
 */
import { vi, describe, test, expect, beforeEach } from "vitest"; // Önce Vitest importları!
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import TermLessonTable from "../term-lesson-list/TermLessonTable.jsx";

// jest-dom yerine Vitest ile daha barışık bir kontrol yapıyoruz
let queryClient;
beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, cacheTime: 0 } },
  });
});

const wrapper = ({ children }) => (
  <ChakraProvider value={defaultSystem}>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  </ChakraProvider>
);

describe("TermLessonTable Bileşen Testleri", () => {
  
  test("Başlık ve 'Yeni Dönem Dersi Ekle' butonu düzgün görünüyor mu?", async () => {
    render(<TermLessonTable />, { wrapper });
    
    const titles = await screen.findAllByText(/Dönem Dersi Yönetimi/i);
    const buttons = await screen.findAllByText(/Yeni Dönem Dersi Ekle/i);
    
    // toBeInTheDocument yerine her ortamda çalışan toBeDefined kullanıyoruz
    expect(titles[0]).toBeDefined();
    expect(buttons[0]).toBeDefined();
  });

  test("Yeni ders ekle butonuna basınca modal açılıyor mu?", async () => {
    render(<TermLessonTable />, { wrapper });
    
    const buttons = await screen.findAllByText(/Yeni Dönem Dersi Ekle/i);
    fireEvent.click(buttons[0]);
    
    await waitFor(() => {
      const modalTitles = screen.getAllByText(/Yeni Dönem Dersi Oluştur/i);
      expect(modalTitles[0]).toBeDefined();
    });
  });

  test("Form içerisindeki alanlar mevcut mu?", async () => {
    render(<TermLessonTable />, { wrapper });
    
    const buttons = await screen.findAllByText(/Yeni Dönem Dersi Ekle/i);
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      const labels = screen.getAllByText(/Maksimum Grup Boyutu/i);
      const saveButtons = screen.getAllByText(/Kaydet/i);
      expect(labels[0]).toBeDefined();
      expect(saveButtons[0]).toBeDefined();
    });
  });

});