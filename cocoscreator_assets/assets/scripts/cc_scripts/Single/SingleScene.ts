const {ccclass, property} = cc._decorator;
import {NewClass as CoopScene} from "../Coop/CoopScene"
import {SingleEntity} from "./SingleEntity"
import {Flat} from "../Coop/Flat"
import {datas as SDD} from "../CONST/single_data"

@ccclass
export class NewClass extends CoopScene {
    protected init () {
        this.seed = Math.round(Math.random() * 1000);
    }

    protected initEntities() {
        let startPos = cc.v2(SDD.avatar_start_pos_x, SDD.avatar_scale_y);
        let entity = new SingleEntity(0, startPos, false, this.node);
        entity.setFather(this._createEntity(entity, null, false));
        

        entity = new SingleEntity(1, startPos, true, this.node);
        entity.setFather(this._createEntity(entity, this.pickTouchRange, true));
    }

    public getRelivePos(index) {
        console.log(index, this.flats);
        return this.flats[index].getComponent(Flat).getRelivePos();
    }

    public onDead(id) {
        for (let eid in this.entities) {
            if (eid != id) {
                this.onJumpCompleted(eid);
            }
        }
    }

    protected onReturnClick() {
        cc.director.loadScene("HallScene", () =>{
            console.log('load hall finished!');
        });
        this.unInstallEvents();
    }

    public getEnemy(eid) {
        for (let id in this.entities) {
            if (id != eid) {
                return this.entities[id];
            }
        }
    }
}