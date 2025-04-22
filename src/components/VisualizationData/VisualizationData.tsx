import React, { useContext } from "react";
import {
  Accordion2,
  Card,
  CardContent,
  Span,
  Box,
  SpaceVertical,
} from "@looker/components";
import { ExtensionContext40 } from "@looker/extension-sdk-react";
import type { ExtensionContextData40 } from "@looker/extension-sdk-react";

const VisualizationData = () => {
  const { visualizationData, visualizationSDK } =
    useContext<ExtensionContextData40>(ExtensionContext40);

  return (
    <>
      {!visualizationData ? (
        <Card width="100%">
          <CardContent>
            <Accordion2 label="Visualization data" defaultOpen>
              <Box mt="medium">
                <Span>Visualization data not available</Span>
              </Box>
            </Accordion2>
          </CardContent>
        </Card>
      ) : (
        <SpaceVertical gap="small" width="100%">
          <Card width="100%">
            <CardContent>
              <Accordion2 label="Query response">
                <Box mt="medium">
                  <pre style={{ width: "300px" }}>
                    {JSON.stringify(visualizationSDK.queryResponse, null, 2)}
                  </pre>
                </Box>
              </Accordion2>
            </CardContent>
          </Card>
          <Card width="100%">
            <CardContent>
              <Accordion2 label="Visualization configuration">
                <Box mt="medium">
                  <pre style={{ width: "300px" }}>
                    {JSON.stringify(visualizationSDK.visConfig, null, 2)}
                  </pre>
                </Box>
              </Accordion2>
            </CardContent>
          </Card>
        </SpaceVertical>
      )}
    </>
  );
};

export default VisualizationData;
