import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Incidents() {
  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle>Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page will contain the incidents management functionality.</p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
