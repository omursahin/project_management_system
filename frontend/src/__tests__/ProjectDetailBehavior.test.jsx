import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { render } from "../test/test-utils";
import ProjectDetail from "../pages/ProjectDetail";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useParams: () => ({ id: "1" }), useNavigate: () => mockNavigate };
});

vi.mock("../services/api.js", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import api from "../services/api.js";

const PROJECT = {
  id: 1, group: 1, group_name: "Alpha Takımı", title: "Üniversite Portalı",
  description: "Kapsamlı platform.", status: "in_progress", is_approved: true,
  created_at: "2026-03-18T10:00:00Z",
  reports: [
    { id: 1, report_name: "Ara Rapor", is_submitted: true, plagiarism_rate: 4.2, version: 1 },
    { id: 2, report_name: "Final Rapor", is_submitted: false, plagiarism_rate: 18.5, version: 1 },
  ],
  members: [
    { id: 1, full_name: "Ahmet Yılmaz", role: "leader" },
    { id: 2, full_name: "Elif Demir", role: "member" },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockResolvedValue({ data: PROJECT });
});

describe("ProjectDetail - Ayarlar Sekmesi", () => {
  it("başlık değiştirilip kaydedilince PUT ile güncel değer gönderilir", async () => {
    api.put.mockResolvedValue({ data: PROJECT });
    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByRole("tab", { name: "Proje Ayarları" }));

    const titleInput = await screen.findByDisplayValue("Üniversite Portalı");
    fireEvent.change(titleInput, { target: { value: "Yeni Başlık" } });
    fireEvent.click(screen.getByText("Kaydet"));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/api/group-project/1/", expect.objectContaining({
        title: "Yeni Başlık",
      }));
    });
  });

  it("kaydetme başarılı olunca 'Kaydedildi.' mesajı gösterilir", async () => {
    api.put.mockResolvedValue({ data: PROJECT });
    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByRole("tab", { name: "Proje Ayarları" }));
    fireEvent.click(await screen.findByText("Kaydet"));

    expect(await screen.findByText("Kaydedildi.")).toBeInTheDocument();
  });

  it("kaydetme başarısız olunca 'Hata oluştu.' mesajı gösterilir", async () => {
    api.put.mockRejectedValue(new Error("fail"));
    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByRole("tab", { name: "Proje Ayarları" }));
    fireEvent.click(await screen.findByText("Kaydet"));

    expect(await screen.findByText("Hata oluştu.")).toBeInTheDocument();
  });

  it("durum select'i değiştirilebilir", async () => {
    api.put.mockResolvedValue({ data: PROJECT });
    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByRole("tab", { name: "Proje Ayarları" }));
    const select = await screen.findByDisplayValue("Devam Ediyor");
    fireEvent.change(select, { target: { value: "completed" } });
    fireEvent.click(screen.getByText("Kaydet"));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/api/group-project/1/", expect.objectContaining({
        status: "completed",
      }));
    });
  });
});

describe("ProjectDetail - Raporlar Sekmesi", () => {
  it("plagiarism oranına göre doğru renk badge'i gösterir", async () => {
    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByRole("tab", { name: "Raporlar" }));

    const lowRate = await screen.findByText(/4\.2/);
    expect(lowRate).toBeInTheDocument();

    const highRate = screen.getByText(/18\.5/);
    expect(highRate).toBeInTheDocument();
  });

  it("rapor yoksa 'Henüz rapor yüklenmemiş' mesajı gösterir", async () => {
    api.get.mockResolvedValue({ data: { ...PROJECT, reports: [] } });
    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByRole("tab", { name: "Raporlar" }));
    expect(await screen.findByText("Henüz rapor yüklenmemiş.")).toBeInTheDocument();
  });
});

describe("ProjectDetail - Grup Sekmesi", () => {
  it("üye yoksa 'Üye bilgisi yok.' mesajı gösterir", async () => {
    api.get.mockResolvedValue({ data: { ...PROJECT, members: [] } });
    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByRole("tab", { name: "Grup" }));
    expect(await screen.findByText("Üye bilgisi yok.")).toBeInTheDocument();
  });

  it("lider ve üye rolleri doğru badge ile gösterilir", async () => {
    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByRole("tab", { name: "Grup" }));
    expect(await screen.findByText("Lider")).toBeInTheDocument();
    expect(screen.getByText("Üye")).toBeInTheDocument();
  });
});

describe("ProjectDetail - Silme ve Navigasyon", () => {
  it("silme onaylanınca DELETE çağrılır ve /projects'e navigate eder", async () => {
    api.delete.mockResolvedValue({ data: null });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");
    fireEvent.click(screen.getByText("Projeyi Sil"));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/api/group-project/1/");
      expect(mockNavigate).toHaveBeenCalledWith("/projects");
    });
    window.confirm.mockRestore();
  });

  it("silme hatası olunca alert gösterilir", async () => {
    api.delete.mockRejectedValue(new Error("fail"));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");
    fireEvent.click(screen.getByText("Projeyi Sil"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Proje silinirken hata oluştu.");
    });
    window.confirm.mockRestore();
    window.alert.mockRestore();
  });

  it("← Projelere Dön butonuna tıklayınca /projects'e navigate eder", async () => {
    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");
    fireEvent.click(screen.getByText("← Projelere Dön"));

    expect(mockNavigate).toHaveBeenCalledWith("/projects");
  });

  it("oluşturulma tarihi Türkçe formatta gösterilir", async () => {
    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");
    expect(screen.getByText("18.03.2026")).toBeInTheDocument();
  });
});
