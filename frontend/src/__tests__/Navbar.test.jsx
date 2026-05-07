import { describe, it, expect, vi } from "vitest";
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
    render(<Navbar />);
    expect(screen.getByText("Panel")).toBeInTheDocument();
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
