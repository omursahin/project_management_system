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
import { useDepartmentsQuery } from "../hooks/useDepartments.js";
import { useRegisterMutation } from "../hooks/useAuth.js";
import { getApiErrorData } from "../services/api.js";

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
  const registerMutation = useRegisterMutation({
    onSuccess: () => {
      navigate("/dashboard");
    },
  });
  const {
    data: departments = [],
    isLoading: isDepartmentsLoading,
    isError: hasDepartmentsError,
  } = useDepartmentsQuery({
    retry: 0,
  });

  const loading = registerMutation.isPending;

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

    registerMutation.mutate(formData, {
      onError: (error) => {
        const apiErrors = getApiErrorData(error);

        if (apiErrors) {
          setErrors(apiErrors);
          return;
        }

        setErrors({ general: "Bir hata oluştu. Lütfen tekrar deneyin." });
      },
    });
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
                <Box
                  as="select"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={loading || isDepartmentsLoading}
                  w="100%"
                  px={4}
                  py={2}
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  bg="white"
                >
                  <option value="">Bölüm Seçiniz (Opsiyonel)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </Box>
                {isDepartmentsLoading && (
                  <Text color="gray.500" fontSize="sm" mt={1}>
                    Bölümler yükleniyor...
                  </Text>
                )}
                {hasDepartmentsError && (
                  <Text color="orange.500" fontSize="sm" mt={1}>
                    Bölümler şu anda yüklenemedi. Kayıt yine de devam edebilir.
                  </Text>
                )}
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
