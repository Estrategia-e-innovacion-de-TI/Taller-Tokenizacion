import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { AppShell } from "./components/shell/AppShell";
import { HomePage } from "./pages/HomePage";
import { DemoPage } from "./pages/DemoPage";
import { ConceptosLayout } from "./pages/conceptos/ConceptosLayout";
import { GuiaRwaPage } from "./pages/conceptos/GuiaRwaPage";
import { EnlacesPage } from "./pages/conceptos/EnlacesPage";
import {
  ConceptoAA,
  ConceptoCasosBanca,
  ConceptoContratos,
  ConceptoCopw,
  ConceptoTokenizacion,
} from "./pages/conceptos/pages";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/laboratorio/*" element={<Navigate to="/demo" replace />} />
            <Route path="/conceptos" element={<ConceptosLayout />}>
              <Route path="guia-rwa" element={<GuiaRwaPage />} />
              <Route path="tokenizacion" element={<ConceptoTokenizacion />} />
              <Route path="casos-banca" element={<ConceptoCasosBanca />} />
              <Route path="copw" element={<ConceptoCopw />} />
              <Route path="account-abstraction" element={<ConceptoAA />} />
              <Route path="contratos" element={<ConceptoContratos />} />
              <Route path="enlaces" element={<EnlacesPage />} />
            </Route>
          </Routes>
        </AppShell>
      </BrowserRouter>
    </AuthProvider>
  );
}
