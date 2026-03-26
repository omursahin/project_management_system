import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';

test('renders app component without crashing', () => {
  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
  // Temel render testini başarıyla geçmesi için
});
