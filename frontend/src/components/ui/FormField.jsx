import { Box, Input, Text, Textarea } from "@chakra-ui/react";

/**
 * Form alan bileseni - text input, textarea veya select olarak kullanilabilir.
 *
 * Select kullanimi:
 *   <FormField label="Bolum" value={x} onChange={(e)=>setX(e.target.value)}
 *              options={[{value:1,label:"Yazilim"},...]} placeholder="Seciniz" />
 */
export default function FormField({
  label,
  name,
  error,
  type = "text",
  multiline = false,
  rows = 3,
  options,
  placeholder,
  ...inputProps
}) {
  const isSelect = Array.isArray(options);

  const baseStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "6px",
    border: `1px solid ${error ? "#FC8181" : "#E2E8F0"}`,
    outline: "none",
    backgroundColor: "white",
    fontSize: "14px",
    color: "#2D3748",
    fontFamily: "inherit",
  };

  let control;
  if (isSelect) {
    const { value, onChange, ...rest } = inputProps;
    control = (
      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        style={baseStyle}
        {...rest}
      >
        {placeholder !== false && <option value="">{placeholder || "Seciniz..."}</option>}
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    );
  } else {
    const Component = multiline ? Textarea : Input;
    control = (
      <Component
        type={type}
        name={name}
        placeholder={placeholder}
        borderColor={error ? "red.300" : undefined}
        _focus={error ? { borderColor: "red.400", boxShadow: "0 0 0 1px var(--chakra-colors-red-400)" } : undefined}
        {...(multiline ? { rows } : {})}
        {...inputProps}
      />
    );
  }

  return (
    <Box>
      {label && (
        <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
          {label}
        </Text>
      )}
      {control}
      {error && (
        <Text color="red.500" fontSize="xs" mt={1}>
          {Array.isArray(error) ? error.join(" ") : error}
        </Text>
      )}
    </Box>
  );
}
