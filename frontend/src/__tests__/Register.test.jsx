import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../test/test-utils";
import Register from "../pages/Register";

// api modülünü mock'la (Register useEffect'te departments çekiyor)
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
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });

  it("ad input alanını gösterir", () => {
    render(<Register />);
    expect(screen.getByPlaceholderText("Ad")).toBeInTheDocument();
  });

  it("soyad input alanını gösterir", () => {
    render(<Register />);
    expect(screen.getByPlaceholderText("Soyad")).toBeInTheDocument();
  });

  it("kimlik numarası input alanını gösterir", () => {
    render(<Register />);
    expect(screen.getByPlaceholderText(/Kimlik Numarası/i)).toBeInTheDocument();
  });

  it("telefon input alanını gösterir", () => {
    render(<Register />);
    expect(screen.getByPlaceholderText(/Telefon/i)).toBeInTheDocument();
  });

  it("adres input alanını gösterir", () => {
    render(<Register />);
    expect(screen.getByPlaceholderText("Adres")).toBeInTheDocument();
  });

  it("şifre input alanlarını gösterir", () => {
    render(<Register />);
    expect(screen.getByPlaceholderText(/Şifre \(en az/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Şifre Tekrarı")).toBeInTheDocument();
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
