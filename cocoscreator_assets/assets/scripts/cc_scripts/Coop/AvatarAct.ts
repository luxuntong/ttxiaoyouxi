const {ccclass, property} = cc._decorator;
var AVATAR_STATE = require("gameconst");
const SDD = require("single_data");
var KBEngine = require("kbengine");
const ITEMD = require("item_data");

@ccclass
export class NewClass extends cc.Component {
    @property(cc.Node)
    private pickTouchRange: cc.Node = null;

    @property(cc.Node)
    private stateControl: cc.Node = null;

    @property(cc.Node)
    protected world: cc.Node = null;

    protected startPos: cc.Vec2 = null;

    protected trueWidth = 0;
    protected trueHeight = 0;
    protected isPlayer:boolean = false;
    protected eid: number = 0;
    protected pressCost: number = 0;

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
        if (other.name.startsWith("debuff")){
            other.node.fatherObj.item = null;
            other.node.destroy();
            this.getItem();
            return;
        }
    }
    protected getItem(){
        var itemType = 0;
        console.log(itemType, ITEMD.flat_narrow);
        if (itemType == ITEMD.flat_narrow){
            this.world.pushAction(itemType);
        }
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
        this.initSize();
        this.installEvents();
        this.reset();
    }

    onDestroy(){

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
        }
        else {
		    KBEngine.Event.register("otherAvatarOnJump", this, "otherAvatarOnJump");
        }
    }

    protected otherAvatarOnJump(eid, pressCount){
        console.log('ckz: other jump:', eid, pressCount);
        if (eid != this.eid){
            KBEngine.ERROR_MSG('eid wrong ' + eid + ' ' + this.eid);
            return;
        }
        this.stateControl.setState(AVATAR_STATE.storage);
        this.stateControl.setState(AVATAR_STATE.fly);
        this.doJump(pressCount);
    }
    
    protected onMouseDown (event){
        this.stateControl.printState();
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
        console.log("ckz press", this.pressCost);
        this.doJump(this.pressCost);
        let player = KBEngine.app.player();
        if(player != undefined && player.inWorld && player.id == this.eid) {
            player.jump(this.pressCost);
        }
    }
    protected doJump(pressCount) {
        if (pressCount > 1500){
            pressCount = 1500;
        }
        pressCount += 200;
        let angle = 40 * Math.PI / 180;
        let xSpeed = pressCount * Math.sin(angle);
        let ySpeed = pressCount * Math.cos(angle);
        this.yA = this.node.y;
        this.yB = ySpeed / 1000;
        this.yC = - SDD.gravity / 1000000;
        this.xA = this.node.x;
        this.xB = xSpeed / 1000;
        let tCost = - this.yB / this.yC;
        this.finalX = this.xA + tCost * this.xB;
        this.curIndex = this.world.getFlatIndex(this.finalX);
        this.releaseTime = (new Date()).valueOf();

    }
    protected completed (isWin){
        this.world.onCompleted(isWin);
    }
    public reset() {
        console.log("ckz entity reset:", this.eid);
        this.node.x = this.startPos.x;
        this.node.y = this.startPos.y + this.trueHeight / 2;
        console.log('ckz: player now:', this.startPos, this.trueHeight, this.node);
        this.stateControl.reset();
    }
    protected update (dt){
        if (this.stateControl.getState(AVATAR_STATE.fly)){
            var tCost = (new Date()).valueOf() - this.releaseTime;
            var y = this.yA + this.yB * tCost + this.yC * tCost * tCost;
            var x = this.xA + tCost * this.xB;
            if (this.curIndex != -1 && y < this.yA){
                this.node.y = this.yA;
                this.node.x = this.finalX;
                
                this.stateControl.setState(AVATAR_STATE.idle);
                this.world.onPlayerLanded(this.curIndex);
            }
            else{
                this.node.y = y;
                this.node.x = x;
            }
        }

        if (this.node.y < -200){
            this.completed(false);
        }
    }
    // update (dt) {},
}