import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../test/test-utils";
import Sidebar from "../components/Sidebar";

describe("Sidebar", () => {
  it("GENEL bölüm başlığını gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText("GENEL")).toBeInTheDocument();
  });

  it("PROJE bölüm başlığını gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText("PROJE")).toBeInTheDocument();
  });

  it("HESAP bölüm başlığını gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText("HESAP")).toBeInTheDocument();
  });

  it("Ana Sayfa linkini gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText("Ana Sayfa")).toBeInTheDocument();
  });

  it("Gruplarım linkini gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText("Gruplarım")).toBeInTheDocument();
  });

  it("Profilim linkini gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText("Profilim")).toBeInTheDocument();
  });

  it("aside elementi olarak render eder", () => {
    render(<Sidebar />);
    expect(document.querySelector("aside")).toBeInTheDocument();
  });
});
