import { Route, Routes, BrowserRouter } from 'react-router';
import { Header } from './components/header/Header';
import { Navigation } from './components/navigation/Navigation';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2';
import { createTheme, ThemeProvider } from '@mui/material';
import { BaselineSpecies } from './components/baseline/BaselineSpecies';
import { FileSettings } from './components/settings/FileSettings';
import { MainSettingsPage } from './components/settings/MainSettings';
import { PublishSettings } from './components/settings/PublishSettings';
import { CuratedChecklist } from './components/checklist/CuratedChecklist';

function App() {
  const theme = createTheme({
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Header />
      <BrowserRouter>
        <Container maxWidth="lg">
          <Grid container spacing={3} paddingTop={10}>
            <Grid size={3}>
              <Navigation />
            </Grid>
            <Grid size="grow">
              <Routes>
                <Route index path="/" element={<div>(router - login or redirect to curated checklist page)</div>} />
                <Route path="curated-checklist" element={<CuratedChecklist />} />
                <Route path="baseline-species" element={<BaselineSpecies />} />
                <Route path="settings/main" element={<MainSettingsPage />} />
                <Route path="settings/files" element={<FileSettings />} />
                <Route path="settings/publish" element={<PublishSettings />} />
              </Routes>
            </Grid>
          </Grid>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}

// <Link component={RouterLink} to="/home">home </Link>

export default App;
