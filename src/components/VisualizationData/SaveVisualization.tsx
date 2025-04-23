import React, { useContext, useState } from "react";
import {
  Button,
  MessageBar,
  Tooltip,
  SpaceVertical,
} from "@looker/components";
import { ExtensionContext40 } from "@looker/extension-sdk-react";
import type { ExtensionContextData40 } from "@looker/extension-sdk-react";

interface SaveVisualizationProps {
  namespace?: string;
  userId: string;
  dashboardId: string;
  contract: string;
  sku: string;
}

const SaveVisualization: React.FC<SaveVisualizationProps> = ({
  namespace = "visualization_data",
  userId,
  dashboardId,
  contract,
  sku,
}) => {
  const { visualizationData, visualizationSDK, coreSDK } =
    useContext<ExtensionContextData40>(ExtensionContext40);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Function to save visualization data to artifacts API
  const saveVisualizationData = async () => {
    if (!visualizationData || !visualizationSDK) {
      setMessage("No visualization data available to save");
      setIsError(true);
      return;
    }

    setIsSaving(true);
    setMessage(null);
    setIsError(false);

    try {
      // Prepare the data to save
      const artifactData = {
        queryResponse: visualizationSDK.queryResponse,
        visConfig: visualizationSDK.visConfig,
        visualizationData,
        savedAt: new Date().toISOString(),
      };

      // Create the artifact key using the specified format
      const artifactKey = `tw_bi_rebate_${userId}_${dashboardId}_${contract}_${sku}`;

      // Create the artifact payload
      const artifacts = [
        {
          key: artifactKey,
          value: JSON.stringify(artifactData),
          content_type: "application/json",
        },
      ];

      // Call the Looker API to save the artifact
      const response = await coreSDK.ok(coreSDK.update_artifacts(namespace, artifacts))
      
      setMessage("Visualization data saved successfully");
    } catch (error) {
      console.error("Error saving visualization data:", error);
      setMessage(`Error saving data: ${error instanceof Error ? error.message : String(error)}`);
      setIsError(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SpaceVertical gap="small">
      {message && (
        <MessageBar
          intent={isError ? "critical" : "positive"}
          onPrimaryClick={() => setMessage(null)}
        >
          {message}
        </MessageBar>
      )}
      <Tooltip content="Save current visualization data to Looker artifacts">
        <Button
          onClick={saveVisualizationData}
          disabled={!visualizationData || isSaving}
          isLoading={isSaving}
        >
          Save Visualization
        </Button>
      </Tooltip>
    </SpaceVertical>
  );
};

export default SaveVisualization; 