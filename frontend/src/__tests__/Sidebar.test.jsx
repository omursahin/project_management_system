import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../../../../../Downloads/frontend-vitest-dosyalari/src/test/test-utils.jsx";
import Sidebar from "../components/Sidebar";

describe("Sidebar", () => {
  it("MENÜ başlığını gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText("MENÜ")).toBeInTheDocument();
  });

  it("Profilim linkini gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText("Profilim")).toBeInTheDocument();
  });

  it("Ayarlar linkini gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText("Ayarlar")).toBeInTheDocument();
  });

  it("Mesajlar linkini gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText("Mesajlar")).toBeInTheDocument();
  });

  it("aside elementi olarak render eder", () => {
    render(<Sidebar />);
    expect(document.querySelector("aside")).toBeInTheDocument();
  });
});
