import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  VStack,
  Text,
  Link,
  Alert,
  Select,
  createListCollection,
  Flex,
} from "@chakra-ui/react";
import { authApi, saveAuth } from "../services/auth.js";
import { departments as departmentsResource } from "../services/resources.js";
import AuthLayout from "../components/ui/AuthLayout.jsx";
import FormField from "../components/ui/FormField.jsx";

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

  const {
    data: departments = [],
    error: departmentsError,
    isLoading: isDepartmentsLoading,
  } = departmentsResource.useList();

  const registerMutation = useMutation({
    mutationFn: (payload) => authApi.register(payload),
    onSuccess: () => {
      authApi
        .login({ email: formData.email, password: formData.password })
        .then((loginData) => {
          saveAuth(loginData);
          navigate("/");
        })
        .catch(() => {
          navigate("/login");
        });
    },
    onError: (error) => {
      const resp = error.response?.data;
      if (!resp) {
        setErrors({ general: "Bir hata oluştu. Lütfen tekrar deneyin." });
        return;
      }
      if (resp.non_field_errors) {
        setErrors({ general: resp.non_field_errors.join(" ") });
      } else {
        setErrors(resp);
      }
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = "Email zorunludur";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Geçerli bir email giriniz";

    if (!formData.first_name) newErrors.first_name = "Ad zorunludur";
    if (!formData.last_name) newErrors.last_name = "Soyad zorunludur";

    if (!formData.identification_number) newErrors.identification_number = "Kimlik numarası zorunludur";
    else if (!/^\d{11}$/.test(formData.identification_number))
      newErrors.identification_number = "Kimlik numarası 11 haneli sayı olmalıdır";

    if (!formData.phone_number) newErrors.phone_number = "Telefon numarası zorunludur";
    if (!formData.address) newErrors.address = "Adres zorunludur";

    if (!formData.password) newErrors.password = "Şifre zorunludur";
    else if (formData.password.length < 8) newErrors.password = "Şifre en az 8 karakter olmalıdır";

    if (!formData.password2) newErrors.password2 = "Şifre tekrarı zorunludur";
    else if (formData.password !== formData.password2) newErrors.password2 = "Şifreler eşleşmiyor";

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
    registerMutation.mutate(formData);
  };

  const isSubmitting = registerMutation.isPending;
  const departmentCollection = createListCollection({
    items: departments,
    itemToString: (item) => item.name,
    itemToValue: (item) => String(item.id),
  });

  return (
    <AuthLayout title="Kayıt Ol" subtitle="Yeni bir hesap oluşturun">
      {errors.general && (
        <Alert.Root status="error" mb={4} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title fontSize="sm">{errors.general}</Alert.Title>
        </Alert.Root>
      )}

      <form onSubmit={handleSubmit}>
        <VStack gap={3} align="stretch">
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="örnek@email.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            error={errors.email}
          />

          <Flex gap={3} direction={{ base: "column", sm: "row" }}>
            <Box flex="1">
              <FormField
                label="Ad"
                name="first_name"
                placeholder="Adınız"
                value={formData.first_name}
                onChange={handleChange}
                disabled={isSubmitting}
                error={errors.first_name}
              />
            </Box>
            <Box flex="1">
              <FormField
                label="Soyad"
                name="last_name"
                placeholder="Soyadınız"
                value={formData.last_name}
                onChange={handleChange}
                disabled={isSubmitting}
                error={errors.last_name}
              />
            </Box>
          </Flex>

          <FormField
            label="Kimlik Numarası"
            name="identification_number"
            placeholder="11 haneli kimlik numarası"
            value={formData.identification_number}
            onChange={handleChange}
            disabled={isSubmitting}
            error={errors.identification_number}
            maxLength={11}
          />

          <Flex gap={3} direction={{ base: "column", sm: "row" }}>
            <Box flex="1">
              <FormField
                label="Telefon"
                name="phone_number"
                type="tel"
                placeholder="05XX XXX XX XX"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={isSubmitting}
                error={errors.phone_number}
              />
            </Box>
            <Box flex="1">
              <FormField
                label="Adres"
                name="address"
                placeholder="Adresiniz"
                value={formData.address}
                onChange={handleChange}
                disabled={isSubmitting}
                error={errors.address}
              />
            </Box>
          </Flex>

          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
              Bölüm (Opsiyonel)
            </Text>
            <Select.Root
              collection={departmentCollection}
              name="department"
              value={[formData.department]}
              onValueChange={(e) =>
                handleChange({
                  target: { name: "department", value: e.value[0] ?? "" },
                })
              }
              disabled={isSubmitting || isDepartmentsLoading}
            >
              <Select.Trigger>
                <Select.ValueText
                  placeholder={
                    isDepartmentsLoading ? "Bölümler yükleniyor..." : "Bölüm Seçiniz"
                  }
                />
              </Select.Trigger>
              <Select.Content>
                {departments.map((dept) => (
                  <Select.Item key={dept.id} item={dept}>
                    {dept.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            {departmentsError && (
              <Text color="red.500" fontSize="xs" mt={1}>
                Bölümler yüklenemedi.
              </Text>
            )}
          </Box>

          <Flex gap={3} direction={{ base: "column", sm: "row" }}>
            <Box flex="1">
              <FormField
                label="Şifre"
                name="password"
                type="password"
                placeholder="En az 8 karakter"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                error={errors.password}
              />
            </Box>
            <Box flex="1">
              <FormField
                label="Şifre Tekrarı"
                name="password2"
                type="password"
                placeholder="Şifrenizi tekrar girin"
                value={formData.password2}
                onChange={handleChange}
                disabled={isSubmitting}
                error={errors.password2}
              />
            </Box>
          </Flex>

          <Button
            type="submit"
            bg="teal.500"
            color="white"
            _hover={{ bg: "teal.600" }}
            size="lg"
            loading={isSubmitting}
            mt={2}
            borderRadius="lg"
          >
            Kayıt Ol
          </Button>
        </VStack>
      </form>

      <Box mt={6} textAlign="center">
        <Text fontSize="sm" color="gray.500">
          Zaten hesabınız var mı?{" "}
          <Link color="teal.600" fontWeight="semibold" href="/login">
            Giriş Yap
          </Link>
        </Text>
      </Box>
    </AuthLayout>
  );
}

export default Register;
