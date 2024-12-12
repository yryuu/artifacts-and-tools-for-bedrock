import { useEffect, useRef, useState } from "react";
import { ArtifactType, ChatMessageContentArtifact } from "../../types";
import {
  Container,
  Header,
  SpaceBetween,
  SegmentedControl,
  Button,
  CopyToClipboard,
} from "@cloudscape-design/components";
import { ArtifactViewer } from "@centralmind/artifacts";
import SourceView from "./source-view";
import styles from "../../styles/playground.module.scss";

export interface ArtifactsUIProps {
  artifact: ChatMessageContentArtifact;
  versions: number[];
  setArtifactIndex: (index: number) => void;
  onClose: () => void;
}

export abstract class ArtifactsUIScrollState {
  static userHasScrolled = false;
  static skipNextScrollEvent = false;
  static skipNextHistoryUpdate = false;
}

export default function ArtifactsUI(props: ArtifactsUIProps) {
  const artifact = props.artifact;
  const containerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(artifact.ready);
  const [currentKey, setCurrentKey] = useState(0);
  const [selectedId, setSelectedId] = useState(
    artifact.ready ? "view" : "source",
  );
  const [files, setFiles] = useState<Record<string, string>>(
    generateFiles(artifact),
  );
  const currentVersionIndex = props.versions.indexOf(artifact.index);

  useEffect(() => {
    if (artifact.ready && !ready) {
      setReady(true);
      setSelectedId("view");

      setFiles(generateFiles(artifact));
    }
  }, [artifact, ready]);

  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [expanded]);

  useEffect(() => {
    const current = containerRef.current;
    if (!current) return;

    const onScroll = (event: Event) => {
      const target = event.target as HTMLDivElement;
      if (ArtifactsUIScrollState.skipNextScrollEvent) {
        ArtifactsUIScrollState.skipNextScrollEvent = false;
        return;
      }

      const isScrollToTheEnd =
        Math.abs(
          target.scrollTop + target.offsetHeight - target.scrollHeight,
        ) <= 10;

      if (!isScrollToTheEnd) {
        ArtifactsUIScrollState.userHasScrolled = true;
      } else {
        ArtifactsUIScrollState.userHasScrolled = false;
      }
    };

    const childs = current.getElementsByTagName("div");
    for (const child of childs) {
      child.addEventListener("scroll", onScroll);
    }

    return () => {
      for (const child of childs) {
        child.removeEventListener("scroll", onScroll);
      }
    };
  }, []);

  const onRefresh = () => {
    setCurrentKey((prevKey) => prevKey + 1);
  };

  const onExpandToggle = () => {
    const newValue = !expanded;
    setExpanded(newValue);
  };

  const actualSelectedId = ready ? selectedId : "source";

  return (
    <div
      ref={containerRef}
      className={
        expanded ? styles.sandbox_container_expanded : styles.sandbox_container
      }
    >
      <Container
        fitHeight={true}
        header={
          <Header
            variant="h3"
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <SegmentedControl
                  selectedId={actualSelectedId}
                  onChange={({ detail }) => setSelectedId(detail.selectedId)}
                  label="Default segmented control"
                  options={[
                    {
                      text: "View",
                      id: "view",
                      disabled: !ready,
                      iconName: !ready ? "status-pending" : undefined,
                    },
                    {
                      text: "Source",
                      id: "source",
                    },
                  ]}
                />
                <Button variant="icon" iconName="close" onClick={props.onClose}>
                  Close
                </Button>
              </SpaceBetween>
            }
          >
            {artifact.name}
          </Header>
        }
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <Button
                variant="icon"
                iconName="arrow-left"
                disabled={currentVersionIndex === 0}
                onClick={() =>
                  props.setArtifactIndex(
                    props.versions[currentVersionIndex - 1],
                  )
                }
              >
                Back
              </Button>
              <span>
                Version {currentVersionIndex + 1} of {props.versions.length}
              </span>
              <Button
                variant="icon"
                iconName="arrow-right"
                disabled={currentVersionIndex === props.versions.length - 1}
                onClick={() =>
                  props.setArtifactIndex(
                    props.versions[currentVersionIndex + 1],
                  )
                }
              >
                Forward
              </Button>
            </SpaceBetween>
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="icon"
                iconName="refresh"
                onClick={onRefresh}
                disabled={actualSelectedId !== "view"}
              >
                Refresh
              </Button>
              <CopyToClipboard
                variant="icon"
                copySuccessText="Copied"
                copyErrorText="Error copying text"
                textToCopy={artifact.text}
              />
              <Button
                variant="icon"
                iconName={expanded ? "shrink" : "expand"}
                onClick={onExpandToggle}
              >
                Expand
              </Button>
            </SpaceBetween>
          </div>
        }
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            display: actualSelectedId === "view" ? "block" : "none",
          }}
        >
          {ready && <ArtifactViewer files={files} key={currentKey} />}
        </div>
        <div
          style={{
            display: actualSelectedId === "source" ? "block" : "none",
          }}
        >
          <SourceView artifact={artifact} sourceCode={artifact.text} />
        </div>
      </Container>
    </div>
  );
}

function generateFiles(
  artifact: ChatMessageContentArtifact,
): Record<string, string> {
  if (!artifact.ready) return {};

  if (artifact.type === ArtifactType.HTML) {
    return {
      "/index.html": artifact.text,
    };
  } else if (artifact.type === ArtifactType.REACT) {
    return {
      "/app.tsx": artifact.text,
    };
  } else if (artifact.type === ArtifactType.VUE) {
    return {
      "/app.vue": artifact.text,
    };
  }

  return {};
}
