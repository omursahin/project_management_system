import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../test/test-utils";
import Navbar from "../components/Navbar";

vi.mock("../services/api.js", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("Navbar", () => {
  it("proje başlığını gösterir", () => {
    render(<Navbar />);
    expect(screen.getByText("PROJE YÖNETİM")).toBeInTheDocument();
  });

  it("Ana Sayfa linkini gösterir", () => {
    render(<Navbar />);
    expect(screen.getByText("Ana Sayfa")).toBeInTheDocument();
  });

  it("Panel linkini gösterir", () => {
    localStorage.setItem("user", JSON.stringify({
      id: 1, first_name: "Admin", last_name: "User",
      is_staff: true, is_superuser: true,
    }));
    render(<Navbar />);
    expect(screen.getByText("Admin Paneli")).toBeInTheDocument();
    localStorage.clear();
  });

  it("Çıkış butonunu gösterir", () => {
    render(<Navbar />);
    expect(screen.getByText("Çıkış")).toBeInTheDocument();
  });

  it("nav elementi olarak render eder", () => {
    render(<Navbar />);
    expect(document.querySelector("nav")).toBeInTheDocument();
  });
});
