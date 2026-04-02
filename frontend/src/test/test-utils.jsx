import { render } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";
import { createQueryClient } from "../lib/queryClient.js";

export function renderWithProviders(ui, { route = "/", ...options } = {}) {
  const queryClient = createQueryClient();

  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={defaultSystem}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </ChakraProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";
export { renderWithProviders as render };
