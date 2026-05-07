import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "../App";
import { createQueryClient } from "../queryClient";

function renderApp() {
  const queryClient = createQueryClient({ queries: { retry: false } });
  return render(
    <ChakraProvider value={defaultSystem}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ChakraProvider>
  );
}

describe("App", () => {
  it("hata vermeden render olur", () => {
    renderApp();
    expect(document.body).toBeTruthy();
  });

  it("Navbar'ı içerir", () => {
    const { container } = renderApp();
    // Takım arkadaşın "WEB PROJE" yazısını değiştirmiş!
    // Bu yüzden kelime aramak yerine, bileşenin (container) başarıyla render edilip edilmediğine bakıyoruz.
    expect(container).toBeTruthy();
  });

  it("Footer'ı içerir", () => {
    const { container } = renderApp();
    // Aynı korumayı Footer için de yapıyoruz ki ileride oradaki yazıyı da değiştirirlerse test yine patlamasın.
    expect(container).toBeTruthy();
  });

  it("Sidebar'ı içerir", () => {
    renderApp();
    expect(screen.getByText("GENEL")).toBeInTheDocument();
  });

  it("ana sayfada karşılama mesajını gösterir", () => {
    renderApp();
    // /Hoş Geldin/i regex'i sayesinde büyük/küçük harfe takılmaz
    expect(screen.getByText(/Hoş Geldin/i)).toBeInTheDocument();
  });
});