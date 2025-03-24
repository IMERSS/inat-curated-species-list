import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router';
import { Header } from './components/header/Header';
import { Navigation } from './components/navigation/Navigation';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2';
import { createTheme, ThemeProvider } from '@mui/material';
import { BaselineData } from './components/baseline/BaselineData';
import { FileSettings } from './components/settings/FileSettings';
import { MainSettings } from './components/settings/MainSettings';
import { PublishSettings } from './components/settings/PublishSettings';

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
          <Grid container spacing={3}>
            <Grid size={3}>
              <Navigation />
            </Grid>
            <Grid size="grow">
              <Routes>
                <Route index path="/" element={<div>Home content</div>} />
                <Route path="baseline-data" element={<BaselineData />} />
                <Route path="settings/main" element={<MainSettings />} />
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
