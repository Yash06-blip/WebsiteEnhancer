import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ShiftLogs() {
  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle>Shift Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page will contain the shift logs management functionality.</p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
