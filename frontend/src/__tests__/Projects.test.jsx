import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { render } from "../test/test-utils";
import Projects from "../pages/Projects";

vi.mock("../services/api.js", () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  };
  return { default: mockApi };
});

import api from "../services/api.js";

const MOCK_PROJECTS = [
  {
    id: 1,
    group: 1,
    group_name: "Alpha Takımı",
    title: "Üniversite Portalı",
    description: "Kapsamlı web platformu.",
    status: "in_progress",
    is_approved: true,
    created_at: "2026-03-18T10:00:00Z",
    reports: [{ id: 1 }],
    members: [{ id: 1 }, { id: 2 }],
  },
  {
    id: 2,
    group: 2,
    group_name: "Beta Projesi",
    title: "Mobil Sağlık Takip",
    description: "Mobil uygulama.",
    status: "pending",
    is_approved: false,
    created_at: "2026-03-22T08:00:00Z",
    reports: [],
    members: [{ id: 4 }],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockResolvedValue({ data: MOCK_PROJECTS });
});

describe("Projects", () => {
  it("proje kartlarını listeler", async () => {
    render(<Projects />);
    expect(await screen.findByText("Üniversite Portalı")).toBeInTheDocument();
    expect(screen.getByText("Mobil Sağlık Takip")).toBeInTheDocument();
  });

  it("başlık ve buton render edilir", async () => {
    render(<Projects />);
    expect(await screen.findByText("Projelerim")).toBeInTheDocument();
    expect(screen.getByText("+ Yeni Proje")).toBeInTheDocument();
  });

  it("arama filtresi çalışır", async () => {
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    const searchInput = screen.getByPlaceholderText("Proje veya grup adıyla ara...");
    fireEvent.change(searchInput, { target: { value: "Mobil" } });

    expect(screen.queryByText("Üniversite Portalı")).not.toBeInTheDocument();
    expect(screen.getByText("Mobil Sağlık Takip")).toBeInTheDocument();
  });

  it("grup adına göre arama yapar", async () => {
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    const searchInput = screen.getByPlaceholderText("Proje veya grup adıyla ara...");
    fireEvent.change(searchInput, { target: { value: "Alpha" } });

    expect(screen.getByText("Üniversite Portalı")).toBeInTheDocument();
    expect(screen.queryByText("Mobil Sağlık Takip")).not.toBeInTheDocument();
  });

  it("yeni proje paneli açılıp kapanır", async () => {
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    const btn = screen.getByText("+ Yeni Proje");
    fireEvent.click(btn);
    expect(screen.getByText("Yeni Proje Oluştur")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Kapat"));
    expect(screen.queryByText("Yeni Proje Oluştur")).not.toBeInTheDocument();
  });

  it("boş başlıkla proje oluşturmaya çalışınca hata gösterir", async () => {
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByText("+ Yeni Proje"));
    fireEvent.click(screen.getByText("Oluştur"));

    expect(await screen.findByText("Proje başlığı zorunludur.")).toBeInTheDocument();
  });

  it("proje oluşturma başarılı olunca listeyi yeniler", async () => {
    api.post.mockResolvedValue({ data: { id: 99 } });
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByText("+ Yeni Proje"));

    const titleInput = screen.getByPlaceholderText("Örn: Akıllı Kampüs Sistemi");
    fireEvent.change(titleInput, { target: { value: "Test Proje" } });
    fireEvent.click(screen.getByText("Oluştur"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/api/group-project/", expect.objectContaining({ title: "Test Proje" }));
    });
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it("API hatası durumunda boş liste gösterir", async () => {
    api.get.mockRejectedValue(new Error("fail"));
    render(<Projects />);
    expect(await screen.findByText("Henüz bir proje bulunamadı.")).toBeInTheDocument();
  });

  it("onaylı ve onay bekliyor badge'lerini gösterir", async () => {
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    expect(screen.getByText("Onaylı")).toBeInTheDocument();
    expect(screen.getByText("Onay Bekliyor")).toBeInTheDocument();
  });

  it("durum badge'lerini doğru renk etiketiyle gösterir", async () => {
    render(<Projects />);
    await screen.findByText("Üniversite Portalı");

    expect(screen.getByText("Devam Ediyor")).toBeInTheDocument();
    expect(screen.getByText("Beklemede")).toBeInTheDocument();
  });
});
