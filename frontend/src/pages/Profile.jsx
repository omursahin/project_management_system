import { useEffect, useState } from "react";
import {
  Box, VStack, HStack, Heading, Text, Button, Alert, Spinner, Badge,
} from "@chakra-ui/react";
import PageHeader from "../components/ui/PageHeader.jsx";
import FormField from "../components/ui/FormField.jsx";
import { getStoredUser, saveAuth } from "../services/auth.js";
import api from "../services/api.js";

export default function Profile() {
  const stored = getStoredUser();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    first_name: "", last_name: "", phone_number: "", address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get("/api/account/profile/")
      .then(({ data }) => {
        if (cancelled) return;
        setProfile(data);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone_number: data.phone_number || "",
          address: data.address || "",
        });
      })
      .catch(() => {
        if (!cancelled) setMsg({ type: "error", text: "Profil bilgileri yüklenemedi." });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const { data } = await api.patch("/api/account/profile/", form);
      setProfile(data);
      // localStorage user'i guncelle (sadece bilinen alanlar)
      const updated = { ...stored, ...data };
      saveAuth({ user: updated });
      setMsg({ type: "success", text: "Profil güncellendi." });
    } catch (err) {
      const detail = err.response?.data;
      setMsg({
        type: "error",
        text: typeof detail === "string"
          ? detail
          : detail
            ? Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`).join(" • ")
            : "Kaydetme başarısız.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Profilim" />
        <Box textAlign="center" py={10}><Spinner size="xl" color="teal.500" /></Box>
      </Box>
    );
  }

  const role = profile?.is_superuser ? { label: "Yönetici", color: "red" }
    : profile?.is_staff ? { label: "Eğitmen", color: "blue" }
    : { label: "Öğrenci", color: "gray" };

  return (
    <Box>
      <PageHeader title="Profilim" subtitle="Kişisel bilgilerinizi güncelleyin." />

      <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={6} maxW="700px">
        <HStack gap={3} mb={5}>
          <Box
            w="56px" h="56px" borderRadius="full"
            bg="teal.500" color="white"
            display="flex" alignItems="center" justifyContent="center"
            fontSize="xl" fontWeight="bold"
          >
            {(form.first_name?.[0] || profile?.email?.[0] || "?").toUpperCase()}
          </Box>
          <Box>
            <Text fontWeight="semibold" color="gray.800">{profile?.email}</Text>
            <HStack gap={2} mt={1}>
              <Badge colorPalette={role.color} variant="subtle" borderRadius="full">{role.label}</Badge>
              {profile?.identification_number && (
                <Text fontSize="xs" color="gray.500" fontFamily="mono">
                  No: {profile.identification_number}
                </Text>
              )}
            </HStack>
          </Box>
        </HStack>

        {msg && (
          <Alert.Root status={msg.type === "success" ? "success" : "error"} mb={4} borderRadius="md">
            <Alert.Indicator />
            <Alert.Title fontSize="sm">{msg.text}</Alert.Title>
          </Alert.Root>
        )}

        <VStack gap={4} align="stretch">
          <HStack gap={3}>
            <FormField label="Ad" value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <FormField label="Soyad" value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </HStack>
          <FormField label="Telefon" value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
          <FormField label="Adres" value={form.address} multiline rows={3}
            onChange={(e) => setForm({ ...form, address: e.target.value })} />

          <HStack justify="end" pt={2}>
            <Button bg="teal.500" color="white" _hover={{ bg: "teal.600" }}
              loading={saving} onClick={handleSave}>
              Kaydet
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
