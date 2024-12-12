import { ChatMessageContentArtifact } from "../../types";
import { useEffect, useState } from "react";
import ArtifactsUI from "./artifacts-ui";

export interface ArtifactsWrapperProps {
  artifacts: ChatMessageContentArtifact[];
  artifactIndex: number;
  setArtifactIndex: (index: number) => void;
}

export default function ArtifactsWrapper(props: ArtifactsWrapperProps) {
  const [numArtifacts, setNumArtifacts] = useState(props.artifacts.length);

  useEffect(() => {
    if (props.artifactIndex < 0 && numArtifacts < props.artifacts.length) {
      props.setArtifactIndex(props.artifacts.length - 1);
    }

    if (numArtifacts != props.artifacts.length) {
      setNumArtifacts(props.artifacts.length);
    }
  }, [numArtifacts, props, props.artifactIndex, props.artifacts.length]);

  if (props.artifactIndex < 0) return null;
  const currentArtifact = props.artifacts[props.artifactIndex];
  const versions = props.artifacts
    .filter((a) => a.name === currentArtifact.name)
    .map((a) => a.index);

  return (
    <ArtifactsUI
      key={props.artifacts[props.artifactIndex].index}
      artifact={currentArtifact}
      versions={versions}
      setArtifactIndex={props.setArtifactIndex}
      onClose={() => props.setArtifactIndex(-1)}
    />
  );
}
