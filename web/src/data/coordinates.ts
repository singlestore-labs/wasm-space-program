export const SOLAR_SYSTEM_SIZE_CELLS = 100;
export const CELL_SIZE_PX = 40;

export const SOLAR_SYSTEM_SIZE_PX = SOLAR_SYSTEM_SIZE_CELLS * CELL_SIZE_PX;

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// translate from world coordinates to cell coordinates
export const worldToCell = (x: number, y: number): [number, number] => {
  const cellX = Math.floor(x / CELL_SIZE_PX);
  const cellY = Math.floor(y / CELL_SIZE_PX);
  return [cellX, cellY];
};

// translate from cell coordinates to world coordinates
export const cellToWorld = (cellX: number, cellY: number): [number, number] => {
  const x = cellX * CELL_SIZE_PX;
  const y = cellY * CELL_SIZE_PX;
  return [x, y];
};

// translate from world bounds to cell bounds
export const worldToCellBounds = (world: Bounds): Bounds => {
  const [cellX, cellY] = worldToCell(world.x, world.y);
  const [cellWidth, cellHeight] = worldToCell(
    world.width + CELL_SIZE_PX,
    world.height + CELL_SIZE_PX
  );
  return {
    x: cellX,
    y: cellY,
    width: cellWidth,
    height: cellHeight,
  };
};

export const boundsContains = (bounds: Bounds, x: number, y: number): boolean =>
  x >= bounds.x &&
  x < bounds.x + bounds.width &&
  y >= bounds.y &&
  y < bounds.y + bounds.height;
