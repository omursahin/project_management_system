import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from "@tanstack/react-query";
import App from './App.jsx'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { queryClient } from "./lib/queryClient.js";
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider value={defaultSystem}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ChakraProvider>
  </React.StrictMode>,
)
