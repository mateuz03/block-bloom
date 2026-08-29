import type { Block, Cell } from "../simulation/puzzle";

export type DragSnapshot = {
  block: Block;
  blocks: Block[];
  blockedCells: Cell[];
  levelWidth: number;
  levelHeight: number;
};

export type DragSession = {
  blockId: string;
  pointerId: number;
  snapshot: DragSnapshot;
};

const cloneBlock = (block: Block): Block => ({ ...block });
const cloneCell = (cell: Cell): Cell => ({ ...cell });

/**
 * Mantém o gesto transitório fora do Phaser e impede dois arrastes ao mesmo
 * tempo. O snapshot é copiado uma única vez no início e permanece estável
 * durante todo o gesto.
 */
export class DragController {
  private activeSession?: DragSession;

  get active(): boolean {
    return this.activeSession !== undefined;
  }

  begin(
    blockId: string,
    pointerId: number,
    snapshot: DragSnapshot,
  ): boolean {
    if (this.activeSession) return false;

    this.activeSession = {
      blockId,
      pointerId,
      snapshot: {
        block: cloneBlock(snapshot.block),
        blocks: snapshot.blocks.map(cloneBlock),
        blockedCells: snapshot.blockedCells.map(cloneCell),
        levelWidth: snapshot.levelWidth,
        levelHeight: snapshot.levelHeight,
      },
    };

    return true;
  }

  owns(blockId: string, pointerId: number): boolean {
    return (
      this.activeSession?.blockId === blockId &&
      this.activeSession.pointerId === pointerId
    );
  }

  sessionFor(
    blockId: string,
    pointerId: number,
  ): DragSession | undefined {
    return this.owns(blockId, pointerId)
      ? this.activeSession
      : undefined;
  }

  finish(
    blockId: string,
    pointerId: number,
  ): DragSession | undefined {
    if (!this.owns(blockId, pointerId)) return undefined;
    return this.takeActiveSession();
  }

  cancel(): DragSession | undefined {
    return this.takeActiveSession();
  }

  private takeActiveSession(): DragSession | undefined {
    const session = this.activeSession;
    this.activeSession = undefined;
    return session;
  }
}
