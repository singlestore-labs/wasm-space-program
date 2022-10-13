export const SOLAR_SYSTEM_SIZE_CELLS = 100;
export const UNIVERSE_SIZE_CELLS = 500;
export const CELL_SIZE_PX = 40;

export const SOLAR_SYSTEM_SIZE_PX = SOLAR_SYSTEM_SIZE_CELLS * CELL_SIZE_PX;
export const UNIVERSE_SIZE_PX = UNIVERSE_SIZE_CELLS * CELL_SIZE_PX;

export type Vector = [number, number];

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

export const vectorAdd = (a: Vector, b: Vector): Vector => [
  a[0] + b[0],
  a[1] + b[1],
];

export const vectorSubtract = (a: Vector, b: Vector): Vector => [
  a[0] - b[0],
  a[1] - b[1],
];

export const vectorMagnitude = (a: Vector): number =>
  Math.sqrt(a[0] ** 2 + a[1] ** 2);

export const vectorMultiply = (a: Vector, b: number): Vector => [
  a[0] * b,
  a[1] * b,
];
export const vectorDivide = (a: Vector, b: number): Vector => [
  a[0] / b,
  a[1] / b,
];

export const vectorDistance = (a: Vector, b: Vector): number =>
  Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);

export const vectorEqual = (a: Vector, b: Vector): boolean =>
  a[0] === b[0] && a[1] === b[1];

export const map1d = (x: number, y: number, width: number): number => {
  return x + y * width;
};

export const map2d = (n: number, width: number): Vector => {
  return [n % width, Math.floor(n / width)];
};
