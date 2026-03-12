import { useState } from "react";
import { Box, Button, Input, Text, VStack, Heading, Link } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  // Form verileri
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Hata mesajları
  const [errors, setErrors] = useState({});

  // Genel hata (API'den dönen)
  const [apiError, setApiError] = useState("");

  // Yükleniyor durumu
  const [loading, setLoading] = useState(false);

  // Input değişikliği
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // O alan için hatayı temizle
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    setApiError("");
  };

  // Client-side validasyon
  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email alanı zorunludur.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Geçerli bir email adresi giriniz.";
    }

    if (!formData.password) {
      newErrors.password = "Şifre alanı zorunludur.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setApiError("");

    try {
      const response = await api.post("/api/v1/token/", {
        email: formData.email,
        password: formData.password,
      });

      // Token'ları localStorage'a kaydet
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      // axios header'ına token ekle
      api.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;

      // Dashboard'a yönlendir
      navigate("/dashboard");
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setApiError("Email veya şifre hatalı.");
        } else if (error.response.data?.detail) {
          setApiError(error.response.data.detail);
        } else {
          setApiError("Giriş yapılırken bir hata oluştu.");
        }
      } else {
        setApiError("Sunucuya bağlanılamadı. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

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
        rounded="lg"
        boxShadow="lg"
        w={{ base: "90%", sm: "400px" }}
      >
        <VStack spacing={6} as="form" onSubmit={handleSubmit}>
          {/* Başlık */}
          <Heading size="lg" color="teal.500">
            Giriş Yap
          </Heading>

          {/* API Hata Mesajı */}
          {apiError && (
            <Box w="100%" p={3} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
              <Text color="red.600" fontSize="sm" textAlign="center">
                {apiError}
              </Text>
            </Box>
          )}

          {/* Email */}
          <Box w="100%">
            <Text mb={1} fontSize="sm" fontWeight="medium" color="gray.600">
              Email
            </Text>
            <Input
              name="email"
              type="email"
              placeholder="ornek@email.com"
              value={formData.email}
              onChange={handleChange}
              borderColor={errors.email ? "red.400" : "gray.200"}
              focusBorderColor="teal.400"
            />
            {errors.email && (
              <Text color="red.500" fontSize="xs" mt={1}>
                {errors.email}
              </Text>
            )}
          </Box>

          {/* Şifre */}
          <Box w="100%">
            <Text mb={1} fontSize="sm" fontWeight="medium" color="gray.600">
              Şifre
            </Text>
            <Input
              name="password"
              type="password"
              placeholder="Şifrenizi giriniz"
              value={formData.password}
              onChange={handleChange}
              borderColor={errors.password ? "red.400" : "gray.200"}
              focusBorderColor="teal.400"
            />
            {errors.password && (
              <Text color="red.500" fontSize="xs" mt={1}>
                {errors.password}
              </Text>
            )}
          </Box>

          {/* Giriş Butonu */}
          <Button
            type="submit"
            colorScheme="teal"
            w="100%"
            isLoading={loading}
            loadingText="Giriş yapılıyor..."
          >
            Giriş Yap
          </Button>

          {/* Kayıt Linki */}
          <Text fontSize="sm" color="gray.500">
            Hesabın yok mu?{" "}
            <Link color="teal.500" fontWeight="bold" href="/register">
              Kayıt Ol
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default Login;