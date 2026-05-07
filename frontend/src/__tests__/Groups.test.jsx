import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "../test/test-utils";
import Groups from "../pages/Groups";


vi.mock("../services/groupApi.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    groupApi: {
      list: vi.fn(),
      detail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      join: vi.fn(),
      leave: vi.fn(),
    },
    groupMemberApi: {
      accept: vi.fn(),
      reject: vi.fn(),
      remove: vi.fn(),
    },
    termLessonApi: {
      list: vi.fn(),
    },
  };
});

import { groupApi, termLessonApi } from "../services/groupApi.js";

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

  it("boş durumda Davet Koduyla Katıl butonunu gösterir", async () => {
    setupMocks([]);
    render(<Groups />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Davet Koduyla Katıl/i })).toBeInTheDocument();
    });
  });
});