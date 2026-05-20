import { Box } from "@chakra-ui/react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import UniversityTable from "../../components/university-list/UniversityTable.jsx";

export default function AdminUniversitiesPage() {
  return (
    <Box>
      <PageHeader
        title="Üniversiteler"
        subtitle="Kayıtlı üniversiteleri yönetin ve detaylarını inceleyin."
      />
      <UniversityTable />
    </Box>
  );
}
