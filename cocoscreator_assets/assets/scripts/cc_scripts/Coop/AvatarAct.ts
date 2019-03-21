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
    private world: cc.Node = null;

    private trueWidth = 0;
    private trueHeight = 0;
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
    
    // LIFE-CYCLE CALLBACKS:

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

    public init() {
        this.initSize();
        this.initComp();
        this.installEvents();
        this.reset();
    }

    protected initComp (){
        this.pickTouchRange = cc.find("touchRange");
        this.world = cc.find("World").getComponent("JumpScene");
        this.stateControl = this.node.getComponent("AvatarState");
    }

    protected initSize (){
        this.node.scaleX = SDD.avatar_scale_x;
        this.node.scaleY = SDD.avatar_scale_y;
        this.trueWidth = this.node.scaleX * this.node.width;
        this.trueHeight = this.node.scaleY * this.node.height;
    }

    protected installEvents (){
        this.pickTouchRange.on(cc.Node.EventType.TOUCH_START, this.onMouseDown, this);
        this.pickTouchRange.on(cc.Node.EventType.TOUCH_END, this.onMouseUp, this);
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

        var now = new Date();
        this.pressCost = now.valueOf() - this.pressTime;
        console.log("ckz press", this.pressCost);
        if (this.pressCost > 1500){
            this.pressCost = 1500;
        }
        this.pressCost += 200;
        var angle = 40 * Math.PI / 180;
        var xSpeed = this.pressCost * Math.sin(angle);
        var ySpeed = this.pressCost * Math.cos(angle);
        this.yA = this.node.y;
        this.yB = ySpeed / 1000;
        this.yC = - SDD.gravity / 1000000;
        this.xA = this.node.x;
        this.xB = xSpeed / 1000;
        var tCost = - this.yB / this.yC;
        this.finalX = this.xA + tCost * this.xB;
        this.curIndex = this.world.getFlatIndex(this.finalX);
        this.releaseTime = (new Date()).valueOf();
    }
    protected completed (isWin){
        this.world.onCompleted(isWin);
    }
    public reset() {
        KBEngine.DEBUG_MSG("ckz reset!")
        this.node.x = -475;
        this.node.y = this.world.getAvatarY() + this.trueHeight / 2;
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