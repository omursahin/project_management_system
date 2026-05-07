import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../test/test-utils";
import Register from "../pages/Register";

vi.mock("../services/api.js", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

describe("Register", () => {
  it("Kayıt Ol başlığını gösterir", () => {
    render(<Register />);
    expect(screen.getByRole("heading", { name: /Kayıt Ol/i })).toBeInTheDocument();
  });

  it("email input alanını gösterir", () => {
    render(<Register />);
    expect(screen.getByPlaceholderText("örnek@email.com")).toBeInTheDocument();
  });

  it("ad input alanını gösterir", () => {
    render(<Register />);
    expect(screen.getByPlaceholderText("Adınız")).toBeInTheDocument();
  });

  it("soyad input alanını gösterir", () => {
    render(<Register />);
    expect(screen.getByPlaceholderText("Soyadınız")).toBeInTheDocument();
  });

  it("kimlik numarası input alanını gösterir", () => {
    render(<Register />);
    expect(screen.getByPlaceholderText(/kimlik numarası/i)).toBeInTheDocument();
  });

  it("şifre input alanlarını gösterir", () => {
    render(<Register />);
    expect(screen.getByPlaceholderText("En az 8 karakter")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Şifrenizi tekrar girin")).toBeInTheDocument();
  });

  it("kayıt butonunu gösterir", () => {
    render(<Register />);
    expect(screen.getByRole("button", { name: /Kayıt Ol/i })).toBeInTheDocument();
  });

  it("giriş yap linkini gösterir", () => {
    render(<Register />);
    expect(screen.getByText("Giriş Yap")).toBeInTheDocument();
  });
});
