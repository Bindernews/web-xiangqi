

/**
 * Game piece sides. There are only two.
 */
export enum Side {
    NORTH,
    SOUTH
}

export enum PieceType {
    GENERAL,
    ADVISOR,
    ELEPHANT,
    HORSE,
    CHARIOT,
    CANNON,
    SOLDIER
}

/**
 * A location on the game board.
 */
export class Point {
    constructor(public x : number,
                public y : number) {
    }

    /**
     * this += other
     * 
     * Returns this point.
     */
    add(other : Point) : Point {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    isOnBoard(board : Board) : boolean {
        return board.isOnBoard(this.x, this.y); 
    }
}

/**
 * State of the board.
 */
export class Board {

    // Constants
    public static BOARD_WIDTH = 9;
    public static BOARD_HEIGHT = 10;
    public static PALACE_HEIGHT = 3;

    private _width : number;
    private _height : number;
    private _midX : number;
    private _midY : number;
    private _grid : GamePiece[][];

    constructor() {
        this._width = Board.BOARD_WIDTH;
        this._height = Board.BOARD_HEIGHT;
        this._midX = Math.ceil(this.width / 2);
        this._midY = Math.ceil(this.height / 2);

        this._grid = [];

        // fill in grid with nulls
        for (var y = 0; y < this.height; y++) {
            var row = [];
            for (var x = 0; x < this.width; x++) {
                row[x] = null;
            }
            this._grid[y] = row;
        }
    }

    /**
     * Getter for the size of the game board.
     */
    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    /**
     * Get the piece at location (x,y) on the game board.
     */
    getPieceAt(x : number, y : number) {
        if (!this.isOnBoard(x, y)) {
            return null;
        }
        return this._grid[y][x];
    }

    /**
     * Returns the piece at the location of p on the game board, or null if there is nothing
     * at that point. Also returns null if p is null or the point is not on the board.
     */
    getPieceAtPoint(p : Point) {
        if (p === null) {
            return null; 
        } else {
            return this.getPieceAt(p.x, p.y);
        }
    }

    /**
     * Return true if the given coordinates are inside a palace, false otherwise.
     */
    isInsidePalace(x : number, y : number) : boolean {
        return this.isOnBoard(x, y)
                && x >= this._midX - 1 && x <= this._midX + 1
                && (y <= Board.PALACE_HEIGHT || y >= this.height - Board.PALACE_HEIGHT);
    }

    /**
     * Return true if the piece is on the north side of the board (y < half)
     * false if it's on the south side (y > half).
     */
    isNorth(y : number) : boolean {
        return y < this._midY; 
    }

    /**
     * Return true if the point is on the board, false otherwise.
     */
    isOnBoard(x : number, y : number) : boolean {
        return x >= 0 && x <= this.width && y >= 0 && y <= this.height;
    }

    /**
     * Helper method which finds the location of the next piece starting from the given coordinates
     * and going south.
     */
    nextOccupiedSouth(x : number, y : number) : Point {
        for (var iy = y; iy < this.height; iy++) {
            if (this.getPieceAt(x, iy) != null) {
                return new Point(x, iy);
            }
        }
    }

    /**
     * Helper method which finds the location of the next piece starting from the given coordinates
     * and going north.
     */
    nextOccupiedNorth(x : number, y : number) : Point {
        for (var iy = y; iy >= 0; iy--) {
            if (this.getPieceAt(x, iy) != null) {
                return new Point(x, iy);
            }
        }
    }

    /**
     * Find and return the next occupied point. Each iteration changes by `delta` and it ends
     * if it reaches `end`.
     * 
     * An example call would be something like nextOccupied(1, 2, new Point(-1, 0), new Point(0, 2));
     * which would find the next occupied location to the west of (1, 2).
     */
    nextOccupied(x : number, y : number, delta : Point, end : Point) {
        var current = new Point(x, y);
        while (current.x != end.x || current.y != end.y) {
            if (this.getPieceAtPoint(current) != null) {
                return current;
            }
            current.add(delta);
        }
        return null;
    }

}

/**
 * Each piece type implements MoveCallback in order to provide the list of possible move for that
 * piece. These must be on the board but do NOT have to check for friendly or enemy pieces at the
 * given locations unless that changes the list of possible moves (like a pawn in Western Chess).
 */
interface MoveCallback {
    (board : Board, side : Side, pos : Point) : Point[];
}

/**
 * Class for all game pieces. A GamePiece instance describes ALL game pieces of that type.
 * (ie. a NORTH SOLDIER is actually ALL NORTH SOLDIERs). No data specific to a given game
 * should be stored as part of the piece. 
 */
export class GamePiece {

    constructor(public side : Side, public type : PieceType, private moveCallback : MoveCallback) {
    }

    /**
     * Get all moves which are on this board.
     */
    getMovesOnBoard(board : Board, pos : Point) : Point[] {
        var points = this.moveCallback(board, this.side, pos);

        // filter out points which are not on the board.
        var finalPoints = [];
        for (var point of points) {
            if (point.isOnBoard(board)) {
                finalPoints.push(point);
            }
        }
        return finalPoints;
    }

