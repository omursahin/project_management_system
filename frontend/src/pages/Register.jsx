import { useState, useEffect } from "react";
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
  Select,
} from "@chakra-ui/react";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    identification_number: "",
    phone_number: "",
    address: "",
    department: "",
    password: "",
    password2: "",
  });
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch departments
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/department/");
        setDepartments(response.data);
      } catch (error) {
        console.error("Bölümler yüklenirken hata oluştu:", error);
      }
    };
    fetchDepartments();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email zorunludur";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Geçerli bir email giriniz";
    }

    if (!formData.first_name) {
      newErrors.first_name = "Ad zorunludur";
    }

    if (!formData.last_name) {
      newErrors.last_name = "Soyad zorunludur";
    }

    if (!formData.identification_number) {
      newErrors.identification_number = "Kimlik numarası zorunludur";
    } else if (!/^\d{11}$/.test(formData.identification_number)) {
      newErrors.identification_number = "Kimlik numarası 11 haneli sayı olmalıdır";
    }

    if (!formData.phone_number) {
      newErrors.phone_number = "Telefon numarası zorunludur";
    }

    if (!formData.address) {
      newErrors.address = "Adres zorunludur";
    }

    if (!formData.password) {
      newErrors.password = "Şifre zorunludur";
    } else if (formData.password.length < 8) {
      newErrors.password = "Şifre en az 8 karakter olmalıdır";
    }

    if (!formData.password2) {
      newErrors.password2 = "Şifre tekrarı zorunludur";
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = "Şifreler eşleşmiyor";
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
    // Clear error when user starts typing
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
      const response = await api.post("/account/register/", formData);

      // Store token in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
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
      py={8}
    >
      <Box
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        w={{ base: "90%", md: "500px" }}
      >
        <VStack gap={4} align="stretch">
          <Heading size="lg" textAlign="center">
            Kayıt Ol
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
                  type="text"
                  name="first_name"
                  placeholder="Ad"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.first_name && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.first_name}
                  </Text>
                )}
              </Box>

              <Box>
                <Input
                  type="text"
                  name="last_name"
                  placeholder="Soyad"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.last_name && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.last_name}
                  </Text>
                )}
              </Box>

              <Box>
                <Input
                  type="text"
                  name="identification_number"
                  placeholder="Kimlik Numarası (11 haneli)"
                  value={formData.identification_number}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={11}
                />
                {errors.identification_number && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.identification_number}
                  </Text>
                )}
              </Box>

              <Box>
                <Input
                  type="tel"
                  name="phone_number"
                  placeholder="Telefon Numarası"
                  value={formData.phone_number}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.phone_number && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.phone_number}
                  </Text>
                )}
              </Box>

              <Box>
                <Input
                  type="text"
                  name="address"
                  placeholder="Adres"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.address && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.address}
                  </Text>
                )}
              </Box>

              <Box>
                <Select.Root
                  collection={departments}
                  name="department"
                  value={[formData.department]}
                  onValueChange={(e) =>
                    handleChange({
                      target: { name: "department", value: e.value[0] },
                    })
                  }
                  disabled={loading}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="Bölüm Seçiniz (Opsiyonel)" />
                  </Select.Trigger>
                  <Select.Content>
                    {departments.map((dept) => (
                      <Select.Item key={dept.id} item={dept.id}>
                        {dept.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                {errors.department && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.department}
                  </Text>
                )}
              </Box>

              <Box>
                <Input
                  type="password"
                  name="password"
                  placeholder="Şifre (en az 8 karakter)"
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

              <Box>
                <Input
                  type="password"
                  name="password2"
                  placeholder="Şifre Tekrarı"
                  value={formData.password2}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.password2 && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.password2}
                  </Text>
                )}
              </Box>

              <Button type="submit" colorScheme="blue" loading={loading}>
                Kayıt Ol
              </Button>
            </VStack>
          </form>

          <Text textAlign="center">
            Zaten hesabınız var mı?{" "}
            <Link color="blue.500" href="/login">
              Giriş Yap
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}

export default Register;
