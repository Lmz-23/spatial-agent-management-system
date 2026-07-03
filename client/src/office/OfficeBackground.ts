import * as PIXI from 'pixi.js';

// Office dimensions
export const OFFICE_WIDTH = 800;
export const OFFICE_HEIGHT = 600;
export const WALL_THICKNESS = 15;

// Colors
const WALL_COLOR = 0xe0e0e0;
const FLOOR_COLOR = 0xd4d4d4;
const WALL_BORDER = 0x999999;
const DESK_COLOR = 0x8b7355;
const DESK_LEG = 0x5c4033;
const CHAIR_COLOR = 0x4a4a4a;
const SOFA_COLOR = 0x6b5b4f;
const COFFEE_TABLE_COLOR = 0x5c4033;
const WHITEBOARD_COLOR = 0xf5f5f5;
const WHITEBOARD_FRAME = 0x333333;

export class OfficeBackground extends PIXI.Container {
  constructor() {
    super();
    this.createBackground();
    this.createDesks();
    this.createChairs();
    this.createRestArea();
    this.createWhiteboard();
  }

  private createBackground(): void {
    // Outer walls
    const walls = new PIXI.Graphics();
    walls.beginFill(WALL_COLOR);
    walls.drawRect(0, 0, OFFICE_WIDTH, OFFICE_HEIGHT);
    walls.endFill();
    this.addChild(walls);

    // Inner floor
    const floor = new PIXI.Graphics();
    floor.beginFill(FLOOR_COLOR);
    floor.drawRect(
      WALL_THICKNESS,
      WALL_THICKNESS,
      OFFICE_WIDTH - WALL_THICKNESS * 2,
      OFFICE_HEIGHT - WALL_THICKNESS * 2
    );
    floor.endFill();
    this.addChild(floor);

    // Floor grid pattern
    const grid = new PIXI.Graphics();
    grid.lineStyle(1, 0xcccccc, 0.2);
    const gridSize = 50;
    for (let x = WALL_THICKNESS; x < OFFICE_WIDTH - WALL_THICKNESS; x += gridSize) {
      grid.moveTo(x, WALL_THICKNESS);
      grid.lineTo(x, OFFICE_HEIGHT - WALL_THICKNESS);
    }
    for (let y = WALL_THICKNESS; y < OFFICE_HEIGHT - WALL_THICKNESS; y += gridSize) {
      grid.moveTo(WALL_THICKNESS, y);
      grid.lineTo(OFFICE_WIDTH - WALL_THICKNESS, y);
    }
    this.addChild(grid);

    // Inner wall border
    const innerBorder = new PIXI.Graphics();
    innerBorder.lineStyle(3, WALL_BORDER, 0.8);
    innerBorder.drawRect(
      WALL_THICKNESS,
      WALL_THICKNESS,
      OFFICE_WIDTH - WALL_THICKNESS * 2,
      OFFICE_HEIGHT - WALL_THICKNESS * 2
    );
    this.addChild(innerBorder);
  }

  private createDesks(): void {
    // Desk positions as specified
    const deskPositions = [
      { x: 100, y: 150 },
      { x: 250, y: 150 },
      { x: 100, y: 300 },
      { x: 250, y: 300 },
    ];

    deskPositions.forEach((pos) => {
      this.createDesk(pos.x, pos.y);
    });
  }

  private createDesk(x: number, y: number): void {
    const deskWidth = 60;
    const deskHeight = 40;
    const desk = new PIXI.Graphics();

    // Desktop surface
    desk.beginFill(DESK_COLOR);
    desk.drawRect(0, 0, deskWidth, deskHeight);
    desk.endFill();

    // Top highlight
    desk.lineStyle(1, 0xa08060, 0.5);
    desk.drawRect(1, 1, deskWidth - 2, deskHeight - 2);

    // Legs
    desk.beginFill(DESK_LEG);
    desk.drawRect(3, deskHeight, 4, 15);
    desk.drawRect(deskWidth - 7, deskHeight, 4, 15);
    desk.endFill();

    desk.x = x;
    desk.y = y;
    this.addChild(desk);
  }

  private createChairs(): void {
    // Chair positions (in front of each desk)
    const chairPositions = [
      { x: 115, y: 200 },
      { x: 265, y: 200 },
      { x: 115, y: 350 },
      { x: 265, y: 350 },
    ];

    chairPositions.forEach((pos) => {
      this.createChair(pos.x, pos.y);
    });
  }

