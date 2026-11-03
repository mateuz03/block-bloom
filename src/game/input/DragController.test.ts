import { describe, expect, it } from "vitest";
import { DragController, type DragSnapshot } from "./DragController";

const snapshot = (): DragSnapshot => ({
  block: {
    id: "coral-1",
    color: "coral",
    col: 0,
    row: 1,
    width: 1,
    height: 1,
  },
  blocks: [
    {
      id: "coral-1",
      color: "coral",
      col: 0,
      row: 1,
      width: 1,
      height: 1,
    },
    {
      id: "blue-1",
      color: "blue",
      col: 2,
      row: 1,
      width: 1,
      height: 1,
    },
  ],
  blockedCells: [{ col: 3, row: 2 }],
  levelWidth: 5,
  levelHeight: 6,
});

describe("DragController", () => {
  it("aceita apenas um arraste por vez", () => {
    const controller = new DragController();

    expect(controller.begin("coral-1", 1, snapshot())).toBe(true);
    expect(controller.begin("blue-1", 2, snapshot())).toBe(false);
    expect(controller.owns("coral-1", 1)).toBe(true);
    expect(controller.owns("coral-1", 2)).toBe(false);
  });

  it("mantém um snapshot defensivo e estável durante o gesto", () => {
    const controller = new DragController();
    const source = snapshot();
    controller.begin("coral-1", 4, source);

    const first = controller.sessionFor("coral-1", 4);
    source.block.col = 4;
    source.blocks[0].row = 5;
    source.blockedCells[0].col = 0;
    const second = controller.sessionFor("coral-1", 4);

    expect(second).toBe(first);
    expect(second?.snapshot.block.col).toBe(0);
    expect(second?.snapshot.blocks[0].row).toBe(1);
    expect(second?.snapshot.blockedCells[0].col).toBe(3);
  });

  it("finaliza somente para o bloco e ponteiro proprietários", () => {
    const controller = new DragController();
    controller.begin("coral-1", 7, snapshot());

    expect(controller.finish("coral-1", 8)).toBeUndefined();
    expect(controller.active).toBe(true);
    expect(controller.finish("coral-1", 7)?.blockId).toBe("coral-1");
    expect(controller.active).toBe(false);
  });

  it("cancela o gesto de forma idempotente", () => {
    const controller = new DragController();
    controller.begin("coral-1", 3, snapshot());

    expect(controller.cancel()?.pointerId).toBe(3);
    expect(controller.cancel()).toBeUndefined();
  });
});
