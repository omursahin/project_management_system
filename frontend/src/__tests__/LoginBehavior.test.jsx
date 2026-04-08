import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { render } from "../test/test-utils";
import Login from "../pages/Login";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../services/api.js", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import api from "../services/api.js";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("Login - Validasyon", () => {
  it("boş email ile submit edince 'Email zorunludur' hatası gösterir", async () => {
    render(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /Giriş Yap/i }));
    expect(await screen.findByText("Email zorunludur")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("geçersiz email formatında 'Geçerli bir email giriniz' hatası gösterir", async () => {
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "invalid-email" } });
    fireEvent.change(screen.getByPlaceholderText("Şifre"), { target: { value: "12345678" } });
    fireEvent.click(screen.getByRole("button", { name: /Giriş Yap/i }));
    expect(await screen.findByText("Geçerli bir email giriniz")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("boş şifre ile submit edince 'Şifre zorunludur' hatası gösterir", async () => {
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@test.com" } });
    fireEvent.click(screen.getByRole("button", { name: /Giriş Yap/i }));
    expect(await screen.findByText("Şifre zorunludur")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("her iki alan da boşsa iki hata mesajı birden gösterir", async () => {
    render(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /Giriş Yap/i }));
    expect(await screen.findByText("Email zorunludur")).toBeInTheDocument();
    expect(screen.getByText("Şifre zorunludur")).toBeInTheDocument();
  });

  it("hatalı alana değer girilince o alanın hatası temizlenir", async () => {
    render(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /Giriş Yap/i }));
    expect(await screen.findByText("Email zorunludur")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "a@b.com" } });
    expect(screen.queryByText("Email zorunludur")).not.toBeInTheDocument();
    expect(screen.getByText("Şifre zorunludur")).toBeInTheDocument();
  });
});

describe("Login - Başarılı Giriş", () => {
  it("geçerli formda /account/login/ endpoint'ine doğru payload gönderir", async () => {
    api.post.mockResolvedValue({ data: { token: "abc123", user: { id: 1, email: "a@b.com" } } });
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByPlaceholderText("Şifre"), { target: { value: "pass1234" } });
    fireEvent.click(screen.getByRole("button", { name: /Giriş Yap/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/account/login/", {
        email: "a@b.com",
        password: "pass1234",
      });
    });
  });

  it("başarılı login sonrası token ve user bilgisi localStorage'a yazılır", async () => {
    const mockUser = { id: 1, email: "a@b.com" };
    api.post.mockResolvedValue({ data: { token: "jwt-token-123", user: mockUser } });
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByPlaceholderText("Şifre"), { target: { value: "pass1234" } });
    fireEvent.click(screen.getByRole("button", { name: /Giriş Yap/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("jwt-token-123");
      expect(JSON.parse(localStorage.getItem("user"))).toEqual(mockUser);
    });
  });

  it("başarılı login sonrası /dashboard'a navigate eder", async () => {
    api.post.mockResolvedValue({ data: { token: "t", user: { id: 1 } } });
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByPlaceholderText("Şifre"), { target: { value: "pass1234" } });
    fireEvent.click(screen.getByRole("button", { name: /Giriş Yap/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });
});

describe("Login - API Hata Yönetimi", () => {
  it("sunucu error field döndürünce genel hata mesajı gösterir", async () => {
    api.post.mockRejectedValue({
      response: { data: { error: "Email veya şifre hatalı." } },
    });
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByPlaceholderText("Şifre"), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: /Giriş Yap/i }));

    expect(await screen.findByText("Email veya şifre hatalı.")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("ağ hatası durumunda genel fallback mesaj gösterir", async () => {
    api.post.mockRejectedValue(new Error("Network Error"));
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByPlaceholderText("Şifre"), { target: { value: "pass1234" } });
    fireEvent.click(screen.getByRole("button", { name: /Giriş Yap/i }));

    expect(await screen.findByText("Bir hata oluştu. Lütfen tekrar deneyin.")).toBeInTheDocument();
  });

  it("sunucu field-level hatalar döndürünce bunları set eder", async () => {
    api.post.mockRejectedValue({
      response: { data: { email: "Bu email kayıtlı değil." } },
    });
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "x@x.com" } });
    fireEvent.change(screen.getByPlaceholderText("Şifre"), { target: { value: "pass1234" } });
    fireEvent.click(screen.getByRole("button", { name: /Giriş Yap/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
  });
});
