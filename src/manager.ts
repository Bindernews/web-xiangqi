
import {Board, Side} from './model.ts';

const MAX_SAFE_INTEGER = 9007199254740991;

class Random {
    static randInt(min : number = 0, max : number = MAX_SAFE_INTEGER) : number {
        var diff = max - min;
        return Math.floor(Math.random() * diff) + min;
    }
}

/**
 * All the information about the game itself.
 */
class XiangqiGame {

    /**
     * Constructs a new Xiangqi game.
     * 
     * @param board reference to the board to use
     * @param code the game code
     */
    constructor(public board : Board, private _code : string) {
    }

    get code() : string {
        return this._code;
    }

}

/**
 * Manage every instance of the game which is being played.
 * 
 */
class Manager {

    private static HEX_DIGITS : string = "0123456789abcdef";

    /**
     * Map of game codes to their respective games.
     */
    private _gameList = {};

    /**
     * Generate a new unique game code.
     * Game codes are currently 10 hex digits.
     */
    generateGameCode() : string {
        const CODE_LENGTH = 10;
        var code = "";
        for (var i = 0; i < CODE_LENGTH; i++) {
            code += Manager.HEX_DIGITS.charAt(Random.randInt(0, Manager.HEX_DIGITS.length));
        }
        return code;
    }
}
