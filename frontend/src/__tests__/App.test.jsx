import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "../App";
import { createQueryClient } from "../queryClient";

// App kendi Router'ını içerdiği için test-utils kullanmıyoruz
function renderApp() {
  // Login sayfasına yönlendirileceği için token gerekiyor
  localStorage.setItem("tokens", JSON.stringify({ access: "test", refresh: "test" }));
  localStorage.setItem("user", JSON.stringify({ id: 1, first_name: "Test", last_name: "User" }));

  const queryClient = createQueryClient({
    queries: { retry: false },
  });

  return render(
    <ChakraProvider value={defaultSystem}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ChakraProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("App", () => {
  it("hata vermeden render olur", () => {
    renderApp();
    expect(document.body).toBeTruthy();
  });

  it("Navbar'ı içerir", () => {
    renderApp();
    expect(screen.getByText("PROJE YÖNETİM")).toBeInTheDocument();
  });

  it("Footer'ı içerir", () => {
    renderApp();
    expect(screen.getByText(/Web Programlama Dersi/i)).toBeInTheDocument();
  });

  it("Sidebar'ı içerir", () => {
    renderApp();
    expect(screen.getByText("GENEL")).toBeInTheDocument();
  });

  it("giriş yapmadan login sayfasına yönlendirir", () => {
    localStorage.clear();
    const queryClient = createQueryClient({ queries: { retry: false } });

    render(
      <ChakraProvider value={defaultSystem}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ChakraProvider>
    );
    expect(screen.getByRole("heading", { name: /Giriş Yap/i })).toBeInTheDocument();
  });
});
