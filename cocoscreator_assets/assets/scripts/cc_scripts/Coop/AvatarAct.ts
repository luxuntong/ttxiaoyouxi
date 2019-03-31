const {ccclass, property} = cc._decorator;
var KBEngine = require("kbengine");
import {datas as AVATAR_STATE} from "../CONST/conflict_data_state";
import {datas as ITEMD} from "../CONST/item_data"
import {datas as SDD} from "../CONST/single_data";
import {NewClass as CoopScene} from "./CoopScene"
import {AvatarState} from "../Jump/AvatarState"

const ActionType = {
    jump: 0
}

@ccclass
export class NewClass extends cc.Component {
    @property(cc.Node)
    private pickTouchRange: cc.Node = null;

    @property(cc.Node)
    private stateControl: AvatarState = null;

    @property(cc.Node)
    protected world: CoopScene = null;

    protected startPos: cc.Vec2 = null;

    protected trueWidth = 0;
    protected trueHeight = 0;
    protected isPlayer:boolean = false;
    public eid: number = 0;
    protected pressCost: number = 0;
    protected yA: number = 0;
    protected yB: number = 0;
    protected yC: number = 0;
    protected xA: number = 0;
    protected xB: number = 0;
    protected finalPos: cc.Vec2 = null;
    public curIndex: number = 0;
    protected releaseTime = 0;
    protected actionList: Array<any> = null;
    protected wiatJumpFlag = false;
    protected pressTime: number = 0;
    protected curBackIndex: number = 0;
    protected relivePos = null;
    protected HP = SDD.hp_max;
    protected hpNode:cc.Node = null;


