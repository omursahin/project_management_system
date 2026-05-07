import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../test/test-utils";
import Login from "../pages/Login";

vi.mock("../services/api.js", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("Login", () => {
  it("Giriş Yap başlığını gösterir", () => {
    render(<Login />);
    expect(screen.getByRole("heading", { name: /Giriş Yap/i })).toBeInTheDocument();
  });

  it("email input alanını gösterir", () => {
    render(<Login />);
    expect(screen.getByPlaceholderText("örnek@email.com")).toBeInTheDocument();
  });

  it("şifre input alanını gösterir", () => {
    render(<Login />);
    expect(screen.getByPlaceholderText("Şifrenizi girin")).toBeInTheDocument();
  });

  it("giriş butonunu gösterir", () => {
    render(<Login />);
    expect(screen.getByRole("button", { name: /Giriş Yap/i })).toBeInTheDocument();
  });

  it("kayıt ol linkini gösterir", () => {
    render(<Login />);
    expect(screen.getByText("Kayıt Ol")).toBeInTheDocument();
  });
});