    /**
     * Return true if this piece can move to the point. 
     */
    isPointValid(board : Board, point : Point) : boolean {
        var pieceAt : GamePiece = board.getPieceAtPoint(point);
        return pieceAt == null || pieceAt.side != this.side;
    }

}

/**
 * Contains the move callbacks for every different class.
 */
export class MoveChecker {

    // Possible relative moves for the general
    private static GENERAL_MOVES = [
        new Point(-1, -1),
        new Point(0, -1),
        new Point(1, -1),
        new Point(-1, 0),
        new Point(1, 0),
        new Point(-1, 1),
        new Point(0, 1),
        new Point(1, 1)
    ];

    // Possible relative moves for the advisor/guard
    private static ADVISOR_MOVES = [
        new Point(-1, -1),
        new Point(1, -1),
        new Point(-1,  1),
        new Point(1,  1)
    ];

    // The elephant moves 2 spaces diagonally and can't jump intervening pieces.
    // Each array specifies a series of points, the last of which is the actual movement point.
    // If any of the previous points are blocked the elephant can't move there.
    private static ELEPHANT_MOVES = [
        [new Point(-1, -1), new Point(-2, -2)],
        [new Point(1, -1), new Point(2, -2)],
        [new Point(-1, 1), new Point(-2, 2)],
        [new Point(1, 1), new Point(2, 2)]
    ]

    // This data is similar to the elephant data but instead the final TWO points
    // are the actual moves. All points are specified in clockwise order.
    private static HORSE_MOVES = [
        [new Point(0, -1), new Point(-1, -2), new Point(1, -2)],
        [new Point(1, 0), new Point(2, -1), new Point(2, 1)],
        [new Point(0, 1), new Point(-1, 2), new Point(1, 2)],
        [new Point(-1, 0), new Point(-2, -1), new Point(-2, 1)]
    ]

    private static DELTA_EAST = new Point(1, 0);
    private static DELTA_WEST = new Point(-1, 0);

    /**
     * Gives all valid moves for a general.
     */
    static moveGeneral(board : Board, side : Side, pos : Point) : Point[] {
        // Possible moves are points inside the palace, and the flying general
        var moves = [];

        // First check moves inside the palace
        for (var offset of MoveChecker.GENERAL_MOVES) {
            var px = pos.x + offset.x;
            var py = pos.y + offset.y;
            if (board.isInsidePalace(px, py)) {
                moves.push(new Point(px, py));
            }
        }

        // Now check for flying general move
        var flyingPoint = null;
        if (board.isNorth(pos.y)) {
            flyingPoint = board.nextOccupiedSouth(pos.x, pos.y);
        } else {
            flyingPoint = board.nextOccupiedNorth(pos.x, pos.y);
        }
        var piece = board.getPieceAtPoint(flyingPoint);
        if (piece != null && piece.type == PieceType.GENERAL && piece.side != side) {
            moves.push(flyingPoint);
        }
        return moves;
    }

    /**
     * Gives all valid moves for the advisor.
     */
    static moveAdvisor(board : Board, side : Side, pos : Point) : Point[] {
        // Possible moves are diagonally inside the palace
        var moves = [];

        // First check moves inside the palace
        for (var offset of MoveChecker.ADVISOR_MOVES) {
            var px = pos.x + offset.x;
            var py = pos.y + offset.y;
            if (board.isInsidePalace(px, py)) {
                moves.push(new Point(px, py));
            }
        }
        return moves;
    }

    static moveElephant(board : Board, side : Side, pos : Point) : Point[] {
        return MoveChecker.interveningPointsMove(board, side, pos, MoveChecker.ELEPHANT_MOVES, 1);
    }

    static moveHorse(board : Board, side : Side, pos : Point) : Point[] {
        return MoveChecker.interveningPointsMove(board, side, pos, MoveChecker.HORSE_MOVES, 2);
    }

    static moveChariot(board : Board, side : Side, pos : Point) : Point[] {
        // The chariot moves exactly like the Rook in western chess: orthagonally in any direction
        // until it hits the edge or another piece (or it can stop in the middle).
        // After checking each direction we then add the final point to the list if it has another
        // piece there.

        var moves = [];
        var ix = 0, iy = 0;
        // Are we using four for loops? Yes, yes we are.

        // North
        for (iy = pos.y; iy >= 0 && board.getPieceAt(pos.x, iy) == null; iy--) {
            moves.push(new Point(pos.x, iy));
        }
        MoveChecker.addPointIfFilled(board, moves, pos.x, iy);

        // East
        for (ix = pos.x; ix < board.width && board.getPieceAt(ix, pos.y) == null; ix++) {
            moves.push(new Point(ix, pos.y));
        }
        MoveChecker.addPointIfFilled(board, moves, ix, pos.y);

        // South
        for (iy = pos.y; iy < board.height && board.getPieceAt(pos.x, iy) == null; iy++) {
            moves.push(new Point(pos.x, iy));
        }
        MoveChecker.addPointIfFilled(board, moves, pos.x, iy);

        // West
        for (ix = pos.x; ix >= 0 && board.getPieceAt(ix, pos.y) == null; ix--) {
            moves.push(new Point(ix, pos.y));
        }
        MoveChecker.addPointIfFilled(board, moves, ix, pos.y);

        return moves;
    }

