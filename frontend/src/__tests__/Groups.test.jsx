import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { render } from "../test/test-utils";
import Groups from "../pages/Groups";

vi.mock("../services/groupApi.js", () => ({
  groupApi: {
    list: vi.fn(),
    detail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    join: vi.fn(),
  },
  groupMemberApi: {
    accept: vi.fn(),
    reject: vi.fn(),
    remove: vi.fn(),
  },
  termLessonApi: {
    list: vi.fn(),
  },
}));

import { groupApi, termLessonApi } from "../services/groupApi.js";

const mockGroups = [
  {
    id: 1,
    title: "Alpha Takımı",
    description: "İlk proje grubu",
    invitation_code: "ABC12345",
    max_size: 5,
    owner: 1,
    status: "active",
    term_lesson: 1,
    memberships: [
      { id: 10, user: 1, user_name: "Test User", user_email: "test@test.com", status: "accepted" },
      { id: 11, user: 2, user_name: "User 2", user_email: "u2@test.com", status: "accepted" },
      { id: 12, user: 3, user_name: "User 3", user_email: "u3@test.com", status: "accepted" },
    ],
    created_at: "2026-03-01T10:00:00Z",
  },
];

function setupMocks(groups = []) {
  groupApi.list.mockResolvedValue(groups);
  termLessonApi.list.mockResolvedValue([]);
}

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ id: 1 }));
  vi.clearAllMocks();
});

describe("Groups", () => {
  it("Gruplarım başlığını gösterir", async () => {
    setupMocks([]);
    render(<Groups />);
    expect(screen.getByRole("heading", { name: /Gruplarım/i })).toBeInTheDocument();
  });

  it("grup yoksa boş durum mesajını gösterir", async () => {
    setupMocks([]);
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByText(/Henüz bir grubun yok/i)).toBeInTheDocument();
    });
  });

  it("boş durumda Grup Oluştur butonunu gösterir", async () => {
    setupMocks([]);
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Grup Oluştur/i })).toBeInTheDocument();
    });
  });

  it("boş durumda Davet Koduyla Katıl butonunu gösterir", async () => {
    setupMocks([]);
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Davet Koduyla Katıl/i })).toBeInTheDocument();
    });
  });

  it("grupları kart olarak listeler", async () => {
    setupMocks(mockGroups);
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByText("Alpha Takımı")).toBeInTheDocument();
    });
  });

  it("davet kodunu gösterir", async () => {
    setupMocks(mockGroups);
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByText("ABC12345")).toBeInTheDocument();
    });
  });

  it("üye sayısını gösterir", async () => {
    setupMocks(mockGroups);
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByText("3/5 üye")).toBeInTheDocument();
    });
  });

  it("Yeni Grup butonuna tıklayınca form açılır", async () => {
    setupMocks(mockGroups);
    render(<Groups />);
    await waitFor(() => screen.getByText("Alpha Takımı"));
    fireEvent.click(screen.getByRole("button", { name: /Yeni Grup/i }));
    expect(screen.getByRole("heading", { name: /Yeni Grup Oluştur/i })).toBeInTheDocument();
  });

  it("Davet Koduyla Katıl butonuna tıklayınca form açılır", async () => {
    setupMocks(mockGroups);
    render(<Groups />);
    await waitFor(() => screen.getByText("Alpha Takımı"));
    fireEvent.click(screen.getByRole("button", { name: /Davet Koduyla Katıl/i }));
    expect(screen.getByRole("heading", { name: /Gruba Katıl/i })).toBeInTheDocument();
  });

  it("Kopyala butonunu gösterir", async () => {
    setupMocks(mockGroups);
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Kopyala/i })).toBeInTheDocument();
    });
  });
});