  private createChair(x: number, y: number): void {
    const chair = new PIXI.Graphics();
    const chairSize = 25;

    // Seat
    chair.beginFill(CHAIR_COLOR);
    chair.drawRect(0, 0, chairSize, chairSize);
    chair.endFill();

    // Seat cushion
    chair.beginFill(0x666666);
    chair.drawRect(2, 2, chairSize - 4, chairSize - 4);
    chair.endFill();

    // Backrest
    chair.beginFill(CHAIR_COLOR);
    chair.drawRect(0, -15, chairSize, 15);
    chair.endFill();

    // Wheels/base
    chair.beginFill(0x333333);
    chair.drawRect(3, chairSize, chairSize - 6, 5);
    chair.endFill();

    chair.x = x;
    chair.y = y;
    this.addChild(chair);
  }

  private createRestArea(): void {
    // Sofa at x=500, y=400
    this.createSofa(500, 400);

    // Coffee table at x=600, y=420
    this.createCoffeeTable(600, 420);
  }

  private createSofa(x: number, y: number): void {
    const sofa = new PIXI.Graphics();
    const sofaWidth = 80;
    const sofaHeight = 35;

    // Base
    sofa.beginFill(SOFA_COLOR);
    sofa.drawRect(0, 10, sofaWidth, sofaHeight);
    sofa.endFill();

    // Backrest
    sofa.beginFill(SOFA_COLOR);
    sofa.drawRect(0, 0, sofaWidth, 15);
    sofa.endFill();

    // Armrests
    sofa.beginFill(0x5a4a3f);
    sofa.drawRect(0, 10, 8, sofaHeight);
    sofa.drawRect(sofaWidth - 8, 10, 8, sofaHeight);
    sofa.endFill();

    // Cushions
    sofa.beginFill(0x7a6a5a);
    sofa.drawRect(10, 15, 25, 20);
    sofa.drawRect(38, 15, 25, 20);
    sofa.endFill();

    sofa.x = x;
    sofa.y = y;
    this.addChild(sofa);
  }

  private createCoffeeTable(x: number, y: number): void {
    const table = new PIXI.Graphics();
    const tableWidth = 40;
    const tableHeight = 25;

    // Table top
    table.beginFill(COFFEE_TABLE_COLOR);
    table.drawRect(0, 0, tableWidth, tableHeight);
    table.endFill();

    // Highlight
    table.lineStyle(1, 0x7a5c3a, 0.5);
    table.drawRect(1, 1, tableWidth - 2, tableHeight - 2);

    // Legs
    table.beginFill(0x3a2a1a);
    table.drawRect(3, tableHeight, 3, 10);
    table.drawRect(tableWidth - 6, tableHeight, 3, 10);
    table.endFill();

    // Coffee cup on table (small circle)
    table.beginFill(0xffffff);
    table.drawCircle(tableWidth / 2, tableHeight / 2, 5);
    table.endFill();
    table.beginFill(0x4a3020);
    table.drawCircle(tableWidth / 2, tableHeight / 2, 3);
    table.endFill();

    table.x = x;
    table.y = y;
    this.addChild(table);
  }

  private createWhiteboard(): void {
    // Whiteboard at x=400, y=50
    const wb = new PIXI.Graphics();
    const wbWidth = 120;
    const wbHeight = 80;

    // Frame
    wb.beginFill(WHITEBOARD_FRAME);
    wb.drawRect(0, 0, wbWidth, wbHeight);
    wb.endFill();

    // Writing surface
    wb.beginFill(WHITEBOARD_COLOR);
    wb.drawRect(4, 4, wbWidth - 8, wbHeight - 8);
    wb.endFill();

    // Tray at bottom
    wb.beginFill(WHITEBOARD_FRAME);
    wb.drawRect(10, wbHeight - 2, 30, 6);
    wb.endFill();

    // Marker in tray
    wb.beginFill(0x2244aa);
    wb.drawRect(15, wbHeight + 2, 15, 3);
    wb.endFill();

    // Some fake writing lines
    wb.lineStyle(1, 0xcccccc, 0.5);
    for (let i = 0; i < 4; i++) {
      wb.moveTo(15, 20 + i * 15);
      wb.lineTo(wbWidth - 15, 20 + i * 15);
    }

    wb.x = 400;
    wb.y = 50;
    this.addChild(wb);
  }

  getOfficeBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
    return {
      minX: WALL_THICKNESS + 20,
      maxX: OFFICE_WIDTH - WALL_THICKNESS - 20,
      minY: WALL_THICKNESS + 20,
      maxY: OFFICE_HEIGHT - WALL_THICKNESS - 20,
    };
  }
}
