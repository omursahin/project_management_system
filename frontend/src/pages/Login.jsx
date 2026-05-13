import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  Alert,
} from "@chakra-ui/react";
import api from "../services/api.js";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const loginMutation = useMutation({
    mutationFn: async (payload) => {
      // Backend'in gerçek giriş kapısına yönlendiriyoruz
      const response = await api.post("/api/v1/token/", payload);
      return response.data;
    },
    onSuccess: (data) => {
      // Hem 'access' hem 'token' ihtimalini garantiye alıyoruz
      const accessToken = data.access || data.token; 
      
      if (accessToken) {
        // api.js dosyasındaki interceptor'ın beklediği isim: "token"
        localStorage.setItem("token", accessToken);
        
        // Kullanıcı verisini güvenli bir şekilde kaydediyoruz
        localStorage.setItem("user", JSON.stringify(data.user || data));
        
        // Başarılı girişten sonra dashboard'a uçuyoruz
        navigate("/dashboard");
      } else {
        console.error("Token alınamadı, dönen veri yapısı hatalı:", data);
        setErrors({ general: "Sunucudan geçerli bir anahtar alınamadı." });
      }
    },
    onError: (error) => {
      if (error.response && error.response.data) {
        // Django'dan gelen 'detail' veya 'error' mesajlarını yakalıyoruz
        const serverError = error.response.data.detail || error.response.data.error;
        if (serverError) {
          setErrors({ general: serverError });
          return;
        }
        setErrors(error.response.data);
        return;
      }
      setErrors({ general: "Giriş yapılamadı. Lütfen internet bağlantınızı ve bilgilerinizi kontrol edin." });
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email zorunludur";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Geçerli bir email giriniz";
    }

    if (!formData.password) {
      newErrors.password = "Şifre zorunludur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setErrors({});
    loginMutation.mutate(formData);
  };

  const isLoading = loginMutation.isPending;

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <Box
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        w={{ base: "90%", md: "400px" }}
      >
        <VStack gap={4} align="stretch">
          <Heading size="lg" textAlign="center">
            Giriş Yap
          </Heading>

          {errors.general && (
            <Alert.Root status="error" variant="filled" borderRadius="md">
              <Alert.Indicator />
              <Alert.Title>{errors.general}</Alert.Title>
            </Alert.Root>
          )}

          <form onSubmit={handleSubmit}>
            <VStack gap={4} align="stretch">
              <Box>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.email && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.email}
                  </Text>
                )}
              </Box>

              <Box>
                <Input
                  type="password"
                  name="password"
                  placeholder="Şifre"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.password && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.password}
                  </Text>
                )}
              </Box>

              <Button 
                type="submit" 
                colorScheme="blue" 
                width="full"
                isLoading={isLoading}
                loadingText="Giriş Yapılıyor..."
              >
                Giriş Yap
              </Button>
            </VStack>
          </form>

          <Text textAlign="center">
            Hesabınız yok mu?{" "}
            <Link color="blue.500" href="/register">
              Kayıt Ol
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}

export default Login;