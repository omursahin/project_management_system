import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { render } from "../test/test-utils";
import Profile from "../pages/Profile";

const {
  apiGetMock,
  getProfileMock,
  updateProfileMock,
  changePasswordMock,
} = vi.hoisted(() => ({
  apiGetMock: vi.fn((url) => {
    if (url === "/api/department/") {
      return Promise.resolve({ data: [{ id: 3, name: "Yazilim Muhendisligi" }] });
    }
    return Promise.resolve({ data: {} });
  }),
  getProfileMock: vi.fn(() =>
    Promise.resolve({
      id: 1,
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      identification_number: "12345678901",
      phone_number: "05550000000",
      address: "Istanbul",
      department: 3,
    })
  ),
  updateProfileMock: vi.fn(),
  changePasswordMock: vi.fn(),
}));

vi.mock("../services/api.js", () => ({
  default: {
    get: apiGetMock,
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock("../services/profile.js", () => ({
  profileApi: {
    getProfile: getProfileMock,
    updateProfile: updateProfileMock,
    changePassword: changePasswordMock,
  },
}));

describe("Profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("tokens", JSON.stringify({ access: "test", refresh: "refresh" }));
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 1,
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
      })
    );
  });

  it("Profilim basligini gosterir", () => {
    render(<Profile />);
    expect(screen.getByRole("heading", { name: /Profilim/i })).toBeInTheDocument();
  });

  it("profil bilgileri formunu gosterir", () => {
    render(<Profile />);
    expect(screen.getByRole("button", { name: /Bilgileri Kaydet/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Adresiniz")).toBeInTheDocument();
  });

  it("sifre degistirme formunu gosterir", () => {
    render(<Profile />);
    expect(screen.getByRole("button", { name: /Şifreyi Güncelle/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Mevcut şifrenizi girin")).toBeInTheDocument();
  });

  it("profil guncelleme basarisinda bildirim gosterir", async () => {
    updateProfileMock.mockResolvedValueOnce({
      id: 1,
      email: "test@example.com",
      first_name: "Guncel",
      last_name: "User",
      identification_number: "12345678901",
      phone_number: "05551112233",
      address: "Ankara",
      department: 3,
    });

    render(<Profile />);

    await screen.findAllByText("Yazilim Muhendisligi");

    fireEvent.change(screen.getByPlaceholderText("Adınız"), { target: { value: "Guncel" } });
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Adınız")).toHaveValue("Guncel");
    });
    fireEvent.click(screen.getByRole("button", { name: /Bilgileri Kaydet/i }));

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: "Guncel",
          department: "3",
        })
      );
    });

    expect(
      await screen.findByText("Profil bilgileri güncellendi.")
    ).toBeInTheDocument();
    expect(screen.getAllByText("Yazilim Muhendisligi").length).toBeGreaterThan(0);
  });

  it("sifre degistirme hatasinda bildirim gosterir", async () => {
    changePasswordMock.mockRejectedValueOnce({
      response: {
        data: {
          detail: "Mevcut şifre hatalı.",
        },
      },
    });

    render(<Profile />);

    await screen.findByDisplayValue("Istanbul");

    fireEvent.change(screen.getByPlaceholderText("Mevcut şifrenizi girin"), {
      target: { value: "yanlis-sifre" },
    });
    fireEvent.change(screen.getByPlaceholderText("En az 8 karakter"), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("Yeni şifrenizi tekrar girin"), {
      target: { value: "12345678" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Şifreyi Güncelle/i }));

    expect(await screen.findByText("Mevcut şifre hatalı.")).toBeInTheDocument();
  });
});
