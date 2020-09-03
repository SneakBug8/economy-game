import { Player } from './player';
import { Province } from './provinces/Province';

class GameState {
    players: Player[];
    provinces: Province[];
}

export const state = new GameState();
