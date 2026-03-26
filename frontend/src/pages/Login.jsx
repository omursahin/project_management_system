import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
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
import { loginUser } from "../services/api.js";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error });
        return;
      }

      if (error.response?.data) {
        setErrors(error.response.data);
        return;
      }

      setErrors({ general: "Bir hata oluştu. Lütfen tekrar deneyin." });
    },
  });
  const isLoading = loginMutation.isPending;

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setErrors({});
    await loginMutation.mutateAsync(formData);
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
        borderRadius="lg"
        boxShadow="lg"
        w={{ base: "90%", md: "400px" }}
      >
        <VStack gap={4} align="stretch">
          <Heading size="lg" textAlign="center">
            Giriş Yap
          </Heading>

          {errors.general && (
            <Alert.Root status="error">
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

              <Button type="submit" colorScheme="blue" loading={isLoading}>
                Giriş Yap
              </Button>
            </VStack>
          </form>

          <Text textAlign="center">
            Hesabınız yok mu?{" "}
            <Link as={RouterLink} color="blue.500" to="/register">
              Kayıt Ol
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}

export default Login;