    static moveCannon(board : Board, side : Side, pos : Point) : Point[] {
        // Cannon moves much like the chariot but can only CAPTURE after jumping another piece.
        // This annoys me to no end.
        // After we check each direction we see if there is another occupied space AFTER that one.
        // It's complicated, sorry. 

        var moves = [];
        var ix = 0, iy = 0;
        // This stores the "next occupied" point after each for loop.
        var occupied : Point = null;
        // Are we using four for loops? Yes, yes we are.

        // North
        for (iy = pos.y; iy >= 0 && board.getPieceAt(pos.x, iy) == null; iy--) {
            moves.push(new Point(pos.x, iy));
        }
        occupied = board.nextOccupiedNorth(pos.x, iy - 1);
        MoveChecker.addPointIfPointFilled(board, moves, occupied);

        // East
        for (var ix = pos.x; ix < board.width && board.getPieceAt(ix, pos.y) == null; ix++) {
            moves.push(new Point(ix, pos.y));
        }
        occupied = board.nextOccupied(ix + 1, pos.y, MoveChecker.DELTA_EAST, new Point(board.width, pos.y));
        MoveChecker.addPointIfPointFilled(board, moves, occupied);

        // South
        for (var iy = pos.y; iy < board.height && board.getPieceAt(pos.x, iy) == null; iy++) {
            moves.push(new Point(pos.x, iy));
        }
        occupied = board.nextOccupiedSouth(pos.x, iy + 1);
        MoveChecker.addPointIfPointFilled(board, moves, occupied);

        // West
        for (var ix = pos.x; ix >= 0 && board.getPieceAt(ix, pos.y) == null; ix--) {
            moves.push(new Point(ix, pos.y));
        }
        occupied = board.nextOccupied(ix - 1, pos.y, MoveChecker.DELTA_EAST, new Point(0, pos.y));
        MoveChecker.addPointIfPointFilled(board, moves, occupied);

        return moves;
    }

    static moveSoldier(board : Board, side : Side, pos : Point) : Point[] {
        // Remember that soldiers can only move forward until they reach the other side of the
        // river at which point they can also move side to side. It least they're less confusing
        // than pawns.

        var moves = [];
        var isOppositeSide = false;

        // If we're NORTH move south, otherwise move north
        if (side == Side.NORTH) {
            if (pos.y < board.height - 1) {
                moves.push(new Point(pos.x, pos.y + 1));
            }
            isOppositeSide = !board.isNorth(pos.y);
        } else {
            // Coming UP from the south side
            if (pos.y > 0) {
                moves.push(new Point(pos.x, pos.y - 1));
            }
            isOppositeSide = board.isNorth(pos.y);
        }
        if (isOppositeSide) {
            // If we're on the opposite side we can move left and right
            if (pos.x > 0) {
                moves.push(new Point(pos.x - 1, pos.y));
            }
            if (pos.x < board.width - 1) {
                moves.push(new Point(pos.x + 1, pos.y));
            }
        }

        return moves;
    }

    /**
     * Process move data for elephants and horses. The format of the data is an array of arrays
     * of points. For a list of points with length L we check that all (L - endPoints) are free.
     * The final points are then added to the resulting list of possible moves assuming they are
     * also on the board.
     * 
     * NOTE: A free point is both on the board and does not contain another unit. 
     */
    private static interveningPointsMove(board : Board, side : Side, pos : Point, data : Point[][],
                                        endPoints : number) : Point[]
    {    
        var moves = [];
        for (var pointList of MoveChecker.ELEPHANT_MOVES) {
            var i  = 0;
            var valid = false;
            for (; i < pointList.length - endPoints; i++) {
                if (board.getPieceAt(pos.x + pointList[i].x, pos.y + pointList[i].y) != null) {
                    valid = false;
                    break;
                }
            }
            if (!valid) {
                break;
            }
            for (; i < pointList.length; i++) {
                var px = pos.x + pointList[i].x;
                var py = pos.y + pointList[i].y;
                if (board.isOnBoard(px, py)) {
                    moves.push(new Point(px, py));
                }
            }
        }
        return moves;
    }

    /**
     * Add the given point on the board to the list of possible moves only if there is another
     * piece located at that position.
     */
    private static addPointIfFilled(board : Board, moves : Point[], x : number, y : number) {
        if (board.getPieceAt(x, y) != null) {
            moves.push(new Point(x, y));
        }
    }

    /**
     * Add the given point on the board to the list of possible moves only if there is another
     * piece located at that position.
     */
    private static addPointIfPointFilled(board : Board, moves : Point[], pt : Point) {
        if (pt != null && board.getPieceAtPoint(pt) != null) {
            moves.push(new Point(pt.x, pt.y));
        }
    }
}
