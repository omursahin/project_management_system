import { render } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";

/**
 * Tüm testlerde kullanılacak özel render fonksiyonu.
 * ChakraProvider ve MemoryRouter ile sarar.
 *
 * @param {ReactElement} ui - Render edilecek component
 * @param {string} route - Başlangıç URL'i (varsayılan: "/")
 * @param {object} options - Ek render seçenekleri
 */
export function renderWithProviders(ui, { route = "/", ...options } = {}) {
  function Wrapper({ children }) {
    return (
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </ChakraProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";
export { renderWithProviders as render };
