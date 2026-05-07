import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Select,
  Separator,
  Text,
  VStack,
  createListCollection,
} from "@chakra-ui/react";
import { FiMail, FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import api from "../services/api.js";
import {
  isAuthenticated,
  updateStoredUser,
  useAuthUser,
} from "../services/auth.js";
import { profileApi } from "../services/profile.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import FormField from "../components/ui/FormField.jsx";

const emptyProfileForm = {
  email: "",
  first_name: "",
  last_name: "",
  identification_number: "",
  phone_number: "",
  address: "",
  department: "",
};

const emptyPasswordForm = {
  current_password: "",
  new_password: "",
  new_password2: "",
};

function getProfileSource(profile, storedUser) {
  return profile || storedUser || null;
}

function mapProfileToForm(profile) {
  return {
    email: profile?.email ?? "",
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    identification_number: profile?.identification_number ?? "",
    phone_number: profile?.phone_number ?? "",
    address: profile?.address ?? "",
    department:
      profile?.department == null || profile?.department === ""
        ? ""
        : String(profile.department),
  };
}

function getInitials(user) {
  const first = user?.first_name?.[0] || "";
  const last = user?.last_name?.[0] || "";
  return `${first}${last}`.toUpperCase() || "?";
}

function getErrorText(error, fallbackMessage, unavailableMessage) {
  const data = error?.response?.data;
  const status = error?.response?.status;

  if ((status === 404 || status === 405) && unavailableMessage) {
    return unavailableMessage;
  }

  if (!data) {
    return fallbackMessage;
  }

  if (typeof data === "string") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.join(" ");
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.non_field_errors) {
    return Array.isArray(data.non_field_errors)
      ? data.non_field_errors.join(" ")
      : data.non_field_errors;
  }

  const firstValue = Object.values(data)[0];
  if (Array.isArray(firstValue)) {
    return firstValue.join(" ");
  }

  return fallbackMessage;
}

function ProfileNotice({ notice }) {
  if (!notice?.message) {
    return null;
  }

  return (
    <Alert.Root status={notice.status} mb={4} borderRadius="lg">
      <Alert.Indicator />
      <Alert.Title fontSize="sm">{notice.message}</Alert.Title>
    </Alert.Root>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <Flex align="center" gap={3} py={3}>
      <Flex
        align="center"
        justify="center"
        boxSize="10"
        borderRadius="lg"
        bg="gray.50"
        color="teal.600"
        flexShrink={0}
      >
        {icon}
      </Flex>
      <Box minW="0">
        <Text fontSize="xs" color="gray.400" fontWeight="bold" letterSpacing="wider">
          {label}
        </Text>
        <Text fontSize="sm" color="gray.700" mt={0.5} wordBreak="break-word">
          {value || "-"}
        </Text>
      </Box>
    </Flex>
  );
}

