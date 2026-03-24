import { useRoutes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CssBaseline, ThemeProvider } from "@mui/material";
import "./components/i18n";
import useScrollReset from "./common/hooks/UseScrollReset";
import useSettings from "./common/hooks/UseSettings";
import routes from "./Routes";
import { createCustomTheme } from "./theme";
import CommonDataContextProvider from "./common/contexts/CommonDataContext";
import PageChangeHandler from "./PageChangeHandler";
import { getAmplifyConfig } from "./common/config";
import Amplify from "aws-amplify";
import { ModalRoot } from "./components/Modal";

const App = () => {
  const content = useRoutes(routes);
  const { settings } = useSettings();
  Amplify.configure(getAmplifyConfig());

  useScrollReset();

  const theme = createCustomTheme({
    direction: settings.direction,
    responsiveFontSizes: settings.responsiveFontSizes,
    roundedCorners: settings.roundedCorners,
    theme: settings.theme,
  });

  return (
    <ThemeProvider theme={theme}>
        <CommonDataContextProvider>
          <CssBaseline />
          <Toaster position="top-center" />
          <ModalRoot />
          <PageChangeHandler />
          {content}
        </CommonDataContextProvider>
    </ThemeProvider>
  );
};

export default App;
