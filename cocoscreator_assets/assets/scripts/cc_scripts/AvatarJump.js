cc.Class({
    extends: cc.Component,

    properties: {
        // 主角跳跃高度
        jumpHeight: 0,
        // 主角跳跃持续时间
        jumpDuration: 0,
        // 最大移动速度
        maxMoveSpeed: 0,

        pickTouchRange: {
            default: null,
            type: cc.Node,
        },

        world: {
            default: null,
            type: cc.Node,
        }
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    onKeyDown: function (event) {
        console.log("key:", event);
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                console.log('Press a key');
                break;
        }
    },
    
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    setJumpAction: function () {
        // 跳跃上升
        var jumpUp = cc.moveBy(this.jumpDuration, cc.v2(200, this.jumpHeight)).easing(cc.easeCubicActionOut());
        // 下落
        var jumpDown = cc.moveBy(this.jumpDuration, cc.v2(200, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        // 不断重复
        return cc.sequence(jumpUp, jumpDown);
    },

    start () {
        console.log("ckz start");
        this.pickTouchRange = cc.find("touchRange");
        console.log("ckz pick:", this.pickTouchRange);
        this.pickTouchRange.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.pickTouchRange.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);
        this.world = cc.find("World").getComponent("JumpScene");
        this.xSpeed = 0;
        this.notifyPlayerIn();
    },
    notifyPlayerIn: function(){
        this.world.onPlayerEnter(this.node);
    },
    onMouseDown: function(event){
        console.log("ckz onMouseDown");
        
        this.node.runAction(this.setJumpAction());
        this.xSpeed = 200;
    },
    onMouseUp: function(event){
        this.xSpeed = 0;
    },
    update: function(dt){
        this.node.x += this.xSpeed * dt;
    }
    // update (dt) {},
});