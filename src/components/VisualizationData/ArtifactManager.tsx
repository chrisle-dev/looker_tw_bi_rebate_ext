import React, { useContext, useState, useEffect } from "react";
import {
  Button,
  MessageBar,
  Spinner,
  SpaceVertical,
  Accordion2,
  Card,
  CardContent,
  Box,
  Dialog,
  DialogContent,
  ButtonOutline,
  Paragraph,
} from "@looker/components";
import { ExtensionContext40 } from "@looker/extension-sdk-react";
import type { ExtensionContextData40 } from "@looker/extension-sdk-react";

interface Artifact {
  key: string;
  value: string;
  content_type: string;
  version: number;
  namespace: string;
  created_at: string;
  updated_at: string;
  value_size: number;
}

interface ArtifactManagerProps {
  namespace?: string;
}

const ArtifactManager: React.FC<ArtifactManagerProps> = ({
  namespace = "visualization_data",
}) => {
  const { extensionSDK, coreSDK } = useContext<ExtensionContextData40>(ExtensionContext40);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);

  // Fetch artifacts from the namespace
  const fetchArtifacts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await extensionSDK.serverProxy(
        `api/4.0/artifacts/${namespace}`,
        { method: "GET" }
      );
      
      if (response.ok) {
        setArtifacts(response.body || []);
      } else {
        setError(`Failed to fetch artifacts: ${response.body?.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Error fetching artifacts: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing artifact
  const updateArtifact = async (artifact: Artifact) => {
    setLoading(true);
    setError(null);
    
    try {
      // Adding a timestamp to the value to demonstrate an update
      const value = JSON.parse(artifact.value);
      value.lastUpdated = new Date().toISOString();
      
      const updatePayload = [
        {
          key: artifact.key,
          value: JSON.stringify(value),
          content_type: artifact.content_type,
          version: artifact.version // Required for updates
        }
      ];

      const response = await coreSDK.ok(coreSDK.update_artifacts(namespace, artifacts))
      
      if (response.length > 0) {
        // Refresh the list after update
        await fetchArtifacts();
      } else {
        setError(`Failed to update artifact: ${response.body?.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Error updating artifact: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
      setSelectedArtifact(null);
    }
  };

  // Fetch artifacts on component mount
  useEffect(() => {
    fetchArtifacts();
  }, [namespace]);

  return (
    <SpaceVertical gap="small">
      {error && (
        <MessageBar
          intent="critical"
          onPrimaryClick={() => setError(null)}
        >
          {error}
        </MessageBar>
      )}
      
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Paragraph fontWeight="bold">Artifact Manager</Paragraph>
        <Button
          onClick={fetchArtifacts}
          disabled={loading}
          size="small"
        >
          Refresh Artifacts
        </Button>
      </Box>
      
      {loading ? (
        <Spinner />
      ) : artifacts.length === 0 ? (
        <Paragraph>No artifacts found in namespace: {namespace}</Paragraph>
      ) : (
        <SpaceVertical gap="small">
          {artifacts.map((artifact) => (
            <Card key={artifact.key} width="100%">
              <CardContent>
                <Accordion2 label={`${artifact.key} (v${artifact.version})`}>
                  <Box mt="medium">
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Paragraph>Created: {new Date(artifact.created_at).toLocaleString()}</Paragraph>
                      <ButtonOutline
                        onClick={() => {
                          setSelectedArtifact(artifact);
                          setShowConfirmDialog(true);
                        }}
                        size="small"
                      >
                        Update
                      </ButtonOutline>
                    </Box>
                    <Box mt="small">
                      <pre style={{ maxHeight: "200px", overflow: "auto" }}>
                        {JSON.stringify(JSON.parse(artifact.value), null, 2)}
                      </pre>
                    </Box>
                  </Box>
                </Accordion2>
              </CardContent>
            </Card>
          ))}
        </SpaceVertical>
      )}
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedArtifact && (
        <Dialog isOpen={showConfirmDialog}>
          <DialogContent>
            <SpaceVertical gap="medium">
              <Paragraph>Are you sure you want to update artifact: {selectedArtifact.key}?</Paragraph>
              <Box display="flex" justifyContent="flex-end">
                <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
                <ButtonOutline 
                  onClick={() => updateArtifact(selectedArtifact)}
                  disabled={loading}
                  style={{ marginLeft: '8px' }}
                >
                  Update
                </ButtonOutline>
              </Box>
            </SpaceVertical>
          </DialogContent>
        </Dialog>
      )}
    </SpaceVertical>
  );
};

export default ArtifactManager; 