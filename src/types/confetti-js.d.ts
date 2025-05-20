declare module "confetti-js" {
  interface ConfettiSettings {
    target?: HTMLCanvasElement;
    max?: number;
    size?: number;
    animate?: boolean;
    props?: string[];
    colors?: number[][];
    clock?: number;
    rotate?: boolean;
    start_from_edge?: boolean;
    respawn?: boolean;
    width?: number;
    height?: number;
  }

  export default class ConfettiGenerator {
    constructor(settings: ConfettiSettings);
    render(): void;
    clear(): void;
  }
}
