import { Profiler, type ProfilerOnRenderCallback, type ReactNode } from 'react';

export interface ProfilerEntry {
  actualDuration: number;
  baseDuration: number;
  commitTime: number;
  id: string;
  phase: 'mount' | 'nested-update' | 'update';
  startTime: number;
}

export function createProfilerStore() {
  const entries: ProfilerEntry[] = [];

  const onRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  ) => {
    entries.push({
      actualDuration,
      baseDuration,
      commitTime,
      id,
      phase,
      startTime,
    });
  };

  return {
    entries,
    onRender,
    reset() {
      entries.length = 0;
    },
  };
}

interface ProfiledRenderProps {
  children: ReactNode;
  id: string;
  onRender: ProfilerOnRenderCallback;
}

export function ProfiledRender({ children, id, onRender }: ProfiledRenderProps) {
  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}
