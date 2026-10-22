import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };

/** Renders the fallback (nothing by default) if a child throws, e.g. WebGL failing or a chunk not loading. */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
