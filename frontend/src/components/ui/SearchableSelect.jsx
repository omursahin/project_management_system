import { useEffect, useRef, useState } from "react";
import { Box, Input, Text, Spinner } from "@chakra-ui/react";

/**
 * Aranabilir secim kutusu. Hem statik options ile hem de server-side arama ile calisir.
 *
 * Statik mod:
 *   <SearchableSelect options={[{value, label}]} value={x} onChange={setX} />
 *
 * Server-side mod (resource ile):
 *   <SearchableSelect
 *     value={instructorId}
 *     onChange={setInstructorId}
 *     useSearch={(q) => users.useList(q ? { search: q } : undefined)}
 *     getOptionLabel={(u) => `${u.full_name} (${u.email})`}
 *     getOptionValue={(u) => u.id}
 *   />
 */
export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  useSearch,
  getOptionLabel = (o) => o.label ?? String(o),
  getOptionValue = (o) => o.value ?? o,
  placeholder = "Aramak için yazın...",
  error,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const wrapRef = useRef(null);

  const search = useSearch ? useSearch(query) : null;
  const remoteList = search?.data || [];
  const remoteLoading = search?.isFetching;

  const list = options
    ? options.filter((o) => {
        if (!query) return true;
        return getOptionLabel(o).toLowerCase().includes(query.toLowerCase());
      })
    : remoteList;

  // Disaridan gelen value icin label'i bul
  useEffect(() => {
    if (value == null || value === "") {
      setSelectedLabel("");
      return;
    }
    const found = list.find((o) => String(getOptionValue(o)) === String(value));
    if (found) setSelectedLabel(getOptionLabel(found));
  }, [value, list]);

  // Disariya tiklayinca kapat
  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (opt) => {
    onChange?.({ target: { value: getOptionValue(opt) } });
    setSelectedLabel(getOptionLabel(opt));
    setQuery("");
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.({ target: { value: "" } });
    setSelectedLabel("");
    setQuery("");
  };

  return (
    <Box position="relative" ref={wrapRef}>
      {label && (
        <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
          {label}
        </Text>
      )}
      <Box position="relative">
        <Input
          type="text"
          value={open ? query : selectedLabel}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={selectedLabel ? selectedLabel : placeholder}
          disabled={disabled}
          borderColor={error ? "red.300" : undefined}
          pr={selectedLabel ? "60px" : "30px"}
        />
        {selectedLabel && !disabled && (
          <Text
            as="span"
            position="absolute"
            right="32px"
            top="50%"
            transform="translateY(-50%)"
            fontSize="sm"
            color="gray.400"
            cursor="pointer"
            onClick={handleClear}
            title="Temizle"
          >
            ✕
          </Text>
        )}
        <Text
          as="span"
          position="absolute"
          right="10px"
          top="50%"
          transform="translateY(-50%)"
          fontSize="xs"
          color="gray.400"
          pointerEvents="none"
        >
          ▼
        </Text>
      </Box>

      {open && !disabled && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={1}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          shadow="lg"
          maxH="240px"
          overflowY="auto"
          zIndex={1500}
        >
          {remoteLoading ? (
            <Box p={3} textAlign="center">
              <Spinner size="sm" color="teal.500" />
            </Box>
          ) : list.length === 0 ? (
            <Box p={3} textAlign="center" color="gray.400" fontSize="sm">
              Sonuc bulunamadi
            </Box>
          ) : (
            list.map((opt) => {
              const v = getOptionValue(opt);
              const isSelected = String(v) === String(value);
              return (
                <Box
                  key={v}
                  px={3}
                  py={2}
                  cursor="pointer"
                  bg={isSelected ? "teal.50" : "white"}
                  color={isSelected ? "teal.700" : "gray.700"}
                  fontSize="sm"
                  _hover={{ bg: "teal.50" }}
                  onClick={() => handleSelect(opt)}
                >
                  {getOptionLabel(opt)}
                </Box>
              );
            })
          )}
        </Box>
      )}

      {error && (
        <Text color="red.500" fontSize="xs" mt={1}>
          {Array.isArray(error) ? error.join(" ") : error}
        </Text>
      )}
    </Box>
  );
}
