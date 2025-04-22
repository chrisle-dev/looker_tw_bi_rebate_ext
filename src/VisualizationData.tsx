// Copyright 2021 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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

export default function VisualizationData() {
  const { visualizationData, visualizationSDK } =
    useContext(ExtensionContext40);
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
}
