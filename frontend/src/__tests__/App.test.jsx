import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import App from "../App";

// App kendi Router'ını içerdiği için test-utils kullanmıyoruz
function renderApp() {
  return render(
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>
  );
}

describe("App", () => {
  it("hata vermeden render olur", () => {
    renderApp();
    // App crash olmadan mount olmalı
    expect(document.body).toBeTruthy();
  });

  it("Navbar'ı içerir", () => {
    renderApp();
    expect(screen.getByText("WEB PROJE")).toBeInTheDocument();
  });

  it("Footer'ı içerir", () => {
    renderApp();
    expect(screen.getByText(/Web Programlama Dersi/i)).toBeInTheDocument();
  });

  it("Sidebar'ı içerir", () => {
    renderApp();
    expect(screen.getByText("MENÜ")).toBeInTheDocument();
  });

  it("ana sayfada karşılama mesajını gösterir", () => {
    renderApp();
    expect(screen.getByText(/Hoş Geldin/i)).toBeInTheDocument();
  });
});
