import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import App from "../App";
import { createQueryClient } from "../lib/queryClient.js";

// App kendi Router'ını içerdiği için test-utils kullanmıyoruz
function renderApp() {
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    </QueryClientProvider>,
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
