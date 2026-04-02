import { render } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import App from "./App";
import { createQueryClient } from "./lib/queryClient.js";

test("renders app component without crashing", () => {
  const queryClient = createQueryClient();

  render(
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    </QueryClientProvider>,
  );
});
