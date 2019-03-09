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
        },
        flatPrefab: {
            default: null,
            type: cc.Prefab
        },
        flatWidth: 0,
        gravity: 0,
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
        var flatStart = -480 + this.flatWidth;
        this.cameraControl = this.camera.getComponent("JumpCamera");
        for (let i = 0; i < 10; i ++){
            var newFlat = cc.instantiate(this.flatPrefab);

            var newPos = cc.v2(flatStart + i * this.flatWidth, -179);
            console.log("ckz new pos:", newPos)
            this.node.addChild(newFlat);
            newFlat.setPosition(newPos);
        }
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;

        var gravityManager = cc.director.getPhysicsManager();
        gravityManager.enabled = true;
        gravityManager.gravity = cc.v2(0, -this.gravity);

    },
    onPlayerEnter: function(player){
        this.cameraControl.setTarget(player);
    }
    // update (dt) {},
});