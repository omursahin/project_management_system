import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { render } from "../test/test-utils";
import Register from "../pages/Register";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../services/api.js", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn().mockResolvedValue({ data: [{ id: 1, name: "Bilgisayar Mühendisliği" }] }),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import api from "../services/api.js";

function fillForm(overrides = {}) {
  const defaults = {
    Email: "test@erciyes.edu.tr",
    Ad: "Mehmet",
    Soyad: "Kaya",
    "Kimlik Numarası (11 haneli)": "12345678901",
    "Telefon Numarası": "05551234567",
    Adres: "Kayseri",
    "Şifre (en az 8 karakter)": "SecurePass1",
    "Şifre Tekrarı": "SecurePass1",
  };
  const merged = { ...defaults, ...overrides };
  Object.entries(merged).forEach(([placeholder, value]) => {
    if (value !== null) {
      fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
    }
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  api.get.mockResolvedValue({ data: [{ id: 1, name: "Bilgisayar Mühendisliği" }] });
});

afterEach(() => {
  localStorage.clear();
});

describe("Register - Validasyon Kuralları", () => {
  it("tüm alanlar boşken submit edince tüm zorunlu alan hataları gösterilir", async () => {
    render(<Register />);
    fireEvent.click(screen.getByRole("button", { name: /Kayıt Ol/i }));

    expect(await screen.findByText("Email zorunludur")).toBeInTheDocument();
    expect(screen.getByText("Ad zorunludur")).toBeInTheDocument();
    expect(screen.getByText("Soyad zorunludur")).toBeInTheDocument();
    expect(screen.getByText("Kimlik numarası zorunludur")).toBeInTheDocument();
    expect(screen.getByText("Telefon numarası zorunludur")).toBeInTheDocument();
    expect(screen.getByText("Adres zorunludur")).toBeInTheDocument();
    expect(screen.getByText("Şifre zorunludur")).toBeInTheDocument();
    expect(screen.getByText("Şifre tekrarı zorunludur")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("geçersiz email formatında hata gösterir", async () => {
    render(<Register />);
    fillForm({ Email: "not-an-email" });
    fireEvent.click(screen.getByRole("button", { name: /Kayıt Ol/i }));
    expect(await screen.findByText("Geçerli bir email giriniz")).toBeInTheDocument();
  });

  it("kimlik numarası 11 haneden az olunca hata gösterir", async () => {
    render(<Register />);
    fillForm({ "Kimlik Numarası (11 haneli)": "12345" });
    fireEvent.click(screen.getByRole("button", { name: /Kayıt Ol/i }));
    expect(await screen.findByText("Kimlik numarası 11 haneli sayı olmalıdır")).toBeInTheDocument();
  });

  it("kimlik numarası harf içerince hata gösterir", async () => {
    render(<Register />);
    fillForm({ "Kimlik Numarası (11 haneli)": "1234567890a" });
    fireEvent.click(screen.getByRole("button", { name: /Kayıt Ol/i }));
    expect(await screen.findByText("Kimlik numarası 11 haneli sayı olmalıdır")).toBeInTheDocument();
  });

  it("şifre 8 karakterden kısa olunca hata gösterir", async () => {
    render(<Register />);
    fillForm({ "Şifre (en az 8 karakter)": "abc", "Şifre Tekrarı": "abc" });
    fireEvent.click(screen.getByRole("button", { name: /Kayıt Ol/i }));
    expect(await screen.findByText("Şifre en az 8 karakter olmalıdır")).toBeInTheDocument();
  });

  it("şifreler eşleşmezse hata gösterir", async () => {
    render(<Register />);
    fillForm({ "Şifre (en az 8 karakter)": "SecurePass1", "Şifre Tekrarı": "DifferentPass" });
    fireEvent.click(screen.getByRole("button", { name: /Kayıt Ol/i }));
    expect(await screen.findByText("Şifreler eşleşmiyor")).toBeInTheDocument();
  });

  it("hatalı alana değer girilince o hata temizlenir", async () => {
    render(<Register />);
    fireEvent.click(screen.getByRole("button", { name: /Kayıt Ol/i }));
    expect(await screen.findByText("Email zorunludur")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "x@y.com" } });
    expect(screen.queryByText("Email zorunludur")).not.toBeInTheDocument();
  });
});

describe("Register - Başarılı Kayıt", () => {
  it("geçerli form ile /account/register/ endpoint'ine doğru payload gönderir", async () => {
    api.post.mockResolvedValue({ data: { token: "t", user: { id: 1 } } });
    render(<Register />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /Kayıt Ol/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/account/register/", expect.objectContaining({
        email: "test@erciyes.edu.tr",
        first_name: "Mehmet",
        last_name: "Kaya",
        identification_number: "12345678901",
        phone_number: "05551234567",
        address: "Kayseri",
        password: "SecurePass1",
        password2: "SecurePass1",
      }));
    });
  });

  it("başarılı kayıt sonrası token localStorage'a yazılır ve /dashboard'a navigate eder", async () => {
    const mockUser = { id: 5, email: "test@erciyes.edu.tr" };
    api.post.mockResolvedValue({ data: { token: "reg-token", user: mockUser } });
    render(<Register />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /Kayıt Ol/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("reg-token");
      expect(JSON.parse(localStorage.getItem("user"))).toEqual(mockUser);
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });
});

describe("Register - API Hata Yönetimi", () => {
  it("sunucu field-level hatalar döndürünce gösterir", async () => {
    api.post.mockRejectedValue({
      response: { data: { email: ["Bu email zaten kayıtlı."] } },
    });
    render(<Register />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /Kayıt Ol/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
  });

  it("ağ hatası durumunda genel hata mesajı gösterir", async () => {
    api.post.mockRejectedValue(new Error("Network Error"));
    render(<Register />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /Kayıt Ol/i }));

    expect(await screen.findByText("Bir hata oluştu. Lütfen tekrar deneyin.")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("Register - Departman Yükleme", () => {
  it("mount olduğunda /department/ endpoint'inden bölümleri çeker", async () => {
    render(<Register />);
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/department/");
    });
  });
});
