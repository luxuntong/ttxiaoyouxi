const {ccclass, property} = cc._decorator;
import {NewClass as AvatarAct} from "../Coop/AvatarAct"
import {NewClass as SingleScene} from "../Single/SingleScene"
import {Flat} from "../Coop/Flat"
import {datas as SDD} from "../CONST/single_data"
import {datas as IDD} from "../CONST/item_data"

export class SingleEntity {
    private id;
    private position: cc.Vec2;
    private isPlayer: boolean;
    protected avatarRate;
    public avatarWidth;
    protected father: AvatarAct;
    protected world: SingleScene;
    protected myItems: object;
    protected curIndex: number;
    protected HP: number;

    constructor(id, pos: cc.Vec2, isPlayer, world: cc.Node) {
        this.id = id;
        this.position = pos;
        this.isPlayer = isPlayer;
        this.avatarRate = SDD.avatar_scale_x;
        this.avatarWidth = Math.floor(SDD.avatar_width * this.avatarRate);
        this.world = world.getComponent(SingleScene);
        this.HP = SDD.hp_max;
        this.myItems = {};
        this.curIndex = 0;
    }

    public useItem(itemIndex, eid) {
        let itemObj = this.myItems[itemIndex];
        let enemyEnt = this.world.getEnemy(this.id);
        let curIndex = enemyEnt.getComponent(AvatarAct).getCurIndex();
        this.world.onUseItemRet(this.id, itemIndex, itemObj.itemType, curIndex + 1);
        delete this.myItems[itemIndex];
    }

    protected autoJump() {
        console.log('auto jump');
        let flat = this.world.getFlatByIndex(this.curIndex + 1).getComponent(Flat);
        let range = flat.getLandRange();
        let angle = 40 * Math.PI / 180;
        let start = (range[0] - this.father.node.x) / Math.sin(angle) * SDD.gravity / Math.cos(angle)
        start = Math.round(Math.sqrt(start));

        let end = (range[1] - this.father.node.x) / Math.sin(angle) * SDD.gravity / Math.cos(angle)
        end = Math.round(Math.sqrt(end));
        let ranValue = Math.random();

        let press = Math.floor(ranValue * start + (1 - ranValue) * end);
        this.father.aiJump(press);

        let that = this;
        this.father.setTimer(5, function() {
            that.autoJump();
        });
    }

    public jump(pressCost, pos, curIndex){
        if (curIndex == -1) {
            let relivePosX = this.world.getRelivePos(this.curIndex + 1);
            this.father.onGetRelivePos(this.id, [relivePosX, 0]);
            console.log(this.father.tCost);
            let that = this;
            this.father.setTimer(this.father.tCost / 1000, function() {
                that.modifyHP(-1);
            });
            this.curIndex += 1;
        }
        else{
            this.curIndex = curIndex;
            this.father.onJumpResult(this.id, true);
        }
    }

    protected modifyHP(delta) {
        this.HP += delta;
        this.father.onModifyHp(this.id, this.HP);
        if (this.HP <= 0) {
            this.world.onDead(this.id);
        }
    }

    public getItem(index) {        
        for (let i = 0; i < SDD.my_item_max; i++) {
            if (!(i in this.myItems)){
                this.myItems[i] = {
                    itemType: IDD.flat_narrow
                };
                this.world.onGetItem(this.id, index, i);
                return;
            }
        }
        
        this.world.onGetItem(this.id, index, -1);
    }

    public setFather(father: cc.Node) {
        this.father = father.getComponent(AvatarAct);
        if (!this.isPlayer) {
            let that = this;
            this.father.setTimer(1, function() {
                that.autoJump();
            });
        }
    }
}