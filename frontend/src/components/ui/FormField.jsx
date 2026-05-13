import { Box, Input, Text, Textarea } from "@chakra-ui/react";

export default function FormField({
  label,
  name,
  error,
  type = "text",
  multiline = false,
  rows = 3,
  ...inputProps
}) {
  const Component = multiline ? Textarea : Input;

  return (
    <Box>
      {label && (
        <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
          {label}
        </Text>
      )}
      <Component
        type={type}
        name={name}
        borderColor={error ? "red.300" : undefined}
        _focus={error ? { borderColor: "red.400", boxShadow: "0 0 0 1px var(--chakra-colors-red-400)" } : undefined}
        {...(multiline ? { rows } : {})}
        {...inputProps}
      />
      {error && (
        <Text color="red.500" fontSize="xs" mt={1}>
          {Array.isArray(error) ? error.join(" ") : error}
        </Text>
      )}
    </Box>
  );
}