export default function Profile() {
  const queryClient = useQueryClient();
  const storedUser = useAuthUser();
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileNotice, setProfileNotice] = useState(null);
  const [passwordNotice, setPasswordNotice] = useState(null);

  const {
    data: departments = [],
    error: departmentsError,
    isLoading: isDepartmentsLoading,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await api.get("/api/department/");
      return response.data;
    },
  });

  const {
    data: profile,
    error: profileLoadError,
    isLoading: isProfileLoading,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.getProfile,
    enabled: isAuthenticated(),
    retry: false,
  });

  const profileSource = getProfileSource(profile, storedUser);
  const selectedDepartmentName = useMemo(() => {
    if (profileSource?.department_name) {
      return profileSource.department_name;
    }

    if (profileSource?.department == null || profileSource.department === "") {
      return "";
    }

    return (
      departments.find((department) => String(department.id) === String(profileSource.department))
        ?.name ?? ""
    );
  }, [departments, profileSource]);

  useEffect(() => {
    if (!profileSource) {
      return;
    }

    setProfileForm(mapProfileToForm(profileSource));
  }, [profileSource]);

  useEffect(() => {
    if (profile) {
      updateStoredUser({ ...(storedUser || {}), ...profile });
    }
  }, [profile, storedUser]);

  const departmentCollection = useMemo(
    () =>
      createListCollection({
        items: departments,
        itemToString: (item) => item.name,
        itemToValue: (item) => String(item.id),
      }),
    [departments]
  );

  const profileMutation = useMutation({
    mutationFn: (payload) => profileApi.updateProfile(payload),
    onSuccess: (data) => {
      const nextUser = { ...(storedUser || {}), ...data };
      updateStoredUser(nextUser);
      queryClient.setQueryData(["profile"], nextUser);
      setProfileForm(mapProfileToForm(nextUser));
      setProfileNotice({ status: "success", message: "Profil bilgileri güncellendi." });
      setProfileErrors({});
    },
    onError: (error) => {
      const responseData = error.response?.data;
      setProfileErrors(
        responseData && typeof responseData === "object" && !Array.isArray(responseData)
          ? responseData
          : {}
      );
      setProfileNotice({
        status: "error",
        message: getErrorText(
          error,
          "Profil bilgileri güncellenemedi.",
          "Profil API'si henüz güncelleme için erişilebilir değil."
        ),
      });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (payload) => profileApi.changePassword(payload),
    onSuccess: () => {
      setPasswordForm(emptyPasswordForm);
      setPasswordErrors({});
      setPasswordNotice({ status: "success", message: "Şifreniz başarıyla güncellendi." });
    },
    onError: (error) => {
      const responseData = error.response?.data;
      setPasswordErrors(
        responseData && typeof responseData === "object" && !Array.isArray(responseData)
          ? responseData
          : {}
      );
      setPasswordNotice({
        status: "error",
        message: getErrorText(
          error,
          "Şifre değişikliği kaydedilemedi.",
          "Şifre değiştirme API'si henüz erişilebilir değil."
        ),
      });
    },
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (profileNotice) {
      setProfileNotice(null);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (passwordNotice) {
      setPasswordNotice(null);
    }
  };

  const validateProfileForm = () => {
    const nextErrors = {};

    if (!profileForm.email) {
      nextErrors.email = "Email zorunludur";
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      nextErrors.email = "Geçerli bir email giriniz";
    }

    if (!profileForm.first_name) {
      nextErrors.first_name = "Ad zorunludur";
    }

    if (!profileForm.last_name) {
      nextErrors.last_name = "Soyad zorunludur";
    }

    if (!profileForm.identification_number) {
      nextErrors.identification_number = "Kimlik numarası zorunludur";
    } else if (!/^\d{11}$/.test(profileForm.identification_number)) {
      nextErrors.identification_number = "Kimlik numarası 11 haneli sayı olmalı";
    }

    if (!profileForm.phone_number) {
      nextErrors.phone_number = "Telefon numarası zorunludur";
    }

    if (!profileForm.address) {
      nextErrors.address = "Adres zorunludur";
    }

    setProfileErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const nextErrors = {};

    if (!passwordForm.current_password) {
      nextErrors.current_password = "Mevcut şifre zorunludur";
    }

    if (!passwordForm.new_password) {
      nextErrors.new_password = "Yeni şifre zorunludur";
    } else if (passwordForm.new_password.length < 8) {
      nextErrors.new_password = "Yeni şifre en az 8 karakter olmalı";
    }

    if (!passwordForm.new_password2) {
      nextErrors.new_password2 = "Yeni şifre tekrarı zorunludur";
    } else if (passwordForm.new_password !== passwordForm.new_password2) {
      nextErrors.new_password2 = "Yeni şifreler eşleşmiyor";
    }

    setPasswordErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!validateProfileForm()) {
      return;
    }

    profileMutation.mutate({
      ...profileForm,
      department: profileForm.department || null,
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) {
      return;
    }

    passwordMutation.mutate(passwordForm);
  };

  return (
    <Box>
      <PageHeader
        title="Profilim"
        subtitle="Hesap bilgilerinizi görüntüleyin, güncelleyin ve şifrenizi değiştirin"
      />

      {profileLoadError && (
        <Alert.Root status="error" mb={6} borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title fontSize="sm">
            {getErrorText(
              profileLoadError,
              "Profil bilgileri yüklenemedi. Lütfen tekrar deneyin.",
              "Profil API'si henüz erişilebilir değil. Backend bağımlılığını kontrol edin."
            )}
          </Alert.Title>
        </Alert.Root>
      )}

      <Grid templateColumns={{ base: "1fr", xl: "360px 1fr" }} gap={6}>
        <Box
          bg="white"
          border="1px solid"
          borderColor="gray.100"
          borderRadius="xl"
          p={6}
          alignSelf="start"
        >
          <Flex
            boxSize="20"
            borderRadius="full"
            bg="teal.500"
            color="white"
            align="center"
            justify="center"
            fontSize="2xl"
            fontWeight="bold"
            mb={4}
          >
            {getInitials(profileSource)}
          </Flex>

          <Heading size="lg" color="gray.800" mb={1}>
            {profileSource?.first_name || "Kullanıcı"} {profileSource?.last_name || ""}
          </Heading>
          <Text color="gray.500" fontSize="sm" mb={4}>
            Profil bilgileri ve hesap güvenliği
          </Text>

          <Flex gap={2} mb={4} flexWrap="wrap">
            <Badge colorPalette="teal" variant="subtle">
              Aktif Hesap
            </Badge>
            {selectedDepartmentName && (
              <Badge colorPalette="blue" variant="subtle">
                {selectedDepartmentName}
              </Badge>
            )}
          </Flex>

          <Separator borderColor="gray.100" mb={2} />

          <VStack align="stretch" gap={0}>
            <InfoRow label="EMAIL" value={profileSource?.email} icon={<FiMail />} />
            <Separator borderColor="gray.100" />
            <InfoRow label="TELEFON" value={profileSource?.phone_number} icon={<FiPhone />} />
            <Separator borderColor="gray.100" />
            <InfoRow
              label="KİMLİK NUMARASI"
              value={profileSource?.identification_number}
              icon={<FiUser />}
            />
            <Separator borderColor="gray.100" />
            <InfoRow label="ADRES" value={profileSource?.address} icon={<FiMapPin />} />
          </VStack>
        </Box>

        <VStack align="stretch" gap={6}>
          <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={6}>
            <Heading size="md" color="gray.800" mb={1}>
              Profil Bilgileri
            </Heading>
            <Text fontSize="sm" color="gray.500" mb={5}>
              Görünen kullanıcı bilgilerinizi bu formdan güncelleyebilirsiniz.
            </Text>

            <ProfileNotice notice={profileNotice} />

            <form onSubmit={handleProfileSubmit}>
              <VStack align="stretch" gap={4}>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormField
                    label="Ad"
                    name="first_name"
                    placeholder="Adınız"
                    value={profileForm.first_name}
                    onChange={handleProfileChange}
                    error={profileErrors.first_name}
                    disabled={isProfileLoading || profileMutation.isPending}
                  />
                  <FormField
                    label="Soyad"
                    name="last_name"
                    placeholder="Soyadınız"
                    value={profileForm.last_name}
                    onChange={handleProfileChange}
                    error={profileErrors.last_name}
                    disabled={isProfileLoading || profileMutation.isPending}
                  />
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="örnek@email.com"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    error={profileErrors.email}
                    disabled={isProfileLoading || profileMutation.isPending}
                  />
                  <FormField
                    label="Telefon"
                    name="phone_number"
                    placeholder="05XX XXX XX XX"
                    value={profileForm.phone_number}
                    onChange={handleProfileChange}
                    error={profileErrors.phone_number}
                    disabled={isProfileLoading || profileMutation.isPending}
                  />
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormField
                    label="Kimlik Numarası"
                    name="identification_number"
                    placeholder="11 haneli kimlik numarası"
                    value={profileForm.identification_number}
                    onChange={handleProfileChange}
                    error={profileErrors.identification_number}
                    disabled={isProfileLoading || profileMutation.isPending}
                    maxLength={11}
                  />
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
                      Bölüm
                    </Text>
                    <Select.Root
                      collection={departmentCollection}
                      name="department"
                      value={profileForm.department ? [profileForm.department] : []}
                      onValueChange={(details) =>
                        handleProfileChange({
                          target: {
                            name: "department",
                            value: details.value[0] ?? "",
                          },
                        })
                      }
                      disabled={
                        isProfileLoading ||
                        profileMutation.isPending ||
                        isDepartmentsLoading
                      }
                    >
                      <Select.Trigger>
                        <Select.ValueText
                          placeholder={
                            isDepartmentsLoading
                              ? "Bölümler yükleniyor..."
                              : "Bölüm seçiniz"
                          }
                        />
                      </Select.Trigger>
                      <Select.Content>
                        {departments.map((department) => (
                          <Select.Item key={department.id} item={department}>
                            {department.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                    {departmentsError && (
                      <Text color="red.500" fontSize="xs" mt={1}>
                        Bölüm listesi yüklenemedi.
                      </Text>
                    )}
                    {profileErrors.department && (
                      <Text color="red.500" fontSize="xs" mt={1}>
                        {Array.isArray(profileErrors.department)
                          ? profileErrors.department.join(" ")
                          : profileErrors.department}
                      </Text>
                    )}
                  </Box>
                </Grid>

                <FormField
                  label="Adres"
                  name="address"
                  placeholder="Adresiniz"
                  value={profileForm.address}
                  onChange={handleProfileChange}
                  error={profileErrors.address}
                  disabled={isProfileLoading || profileMutation.isPending}
                  multiline
                  rows={4}
                />

                <Flex justify="flex-end">
                  <Button
                    type="submit"
                    bg="teal.500"
                    color="white"
                    _hover={{ bg: "teal.600" }}
                    loading={profileMutation.isPending}
                    disabled={isProfileLoading}
                  >
                    Bilgileri Kaydet
                  </Button>
                </Flex>
              </VStack>
            </form>
          </Box>

          <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={6}>
            <Heading size="md" color="gray.800" mb={1}>
              Şifre Değiştir
            </Heading>
            <Text fontSize="sm" color="gray.500" mb={5}>
              Hesap güvenliğiniz için düzenli olarak şifrenizi yenileyin.
            </Text>

            <ProfileNotice notice={passwordNotice} />

            <form onSubmit={handlePasswordSubmit}>
              <VStack align="stretch" gap={4}>
                <FormField
                  label="Mevcut Şifre"
                  name="current_password"
                  type="password"
                  placeholder="Mevcut şifrenizi girin"
                  value={passwordForm.current_password}
                  onChange={handlePasswordChange}
                  error={passwordErrors.current_password}
                  disabled={passwordMutation.isPending}
                />

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormField
                    label="Yeni Şifre"
                    name="new_password"
                    type="password"
                    placeholder="En az 8 karakter"
                    value={passwordForm.new_password}
                    onChange={handlePasswordChange}
                    error={passwordErrors.new_password}
                    disabled={passwordMutation.isPending}
                  />
                  <FormField
                    label="Yeni Şifre Tekrarı"
                    name="new_password2"
                    type="password"
                    placeholder="Yeni şifrenizi tekrar girin"
                    value={passwordForm.new_password2}
                    onChange={handlePasswordChange}
                    error={passwordErrors.new_password2}
                    disabled={passwordMutation.isPending}
                  />
                </Grid>

                <Flex justify="flex-end">
                  <Button
                    type="submit"
                    variant="outline"
                    colorPalette="teal"
                    loading={passwordMutation.isPending}
                  >
                    Şifreyi Güncelle
                  </Button>
                </Flex>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Grid>
    </Box>
  );
}
