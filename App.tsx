import React from "react";
import { AppProviders } from "./src/app/providers/AppProviders";
import { RootNavigator } from "./src/app/navigation/RootNavigator";
import { ComponentPreviewScreen } from "./src/screens/__ComponentPreview";

function App(): React.JSX.Element {
  // TEMP: dev-only component preview, toggle SHOW_COMPONENT_PREVIEW to view — safe to delete this block and __ComponentPreview.tsx together
  const SHOW_COMPONENT_PREVIEW = false;

  return (
    <AppProviders>
      {SHOW_COMPONENT_PREVIEW ? <ComponentPreviewScreen /> : <RootNavigator />}
    </AppProviders>
  );
}

export default App;
