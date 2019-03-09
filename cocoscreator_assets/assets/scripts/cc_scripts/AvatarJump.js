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
        },

        inTheAir: {
            visiable: false,
            default: false,
        },
        isFall: {
            get(){
                return this._isfall;
            },
            set(value) {
                this._isfall = value;
            }
        },
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
            case cc.macro.KEY.space:
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
        var rotateWithUp = cc.rotateBy(this.jumpDuration / 2, 180);
        var rotateWithDown = cc.rotateBy(this.jumpDuration / 2, 180);
        return cc.sequence(cc.spawn(jumpUp, rotateWithUp), cc.spawn(jumpDown, rotateWithDown));
    },
    onCollisionEnter: function(){
        console.log("ckz on colli");
        this.isFall = false;
        this.rigid.gravityScale = 0;
        this.rigid.linearVelocity = cc.v2();

    },

    onSpacePressed: function() {
        this.inTheAir = true
        this.node.runAction(this.setJumpAction());
    },

    start () {
        console.log("ckz start");
        this.isFall = false;
        this.pickTouchRange = cc.find("touchRange");
        console.log("ckz pick:", this.pickTouchRange);
        this.pickTouchRange.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.pickTouchRange.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);
        this.pickTouchRange.on(cc.Node.EventType.TOUCH_START, this.onMouseDown, this);
        this.pickTouchRange.on(cc.Node.EventType.TOUCH_END, this.onMouseUp, this);
        this.world = cc.find("World").getComponent("JumpScene");
        this.xSpeed = 0;
        this.notifyPlayerIn();
        this.rigid = this.node.getComponent(cc.RigidBody);
    },
    notifyPlayerIn: function(){
        this.world.onPlayerEnter(this.node);
    },
    onMouseDown: function(event){
        var now = new Date();
        this.pressTime = now.valueOf();
    },
    onMouseUp: function(event){
        var now = new Date();
        this.pressCost = now.valueOf() - this.pressTime;
        console.log("ckz press", this.pressCost);
        if (this.pressCost > 2000){
            this.pressCost = 2000;
        }

        this.rigid.gravityScale = 1;
        this.rigid.linearVelocity = cc.v2(this.pressCost, 900);
        
    },
    reset: function(){
        this.rigid.gravityScale = 0;
        this.rigid.linearVelocity = cc.v2();
        this.node.x = -475;
        this.node.y = -67;
    },
    update: function(dt){
        if (this.node.y < -200){
            this.reset();
        }
    }
    // update (dt) {},
});