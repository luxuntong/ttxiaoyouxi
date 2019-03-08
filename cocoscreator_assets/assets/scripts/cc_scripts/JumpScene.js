cc.Class({
    extends: cc.Component,

    properties: {
        camera: {
            default: null,
            type: cc.Camera,
        },

        cameraControl: {
            default: null,
            type: cc.Node,
        },

        player: {
            default: null,
            type: cc.Node,
        }
        // 主角跳跃高度
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
    onLoad: function(){
        this.cameraControl = this.camera.getComponent("JumpCamera");

    },
    onPlayerEnter: function(player){
        this.cameraControl.setTarget(player);
    },
    onMouseDown: function(event){
        console.log("ckz scene down", event);
    }
    // update (dt) {},
});