import { render, screen } from '@testing-library/react';
import App from './App';
import { defaultSystem } from '@chakra-ui/react';
import { ChakraProvider } from '@chakra-ui/react';

test('renders app component without crashing', () => {
  render(
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>
  );
  // Temel render testini başarıyla geçmesi için
});
