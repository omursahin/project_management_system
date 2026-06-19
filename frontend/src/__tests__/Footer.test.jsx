import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../test/test-utils";
import Footer from "../components/Footer";

describe("Footer", () => {
  it("telif hakkı metnini gösterir", () => {
    render(<Footer />);
    expect(screen.getByText(/Web Programlama Dersi/i)).toBeInTheDocument();
  });

  it("güncel yılı gösterir", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });

  it("Proje Yönetim Sistemi ifadesini içerir", () => {
    render(<Footer />);
    expect(screen.getByText(/Proje Yönetim Sistemi/i)).toBeInTheDocument();
  });

  it("footer elementi olarak render eder", () => {
    render(<Footer />);
    expect(document.querySelector("footer")).toBeInTheDocument();
  });
});
