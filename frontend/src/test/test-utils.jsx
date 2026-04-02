import { render } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { createQueryClient } from "../queryClient";

export function renderWithProviders(ui, { route = "/", ...options } = {}) {
  const queryClient = createQueryClient({
    queries: {
      retry: false,
    },
  });

  function Wrapper({ children }) {
    return (
      <ChakraProvider value={defaultSystem}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </QueryClientProvider>
      </ChakraProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";
export { renderWithProviders as render };
