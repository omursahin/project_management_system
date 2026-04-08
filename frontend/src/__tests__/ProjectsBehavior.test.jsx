import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { render } from "../test/test-utils";
import Projects from "../pages/Projects";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../services/api.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import api from "../services/api.js";

const PROJECTS = [
  {
    id: 1, group: 1, group_name: "Alpha Takımı", title: "Üniversite Portalı",
    description: "Web platformu", status: "in_progress", is_approved: true,
    created_at: "2026-03-18T10:00:00Z", reports: [{ id: 1 }], members: [{ id: 1 }, { id: 2 }],
  },
  {
    id: 2, group: 2, group_name: "Beta Projesi", title: "Mobil Sağlık Takip",
    description: "Mobil uygulama", status: "pending", is_approved: false,
    created_at: "2026-03-22T08:00:00Z", reports: [], members: [{ id: 4 }],
  },
  {
    id: 3, group: 1, group_name: "Alpha Takımı", title: "Akıllı Otopark",
    description: "IoT sistemi", status: "completed", is_approved: true,
    created_at: "2026-02-10T12:00:00Z", reports: [{ id: 2 }, { id: 3 }], members: [{ id: 1 }, { id: 2 }, { id: 3 }],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockResolvedValue({ data: PROJECTS });
});

describe("Projects - Kart Navigasyonu", () => {
  it("proje kartına tıklanınca /projects/:id rotasına navigate eder", async () => {
    render(<Projects />);
    const card = await screen.findByText("Üniversite Portalı");
    fireEvent.click(card.closest("[cursor]") || card.closest("div[class]"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/projects/1");
    });
  });
});

describe("Projects - Arama Davranışı", () => {
  it("büyük/küçük harf duyarsız arama yapar", async () => {
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.change(screen.getByPlaceholderText("Proje veya grup adıyla ara..."), { target: { value: "üniversite" } });
    expect(screen.getByText("Üniversite Portalı")).toBeInTheDocument();
  });

  it("eşleşme yoksa boş mesaj gösterir", async () => {
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.change(screen.getByPlaceholderText("Proje veya grup adıyla ara..."), { target: { value: "zzzzzzz" } });
    expect(screen.getByText("Henüz bir proje bulunamadı.")).toBeInTheDocument();
  });

  it("arama temizlenince tüm projeler tekrar gösterilir", async () => {
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    const input = screen.getByPlaceholderText("Proje veya grup adıyla ara...");
    fireEvent.change(input, { target: { value: "Mobil" } });
    expect(screen.queryByText("Üniversite Portalı")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "" } });
    expect(screen.getByText("Üniversite Portalı")).toBeInTheDocument();
    expect(screen.getByText("Mobil Sağlık Takip")).toBeInTheDocument();
    expect(screen.getByText("Akıllı Otopark")).toBeInTheDocument();
  });

  it("grup adına göre arama birden fazla projeyi filtreleyebilir", async () => {
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.change(screen.getByPlaceholderText("Proje veya grup adıyla ara..."), { target: { value: "Alpha" } });
    expect(screen.getByText("Üniversite Portalı")).toBeInTheDocument();
    expect(screen.getByText("Akıllı Otopark")).toBeInTheDocument();
    expect(screen.queryByText("Mobil Sağlık Takip")).not.toBeInTheDocument();
  });
});

describe("Projects - Proje Oluşturma Hata Yönetimi", () => {
  it("API sunucu string hatası döndüğünde mesajı gösterir", async () => {
    api.get.mockResolvedValue({ data: PROJECTS });
    api.post.mockRejectedValue({ response: { data: "Yetkiniz yok." } });
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByText("+ Yeni Proje"));
    fireEvent.change(screen.getByPlaceholderText("Örn: Akıllı Kampüs Sistemi"), { target: { value: "Test" } });
    fireEvent.click(screen.getByText("Oluştur"));

    expect(await screen.findByText("Yetkiniz yok.")).toBeInTheDocument();
  });

  it("API field-level hataları birleştirip gösterir", async () => {
    api.get.mockResolvedValue({ data: PROJECTS });
    api.post.mockRejectedValue({
      response: { data: { title: ["Bu başlık zaten mevcut."], group: ["Geçersiz grup."] } },
    });
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByText("+ Yeni Proje"));
    fireEvent.change(screen.getByPlaceholderText("Örn: Akıllı Kampüs Sistemi"), { target: { value: "Dup" } });
    fireEvent.click(screen.getByText("Oluştur"));

    expect(await screen.findByText(/Bu başlık zaten mevcut/)).toBeInTheDocument();
  });

  it("ağ hatası durumunda 'Sunucuya bağlanılamadı' mesajı gösterir", async () => {
    api.get.mockResolvedValue({ data: PROJECTS });
    api.post.mockRejectedValue(new Error("Network Error"));
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByText("+ Yeni Proje"));
    fireEvent.change(screen.getByPlaceholderText("Örn: Akıllı Kampüs Sistemi"), { target: { value: "Net Err" } });
    fireEvent.click(screen.getByText("Oluştur"));

    expect(await screen.findByText("Sunucuya bağlanılamadı.")).toBeInTheDocument();
  });
});

describe("Projects - Durum ve Onay Mantığı", () => {
  it("3 farklı status badge'ini doğru label ile render eder", async () => {
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    expect(screen.getByText("Devam Ediyor")).toBeInTheDocument();
    expect(screen.getByText("Beklemede")).toBeInTheDocument();
    expect(screen.getByText("Tamamlandı")).toBeInTheDocument();
  });

  it("onaylı projelerde 'Onaylı', onaysızlarda 'Onay Bekliyor' gösterir", async () => {
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    const approved = screen.getAllByText("Onaylı");
    const pending = screen.getAllByText("Onay Bekliyor");
    expect(approved.length).toBe(2);
    expect(pending.length).toBe(1);
  });

  it("üye ve rapor sayılarını doğru gösterir", async () => {
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    const twos = screen.getAllByText("2");
    expect(twos.length).toBeGreaterThanOrEqual(1);

    const threes = screen.getAllByText("3");
    expect(threes.length).toBeGreaterThanOrEqual(1);
  });
});
