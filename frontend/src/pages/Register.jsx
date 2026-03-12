import { useState } from "react";
import { Box, Button, Input, Text, VStack, Heading, Link, SimpleGrid } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  // Form verileri
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    identification_number: "",
    phone_number: "",
    address: "",
    password: "",
    password2: "",
  });

  // Hata mesajları
  const [errors, setErrors] = useState({});

  // Genel hata (API'den dönen)
  const [apiError, setApiError] = useState("");

  // Başarı mesajı
  const [success, setSuccess] = useState(false);

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

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email zorunludur.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Geçerli bir email giriniz.";
    }

    // Ad
    if (!formData.first_name.trim()) {
      newErrors.first_name = "Ad zorunludur.";
    }

    // Soyad
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Soyad zorunludur.";
    }

    // Kimlik No
    if (!formData.identification_number.trim()) {
      newErrors.identification_number = "Kimlik numarası zorunludur.";
    } else if (!/^\d{11}$/.test(formData.identification_number)) {
      newErrors.identification_number = "Kimlik numarası 11 haneli sayı olmalı.";
    }

    // Telefon
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Telefon numarası zorunludur.";
    }

    // Adres
    if (!formData.address.trim()) {
      newErrors.address = "Adres zorunludur.";
    }

    // Şifre
    if (!formData.password) {
      newErrors.password = "Şifre zorunludur.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Şifre en az 8 karakter olmalı.";
    }

    // Şifre Tekrar
    if (!formData.password2) {
      newErrors.password2 = "Şifre tekrarı zorunludur.";
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = "Şifreler eşleşmiyor.";
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
      const response = await api.post("/api/account/register/", formData);

      // Token'ı localStorage'a kaydet
      if (response.data.token) {
        localStorage.setItem("access_token", response.data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      }

      setSuccess(true);

      // 2 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      if (error.response?.data) {
        const data = error.response.data;

        // Alan bazlı hatalar
        if (typeof data === "object") {
          const fieldErrors = {};
          Object.keys(data).forEach((key) => {
            if (Array.isArray(data[key])) {
              fieldErrors[key] = data[key].join(" ");
            } else if (typeof data[key] === "string") {
              fieldErrors[key] = data[key];
            }
          });

          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
          } else {
            setApiError("Kayıt sırasında bir hata oluştu.");
          }
        } else {
          setApiError(String(data));
        }
      } else {
        setApiError("Sunucuya bağlanılamadı. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Form alanı componenti (tekrarı azaltmak için)
  const FormField = ({ label, name, type = "text", placeholder }) => (
    <Box w="100%">
      <Text mb={1} fontSize="sm" fontWeight="medium" color="gray.600">
        {label}
      </Text>
      <Input
        name={name}
        type={type}
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        borderColor={errors[name] ? "red.400" : "gray.200"}
        focusBorderColor="teal.400"
      />
      {errors[name] && (
        <Text color="red.500" fontSize="xs" mt={1}>
          {errors[name]}
        </Text>
      )}
    </Box>
  );

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      py={10}
    >
      <Box
        bg="white"
        p={8}
        rounded="lg"
        boxShadow="lg"
        w={{ base: "90%", sm: "500px" }}
      >
        <VStack spacing={5} as="form" onSubmit={handleSubmit}>
          {/* Başlık */}
          <Heading size="lg" color="teal.500">
            Kayıt Ol
          </Heading>

          {/* Başarı Mesajı */}
          {success && (
            <Box w="100%" p={3} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
              <Text color="green.600" fontSize="sm" textAlign="center">
                Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...
              </Text>
            </Box>
          )}

          {/* API Hata Mesajı */}
          {apiError && (
            <Box w="100%" p={3} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
              <Text color="red.600" fontSize="sm" textAlign="center">
                {apiError}
              </Text>
            </Box>
          )}

          {/* Ad - Soyad yan yana */}
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="100%">
            <FormField label="Ad" name="first_name" placeholder="Adınız" />
            <FormField label="Soyad" name="last_name" placeholder="Soyadınız" />
          </SimpleGrid>

          {/* Email */}
          <FormField label="Email" name="email" type="email" placeholder="ornek@email.com" />

          {/* Kimlik No - Telefon yan yana */}
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="100%">
            <FormField label="Kimlik Numarası" name="identification_number" placeholder="11 haneli TC No" />
            <FormField label="Telefon" name="phone_number" placeholder="05xx xxx xx xx" />
          </SimpleGrid>

          {/* Adres */}
          <FormField label="Adres" name="address" placeholder="Adresiniz" />

          {/* Şifre - Şifre Tekrar yan yana */}
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="100%">
            <FormField label="Şifre" name="password" type="password" placeholder="En az 8 karakter" />
            <FormField label="Şifre Tekrar" name="password2" type="password" placeholder="Şifrenizi tekrar giriniz" />
          </SimpleGrid>

          {/* Kayıt Butonu */}
          <Button
            type="submit"
            colorScheme="teal"
            w="100%"
            isLoading={loading}
            loadingText="Kayıt yapılıyor..."
            isDisabled={success}
          >
            Kayıt Ol
          </Button>

          {/* Giriş Linki */}
          <Text fontSize="sm" color="gray.500">
            Zaten hesabın var mı?{" "}
            <Link color="teal.500" fontWeight="bold" href="/login">
              Giriş Yap
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default Register;