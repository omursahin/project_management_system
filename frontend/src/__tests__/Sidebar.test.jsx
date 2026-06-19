import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../test/test-utils";
import Sidebar from "../components/sidebar/UserSidebar.jsx";

describe("Sidebar", () => {
  it("GENEL bölüm başlığını gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText("GENEL")).toBeInTheDocument();
  });

  it("HESAP bölüm başlığını gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText("HESAP")).toBeInTheDocument();
  });

  it("Ana Sayfa linkini gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText("Ana Sayfa")).toBeInTheDocument();
  });

  it("Derslerim linkini gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText("Derslerim")).toBeInTheDocument();
  });

  it("Profilim linkini gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText("Profilim")).toBeInTheDocument();
  });

  it("Ayarlar linkini gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText("Ayarlar")).toBeInTheDocument();
  });

  it("Gruplarim linkini kaldirildi - artik sidebarda gosterilmemeli", () => {
    render(<Sidebar />);
    expect(screen.queryByText("Gruplarım")).not.toBeInTheDocument();
  });

  it("aside elementi olarak render eder", () => {
    render(<Sidebar />);
    expect(document.querySelector("aside")).toBeInTheDocument();
  });
});
