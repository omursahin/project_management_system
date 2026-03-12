import { useState } from "react";
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
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post("/account/login/", formData);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard");
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.data.error) {
          setErrors({ general: error.response.data.error });
        } else {
          setErrors(error.response.data);
        }
      } else {
        setErrors({ general: "Bir hata oluştu. Lütfen tekrar deneyin." });
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
                  disabled={loading}
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
                  disabled={loading}
                />
                {errors.password && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.password}
                  </Text>
                )}
              </Box>

              <Button type="submit" colorScheme="blue" loading={loading}>
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
