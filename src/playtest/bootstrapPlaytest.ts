import { createPlaytestPanel } from "../ui/playtestPanel";
import { createPlaytestController } from "./PlaytestController";
import "./playtestPanel.css";

export function bootstrapPlaytest(root: HTMLElement): () => void {
  const controller = createPlaytestController();
  const destroyPanel = createPlaytestPanel(root, controller);
  return () => {
    destroyPanel();
    controller.destroy();
  };
}
