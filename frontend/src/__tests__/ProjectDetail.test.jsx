import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { render } from "../test/test-utils";
import ProjectDetail from "../pages/ProjectDetail";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useParams: () => ({ id: "1" }) };
});

vi.mock("../services/api.js", () => {
  const mockApi = {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  };
  return { default: mockApi };
});

import api from "../services/api.js";

const MOCK_PROJECT = {
  id: 1,
  group: 1,
  group_name: "Alpha Takımı",
  title: "Üniversite Portalı",
  description: "Kapsamlı web platformu.",
  status: "in_progress",
  is_approved: true,
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
  api.get.mockResolvedValue({ data: MOCK_PROJECT });
});

describe("ProjectDetail", () => {
  it("proje başlığını ve grup adını gösterir", async () => {
    render(<ProjectDetail />);
    expect(await screen.findByText("Üniversite Portalı")).toBeInTheDocument();
    const alphaMatches = screen.getAllByText("Alpha Takımı");
    expect(alphaMatches.length).toBeGreaterThanOrEqual(1);
  });

  it("4 sekme tabını render eder", async () => {
    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");

    expect(screen.getByRole("tab", { name: "Genel Bakış" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Proje Ayarları" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Grup" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Raporlar" })).toBeInTheDocument();
  });

  it("genel bakış sekmesinde durum ve onay bilgisi gösterir", async () => {
    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");

    const badges = screen.getAllByText("Devam Ediyor");
    expect(badges.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Onaylandı")).toBeInTheDocument();
  });

  it("projelere dön butonu render edilir", async () => {
    render(<ProjectDetail />);
    expect(await screen.findByText("← Projelere Dön")).toBeInTheDocument();
  });

  it("projeyi sil butonu render edilir", async () => {
    render(<ProjectDetail />);
    expect(await screen.findByText("Projeyi Sil")).toBeInTheDocument();
  });

  it("API hatası durumunda 'Proje bulunamadı' gösterir", async () => {
    api.get.mockRejectedValue(new Error("404"));
    render(<ProjectDetail />);
    expect(await screen.findByText("Proje bulunamadı.")).toBeInTheDocument();
  });

  it("grup sekmesinde üyeleri listeler", async () => {
    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByRole("tab", { name: "Grup" }));

    expect(await screen.findByText("Ahmet Yılmaz")).toBeInTheDocument();
    expect(screen.getByText("Elif Demir")).toBeInTheDocument();
    expect(screen.getByText("Lider")).toBeInTheDocument();
    expect(screen.getByText("Üye")).toBeInTheDocument();
  });

  it("raporlar sekmesinde raporları listeler", async () => {
    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByRole("tab", { name: "Raporlar" }));

    expect(await screen.findByText("Ara Rapor")).toBeInTheDocument();
    expect(screen.getByText("Final Rapor")).toBeInTheDocument();
    expect(screen.getByText("Teslim Edildi")).toBeInTheDocument();
    expect(screen.getByText("Taslak")).toBeInTheDocument();
  });

  it("proje ayarları sekmesinde kaydet butonu var", async () => {
    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByRole("tab", { name: "Proje Ayarları" }));

    expect(await screen.findByText("Kaydet")).toBeInTheDocument();
  });

  it("proje ayarlarını kaydeder", async () => {
    api.put.mockResolvedValue({ data: MOCK_PROJECT });
    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByRole("tab", { name: "Proje Ayarları" }));
    fireEvent.click(await screen.findByText("Kaydet"));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        "/api/group-project/1/",
        expect.objectContaining({ title: "Üniversite Portalı" })
      );
    });
  });

  it("silme işleminde confirm ile api.delete çağrılır", async () => {
    api.delete.mockResolvedValue({ data: null });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByText("Projeyi Sil"));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/api/group-project/1/");
    });

    window.confirm.mockRestore();
  });

  it("silme iptal edilirse api.delete çağrılmaz", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<ProjectDetail />);
    await screen.findByText("Üniversite Portalı");

    fireEvent.click(screen.getByText("Projeyi Sil"));

    expect(api.delete).not.toHaveBeenCalled();
    window.confirm.mockRestore();
  });
});