import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { fetchDepartments, registerUser } from "../services/api.js";

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
  const [errors, setErrors] = useState({});
  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    },
    onError: (error) => {
      if (error.response?.data) {
        setErrors(error.response.data);
        return;
      }

      setErrors({ general: "Bir hata oluştu. Lütfen tekrar deneyin." });
    },
  });
  const departments = departmentsQuery.data ?? [];
  const isLoading = registerMutation.isPending;

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
    await registerMutation.mutateAsync(formData);
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

          {departmentsQuery.isError && (
            <Alert.Root status="warning">
              <Alert.Indicator />
              <Alert.Title>Bölümler yüklenemedi. Daha sonra tekrar deneyin.</Alert.Title>
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
                  type="text"
                  name="first_name"
                  placeholder="Ad"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading || departmentsQuery.isLoading}
                >
                  <Select.Trigger>
                    <Select.ValueText
                      placeholder={
                        departmentsQuery.isLoading
                          ? "Bölümler yükleniyor..."
                          : "Bölüm Seçiniz (Opsiyonel)"
                      }
                    />
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
                {errors.password2 && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.password2}
                  </Text>
                )}
              </Box>

              <Button type="submit" colorScheme="blue" loading={isLoading}>
                Kayıt Ol
              </Button>
            </VStack>
          </form>

          <Text textAlign="center">
            Zaten hesabınız var mı?{" "}
            <Link as={RouterLink} color="blue.500" to="/login">
              Giriş Yap
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}

export default Register;