    onDestroy() {
        console.log("ckz avatar destroy");
        this.unInstallEvents();
    }
    protected onKeyDown(event) {
        console.log("key:", event);
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                console.log('Press a key');
                break;
            case cc.macro.KEY.space:
                break;
        }
    }

    public setEid(eid){
        this.eid = eid;
    }
    
    // LIFE-CYCLE CALLBACKS:

    public setStartPos(pos){
        this.startPos = pos;
    }

    // onLoad () {},
    protected onCollisionEnter(other, self){
        console.log('get item:', other, self)
        if (other.name.startsWith("debuff")){
            let player = KBEngine.app.player();
            if(player != undefined && player.inWorld && player.id == this.eid) {
                player.getItem(other.node.fatherObj.index);
            }
        }
    }

    public isMe(eid) {
        return eid == this.eid;
    }
    protected onJumpReset(eid) {
        console.log('on reset ', eid);
        if (eid != this.eid) {
            return;
        }
        this.completed(false);
    }
    protected onGetItem(eid, flatIndex) {
        console.log('on get item:', eid, flatIndex);
        var itemType = 0;
        console.log(itemType, ITEMD.flat_narrow);
        if (itemType == ITEMD.flat_narrow){
        }
        //this.world.onGetItem(flatIndex);
    }
    public setNode(world, pickTouchRange, stateCtl){
        this.world = world;
        this.pickTouchRange = pickTouchRange;
        this.stateControl = stateCtl;
    }
    public setIsPlayer(isPlayer){
        this.isPlayer = isPlayer;
    }

    public init() {
        this.actionList = new Array();
        this.initSize();
        this.installEvents();
        this.initItems();
        this.initHP();
        this.reset();
    }

    protected initHP() {
        this.hpNode = new cc.Node();
        let label = this.hpNode.addComponent(cc.Label);
        this.HP = SDD.hp_max;
        label.string = "HP:" + this.HP;
        label.fontSize = 80;
        label.lineHeight = 100;
        this.node.addChild(this.hpNode);
        this.hpNode.y = 200;
        this.hpNode.height = 100;
    }

    protected initItems() {
    }

    protected initSize (){
        this.node.scaleX = SDD.avatar_scale_x;
        this.node.scaleY = SDD.avatar_scale_y;
        this.trueWidth = this.node.scaleX * this.node.width;
        this.trueHeight = this.node.scaleY * this.node.height;
    }

    protected installEvents (){
        if (this.isPlayer){
            this.pickTouchRange.on(cc.Node.EventType.TOUCH_START, this.onMouseDown, this);
            this.pickTouchRange.on(cc.Node.EventType.TOUCH_END, this.onMouseUp, this);
            KBEngine.Event.register("onJumpResult", this, "onJumpResult");
            KBEngine.Event.register("onJumpReset", this, "onJumpReset");
        }
        else {
		    KBEngine.Event.register("otherAvatarOnJump", this, "otherAvatarOnJump");
        }
    }

    protected unInstallEvents() {
        if (this.isPlayer) {
            KBEngine.Event.deregister("onJumpResult", this, "onJumpResult");
            KBEngine.Event.deregister("onJumpReset", this, "onJumpReset");
        }
        else {
		    KBEngine.Event.deregister("otherAvatarOnJump", this, "otherAvatarOnJump");
        }
    }

    protected onJumpResult(eid, ret) {
        console.log('ckz jump result:', ret);
        if (eid != this.eid){
            KBEngine.ERROR_MSG('eid wrong ' + eid + ' ' + this.eid);
            return;
        }

        if (ret){
            this.wiatJumpFlag = false;
        }
        else {
            this.wiatJumpFlag = false;
            this.completed(false);
        }
    }

    protected otherAvatarOnJump(eid, pressCount, finalPos, curIndex){
        console.log('ckz: other jump:', eid, pressCount, finalPos, curIndex);
        if (eid != this.eid){
            KBEngine.ERROR_MSG('eid wrong ' + eid + ' ' + this.eid);
            return;
        }

        this.actionList.push({
            type: ActionType.jump,
            pressCount: pressCount,
            finalPos: finalPos,
            curIndex: curIndex
        });
        if (this.stateControl.getState(AVATAR_STATE.idle)) {
            this.doAction();
        }
    }

    public onGetRelivePos(eid, relivePos) {
        if (this.eid != eid) {
            KBEngine.ERROR_MSG("eid is wrong");
            return;
        }

        this.relivePos = relivePos;
        this.relive();
    }

    public onCompleted() {
        this.stateControl.setState(AVATAR_STATE.finish);
    }

    public onModifyHp(eid, hp) {
        if (this.eid != eid) {
            KBEngine.ERROR_MSG("eid is wrong");
            return;
        }
        this.HP = hp;
        this.hpNode.getComponent(cc.Label).string = "HP:" + hp;
    }

    protected relive() {
        if (this.relivePos == null) {
            return;
        }

        if (!this.stateControl.getState(AVATAR_STATE.waitResult)){
            return;
        }

        this.node.x = this.relivePos[0];
        this.node.y = this.startPos.y + this.trueHeight / 2;
        this.relivePos = null;
        this.stateControl.setState(AVATAR_STATE.idle);
        this.wiatJumpFlag = false;
    }

    protected doAction() {
        if (!this.actionList.length) {
            return;
        }
        let action = this.actionList.shift();
        switch (action.type) {
            case ActionType.jump:
                this.doJumpAction(action);
                break;
        }
        
    }

    protected doJumpAction(action) {
        this.stateControl.setState(AVATAR_STATE.storage);
        this.stateControl.setState(AVATAR_STATE.fly);
        this.doJump(action.pressCount);
        this.finalPos = cc.v2(action.finalPos[0], action.finalPos[1]);
        this.curIndex = action.curIndex;
    }

    
    protected onMouseDown (event){
        if (this.wiatJumpFlag) {
            KBEngine.ERROR_MSG("you not get jump flag!")
            return;
        }
        //this.stateControl.printState();
        if(!this.stateControl.setState(AVATAR_STATE.storage))
        {
            return;
        }
        var now = new Date();
        this.pressTime = now.valueOf();
    }
    protected onMouseUp (event){
        if(!this.stateControl.setState(AVATAR_STATE.fly))
        {
            return;
        }

        let now = new Date();
        this.pressCost = now.valueOf() - this.pressTime;
        this.pressCost = this.preDealPress(this.pressCost);
        //console.log("ckz press", this.pressCost);
        this.pressCost = this.doJump(this.pressCost);
        let player = KBEngine.app.player();
        this.wiatJumpFlag = true;
        if(player != undefined && player.inWorld && player.id == this.eid) {
            player.jump(this.pressCost, [this.finalPos.x, this.finalPos.y], this.curIndex);
        }
    }
    protected preDealPress(pressCost) {
        if (pressCost > 1500){
            pressCost = 1500;
        }
        return pressCost + 200;
    }

    protected doJump(pressCount) {
        let angle = 40 * Math.PI / 180;
        let xSpeed = pressCount * Math.sin(angle);
        let ySpeed = pressCount * Math.cos(angle);
        this.yA = this.node.y;
        this.yB = ySpeed / 1000;
        this.yC = - SDD.gravity / 1000000;
        this.xA = this.node.x;
        this.xB = xSpeed / 1000;
        let tCost = - this.yB / this.yC;
        let finalX = this.xA + tCost * this.xB;
        this.finalPos = cc.v2(finalX, this.yA);
        this.curIndex = this.world.getFlatIndex(finalX);
        this.releaseTime = (new Date()).valueOf();
        return pressCount;
    }
    protected completed (isWin){
        this.world.onCompleted(isWin);
    }
    public reset() {
        console.log("ckz entity reset:", this.eid);
        this.node.x = this.startPos.x;
        this.node.y = this.startPos.y + this.trueHeight / 2;
        this.curIndex = 0;
        console.log('ckz: player now:', this.startPos, this.trueHeight, this.node);
        this.stateControl.reset();
        this.initItems();
    }
    protected update (dt){
        let backIndex = this.world.getInWhichBack(this.node.x);
        if (backIndex != this.curBackIndex) {
            this.curBackIndex = backIndex;
            this.world.setBackByIndex(backIndex + 1);
        }

        if (this.stateControl.getState(AVATAR_STATE.fly)){
            if (this.node.y < -200) {
                return;
            }
            var tCost = (new Date()).valueOf() - this.releaseTime;
            var y = this.yA + this.yB * tCost + this.yC * tCost * tCost;
            var x = this.xA + tCost * this.xB;
            if (this.curIndex != -1 && y < this.yA){
                this.node.y = this.finalPos.y;
                this.node.x = this.finalPos.x;
                
                this.stateControl.setState(AVATAR_STATE.idle);
                this.world.onPlayerLanded(this.eid);
                this.doAction();
            }
            else{
                this.node.y = y;
                this.node.x = x;
            }

            if (this.node.y < -200){
                this.stateControl.setState(AVATAR_STATE.waitResult);
                this.relive();
            }
        }
    }
    // update (dt) {},
}