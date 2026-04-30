import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { render } from "../test/test-utils";
import Groups from "../pages/Groups";

vi.mock("../services/api.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../services/api.js";

const mockGroups = [
  {
    id: 1,
    name: "Alpha Takımı",
    description: "İlk proje grubu",
    invite_code: "ABC12345",
    max_members: 5,
    member_count: 3,
    owner: 1,
    owner_name: "Test User",
    is_member: true,
    created_at: "2026-03-01T10:00:00Z",
  },
];

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ id: 1 }));
  vi.clearAllMocks();
});

describe("Groups", () => {
  it("Gruplarım başlığını gösterir", async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    render(<Groups />);
    expect(screen.getByRole("heading", { name: /Gruplarım/i })).toBeInTheDocument();
  });

  it("grup yoksa boş durum mesajını gösterir", async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByText(/Henüz bir grubun yok/i)).toBeInTheDocument();
    });
  });

  it("boş durumda Grup Oluştur butonunu gösterir", async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Grup Oluştur/i })).toBeInTheDocument();
    });
  });

  it("boş durumda Davet Koduyla Katıl butonunu gösterir", async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Davet Koduyla Katıl/i })).toBeInTheDocument();
    });
  });

  it("grupları kart olarak listeler", async () => {
    api.get.mockResolvedValueOnce({ data: mockGroups });
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByText("Alpha Takımı")).toBeInTheDocument();
    });
  });

  it("davet kodunu gösterir", async () => {
    api.get.mockResolvedValueOnce({ data: mockGroups });
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByText("ABC12345")).toBeInTheDocument();
    });
  });

  it("üye sayısını gösterir", async () => {
    api.get.mockResolvedValueOnce({ data: mockGroups });
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByText("3/5 üye")).toBeInTheDocument();
    });
  });

  it("Yeni Grup butonuna tıklayınca form açılır", async () => {
    api.get.mockResolvedValueOnce({ data: mockGroups });
    render(<Groups />);
    await waitFor(() => screen.getByText("Alpha Takımı"));
    fireEvent.click(screen.getByRole("button", { name: /Yeni Grup/i }));
    expect(screen.getByRole("heading", { name: /Yeni Grup Oluştur/i })).toBeInTheDocument();
  });

  it("Davet Koduyla Katıl butonuna tıklayınca form açılır", async () => {
    api.get.mockResolvedValueOnce({ data: mockGroups });
    render(<Groups />);
    await waitFor(() => screen.getByText("Alpha Takımı"));
    fireEvent.click(screen.getByRole("button", { name: /Davet Koduyla Katıl/i }));
    expect(screen.getByRole("heading", { name: /Gruba Katıl/i })).toBeInTheDocument();
  });

  it("Kopyala butonunu gösterir", async () => {
    api.get.mockResolvedValueOnce({ data: mockGroups });
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Kopyala/i })).toBeInTheDocument();
    });
  });
});
