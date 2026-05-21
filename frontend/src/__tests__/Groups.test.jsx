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
    title: "Alpha Takımı",
    description: "İlk proje grubu",
    invitation_code: "ABC12345",
    max_size: 5,
    owner: 1,
    term_lesson: 1,
    status: "active",
    memberships: [
      { id: 10, user: 1, user_email: "lead@x.com", user_name: "Lead", status: "accepted" },
      { id: 11, user: 2, user_email: "m1@x.com", user_name: "M1", status: "accepted" },
      { id: 12, user: 3, user_email: "m2@x.com", user_name: "M2", status: "accepted" },
    ],
  },
];

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ id: 1 }));
  vi.clearAllMocks();
  api.get.mockImplementation((url) => {
    if (url === "/api/group/") return Promise.resolve({ data: [] });
    if (url === "/api/term-lesson/") return Promise.resolve({ data: [] });
    return Promise.resolve({ data: [] });
  });
});

describe("Groups", () => {
  it("Gruplarım başlığını gösterir", async () => {
    render(<Groups />);
    expect(screen.getByRole("heading", { name: /Gruplarım/i })).toBeInTheDocument();
  });

  it("grup yoksa boş durum mesajını gösterir", async () => {
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByText(/Henüz bir grubun yok/i)).toBeInTheDocument();
    });
  });

  it("boş durumda Grup Oluştur butonunu gösterir", async () => {
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Grup Oluştur/i })).toBeInTheDocument();
    });
  });

  it("boş durumda Davet Koduyla Katıl butonunu gösterir", async () => {
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Davet Koduyla Katıl/i })).toBeInTheDocument();
    });
  });

  it("grupları kart olarak listeler", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/api/group/") return Promise.resolve({ data: mockGroups });
      if (url === "/api/term-lesson/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByText("Alpha Takımı")).toBeInTheDocument();
    });
  });

  it("davet kodunu gösterir", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/api/group/") return Promise.resolve({ data: mockGroups });
      if (url === "/api/term-lesson/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByText("ABC12345")).toBeInTheDocument();
    });
  });

  it("üye sayısını gösterir", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/api/group/") return Promise.resolve({ data: mockGroups });
      if (url === "/api/term-lesson/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByText("3/5")).toBeInTheDocument();
    });
  });

  it("Yeni Grup butonuna tıklayınca form açılır", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/api/group/") return Promise.resolve({ data: mockGroups });
      if (url === "/api/term-lesson/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    render(<Groups />);
    await waitFor(() => screen.getByText("Alpha Takımı"));
    fireEvent.click(screen.getByRole("button", { name: /Yeni Grup/i }));
    expect(screen.getByRole("heading", { name: /Yeni Grup Oluştur/i })).toBeInTheDocument();
  });

  it("Davet Koduyla Katıl butonuna tıklayınca form açılır", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/api/group/") return Promise.resolve({ data: mockGroups });
      if (url === "/api/term-lesson/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    render(<Groups />);
    await waitFor(() => screen.getByText("Alpha Takımı"));
    fireEvent.click(screen.getByRole("button", { name: /Davet Koduyla Katıl/i }));
    expect(screen.getByRole("heading", { name: /Gruba Katıl/i })).toBeInTheDocument();
  });

  it("Kopyala butonunu gösterir", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/api/group/") return Promise.resolve({ data: mockGroups });
      if (url === "/api/term-lesson/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Kopyala/i })).toBeInTheDocument();
    });
  });
});
