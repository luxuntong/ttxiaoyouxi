const {ccclass, property} = cc._decorator;
import {NewClass as CoopScene} from "../Coop/CoopScene"

@ccclass
export class NewClass extends CoopScene {
    protected init () {
        this.seed = Math.round(Math.random() * 1000);
    }

    protected initEntities() {

    }
}