
import {Point, Board, Side} from './model';

const SERVER_HOST = "//"

/**
 * Interface for all client operations. A game client translates a given move to an IClient
 * method and calls the method. The two primary implementations of IClient are LocalClient
 * which is for local games and NetworkClient which implement remote games.
 */
interface IClient {

    move(from : Point, to : Point);

    callback(event : string, cb : Function);

    /**
     * Allows client adapter to start doing things.
     */
    start();

    /**
     * Tells the client adapter it needs to stop, close connections, release resources, etc.
     */
    stop();
}

class LocalClient implements IClient {

    private _callbacks = {};

    constructor(private board : Board, public side : Side) {
    }

    move(from : Point, to : Point) {
        // TODO implement moving pieces
    }

    callback(event : string, cb : Function) {
        this._callbacks[event] = cb;
    }

    start() {
    }

    stop() {
    }
}

class NetworkClient implements IClient {

    private side : Side;
    private gameCode : string;
    private authCode : string;
    private _callbacks = {};

    constructor() {}

    move(from : Point, to : Point) {
        // TODO implement network behaviour
    }

    callback(event : string, cb : Function) {
        this._callbacks[event] = cb;
    }

    start() {
        // Here we connect to the server, receive the game code and auth code.

    }

    stop() {
        // Tell server we are disconnecting.
    }
}
