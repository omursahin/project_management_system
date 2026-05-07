import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Box, Button, VStack, Text, Link, Alert } from "@chakra-ui/react";
import { authApi, saveAuth } from "../services/auth.js";
import AuthLayout from "../components/ui/AuthLayout.jsx";
import FormField from "../components/ui/FormField.jsx";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const loginMutation = useMutation({
    mutationFn: (payload) => authApi.login(payload),
    onSuccess: (data) => {
      saveAuth(data);
      navigate("/");
    },
    onError: (error) => {
      const resp = error.response?.data;
      if (!resp) {
        setErrors({ general: "Sunucuya bağlanılamadı. Lütfen tekrar deneyin." });
        return;
      }
      if (resp.non_field_errors) {
        setErrors({ general: resp.non_field_errors.join(" ") });
      } else if (resp.detail) {
        setErrors({ general: resp.detail });
      } else {
        setErrors(resp);
      }
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setErrors({});
    loginMutation.mutate(formData);
  };

  const isLoading = loginMutation.isPending;

  return (
    <AuthLayout title="Giriş Yap" subtitle="Hesabınıza giriş yaparak devam edin">
      {errors.general && (
        <Alert.Root status="error" mb={4} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title fontSize="sm">{errors.general}</Alert.Title>
        </Alert.Root>
      )}

      <form onSubmit={handleSubmit}>
        <VStack gap={4} align="stretch">
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="örnek@email.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            error={errors.email}
          />

          <FormField
            label="Şifre"
            name="password"
            type="password"
            placeholder="Şifrenizi girin"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            error={errors.password}
          />

          <Button
            type="submit"
            bg="teal.500"
            color="white"
            _hover={{ bg: "teal.600" }}
            size="lg"
            loading={isLoading}
            mt={2}
            borderRadius="lg"
          >
            Giriş Yap
          </Button>
        </VStack>
      </form>

      <Box mt={6} textAlign="center">
        <Text fontSize="sm" color="gray.500">
          Hesabınız yok mu?{" "}
          <Link color="teal.600" fontWeight="semibold" href="/register">
            Kayıt Ol
          </Link>
        </Text>
      </Box>
    </AuthLayout>
  );
}

export default Login;
