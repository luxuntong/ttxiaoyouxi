const {ccclass, property} = cc._decorator;
import {datas as SDD} from "../CONST/single_data"
import {NewClass as CoopScene} from "../Coop/CoopScene"
import {datas as RIDD} from "../CONST/random_index_data";
import {State} from "../Jump/AvatarState"
import {STATE_CONFLICT as actionConflict} from "../CONST/conflict_action"
import {datas as ActionState} from "../CONST/conflict_action_state"

@ccclass
export class Flat extends cc.Component {
    protected index: number = 0;
    protected world: CoopScene = null;
    protected item: cc.Node = null;
    protected actionState: State = null;

    protected randomFromIndex(index) {
        return this.world.randomWithIndex(this.index * SDD.random_range + index);
    }

    protected centerRandom(center, diameter, randomValue) {
        let radius = diameter / 2;
        return center - radius + diameter * randomValue
    }

    public init(index: number, world: CoopScene, itemPrefab: cc.Prefab, actionState: State) {
        this.index = index;
        this.world = world;
        this.actionState = actionState;
        let x = SDD.flat_start + index * SDD.flat_spacing;

        if (index) {
            x = this.centerRandom(x, SDD.flat_x_random_range, this.randomFromIndex(RIDD.flat_posx));
        }
        let pos = cc.v2(x, SDD.flat_y)
        this.node.setPosition(pos);
        this.node.scaleX = 1 + SDD.flat_random_width * this.randomFromIndex(RIDD.flat_scalex);
        if (this.actionState && this.actionState.getState(ActionState.flatNarrow)) {
            this.node.scaleX *= 0.5;
        }

        this.randomItem(pos, itemPrefab);
    }

    protected getSurfaceHigh() {
        return this.node.y + this.node.scaleY * this.node.height / 2;
    }

    protected randomItem(pos, itemPrefab: cc.Prefab) {
        if (this.actionState && this.actionState.getState(ActionState.noItem)) {
            console.log('this flat not item:' ,this.index);
            return;
        }

        if (this.randomFromIndex(RIDD.has_item) < SDD.item_create_prob) {
            let flatWidth = this.node.scaleX * this.node.width;
            let newItem = cc.instantiate(itemPrefab);
            newItem.scaleX = SDD.item_scale_x;
            newItem.scaleY = SDD.item_scale_y;
            let x = this.centerRandom(pos.x, flatWidth, this.randomFromIndex(RIDD.item_posx));
            let y = this.getSurfaceHigh() + newItem.height * newItem.scaleY / 2;
            newItem.setPosition(cc.v2(x, y));
            this.node.addChild(newItem);
            this.item = newItem;
            newItem['fatherObj'] = this;
        }
    }

    public setState(stateValue) {
        if (this.actionState == null) {
            this.actionState = new State(actionConflict);
        }

        if (this.actionState.setState(stateValue)) {
            switch(stateValue) {
            case ActionState.noItem:
                this.destoryItem();
                break;
            case ActionState.flatNarrow:
                this.node.scaleX *= 0.5;
                break;
            }
        }
    }

    public destoryItem() {
        if (this.item) {
            this.item.destroy();
            this.item = null;
        }
    }

    public isOnMe(x) {
        let half = this.node.scaleX * this.node.scaleX / 2;
        if ((this.node.x - half <= x) && (this.node.x + half >= x)) {
            return true;
        }

        return false;
    }
}