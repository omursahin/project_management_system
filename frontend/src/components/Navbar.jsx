import { Flex, Box, Text, Button, Link } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi, clearAuth, getStoredTokens, useAuthUser } from "../services/auth.js";

function UserAvatar({ user }) {
  const initials = user
    ? `${(user.first_name?.[0] || "").toUpperCase()}${(user.last_name?.[0] || "").toUpperCase()}`
    : "?";

  return (
    <Flex
      w="36px"
      h="36px"
      borderRadius="full"
      bg="whiteAlpha.300"
      align="center"
      justify="center"
      fontWeight="bold"
      fontSize="sm"
      flexShrink={0}
    >
      {initials}
    </Flex>
  );
}

const Navbar = () => {
  const navigate = useNavigate();
  const user = useAuthUser();

  const logoutMutation = useMutation({
    mutationFn: () => {
      const tokens = getStoredTokens();
      if (tokens?.refresh) {
        return authApi.logout(tokens.refresh);
      }
      return Promise.resolve();
    },
    onSettled: () => {
      clearAuth();
      navigate("/login");
    },
  });

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      px={6}
      py={3}
      bgGradient="to-r"
      gradientFrom="teal.600"
      gradientTo="teal.500"
      color="white"
      boxShadow="0 2px 8px rgba(0,0,0,0.12)"
      position="sticky"
      top="0"
      zIndex="1000"
    >
      <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
        <Text fontSize="lg" fontWeight="bold" letterSpacing="wider">
          PROJE YÖNETİM
        </Text>
      </Link>

      <Flex align="center" gap={4}>
        <Link
          as={RouterLink}
          to="/"
          fontSize="sm"
          opacity={0.9}
          _hover={{ opacity: 1, textDecoration: "none" }}
          display={{ base: "none", md: "inline" }}
        >
          Ana Sayfa
        </Link>
        <Link
          as={RouterLink}
          to="/dashboard"
          fontSize="sm"
          opacity={0.9}
          _hover={{ opacity: 1, textDecoration: "none" }}
          display={{ base: "none", md: "inline" }}
        >
          Panel
        </Link>
        <Link
          as={RouterLink}
          to="/profile"
          fontSize="sm"
          opacity={0.9}
          _hover={{ opacity: 1, textDecoration: "none" }}
          display={{ base: "none", md: "inline" }}
        >
          Profilim
        </Link>

        <Flex
          as={RouterLink}
          to="/profile"
          align="center"
          gap={2}
          bg="whiteAlpha.200"
          borderRadius="full"
          pl={1}
          pr={3}
          py={1}
          _hover={{ bg: "whiteAlpha.300", textDecoration: "none" }}
        >
          <UserAvatar user={user} />
          <Text fontSize="sm" fontWeight="medium" display={{ base: "none", sm: "inline" }}>
            {user?.first_name || "Kullanıcı"}
          </Text>
        </Flex>

        <Button
          variant="outline"
          size="xs"
          color="white"
          borderColor="whiteAlpha.400"
          _hover={{ bg: "whiteAlpha.200" }}
          onClick={() => logoutMutation.mutate()}
          loading={logoutMutation.isPending}
        >
          Çıkış
        </Button>
      </Flex>
    </Flex>
  );
};

export default Navbar;
