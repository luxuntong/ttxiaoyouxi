const SDD = require("single_data")
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
        playerJump: {
            default: null,
            type: cc.Node
        },
        flatPrefab: {
            default: null,
            type: cc.Prefab
        },
        itemPrefab: {
            default: null,
            type: cc.Prefab
        },
        curScoreDisplay: {
            default: null,
            type: cc.Label
        },
        highScoreDisplay: {
            default: null,
            type: cc.Label
        },
        flatY: -179,
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
        console.log("ckz on load:", this.flatPrefab);
        this.cameraControl = this.camera.getComponent("JumpCamera");
        this.initDisplay();
        this.initFlat();
        this.initPhyx();
    },
    initDisplay: function(){
        this.high = 0;
        this.curScoreDisplay.string = 'cur: 0';
        this.highScoreDisplay.string = 'high: 0';
    },
    getAvatarY: function(){
        console.log(this.flatY, this.flatPrefab.data.height)
        return this.flatY + this.flatPrefab.data.height / 2;
    }
    ,
    initPhyx: function(){
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;

        var gravityManager = cc.director.getPhysicsManager();
        gravityManager.enabled = true;
        gravityManager.gravity = cc.v2(0, -this.gravity);
    },
    initFlat: function(){
        this.flatStart = -480;
        this.flatList = new Array();
        this.flatIndex = 0;
        for (let i = 0; i < 10; i ++){
            this.flatStart += SDD.flat_spacing;
            var newPos = cc.v2(this.flatStart, this.flatY);
            this.flatList.push(this.createFlat(newPos));
        }
    },
    createFlat: function(pos){
        var newFlat = cc.instantiate(this.flatPrefab);
        this.node.addChild(newFlat);
        var halfRange = SDD.flat_x_random_range / 2;
        pos.x = pos.x - halfRange + SDD.flat_x_random_range * Math.random();
        newFlat.setPosition(pos);
        newFlat.flatIndex = this.flatIndex++;
        newFlat.scaleX = 1 + SDD.flat_random_width * Math.random();
        var flatWidth = newFlat.width * newFlat.scaleX;
        return {
            pos: pos,
            flat: newFlat,
            width: flatWidth,
            item: this.randomItem(pos, newFlat)
        }        
    },
    onPlayerEnter: function(player){
        this.cameraControl.setTarget(player);
        this.player = player;
        this.playerJump = player.getComponent("AvatarJump")
    },
    getFlatIndex: function(x){
        for (var flat of this.flatList){
            var flatX = flat.pos.x;
            var half = flat.width / 2;
            if ((x >= flatX - half) && (x <= flatX + half)){
                return flat.flat.flatIndex;
            }
        }
        return -1;
    },
    onPlayerLanded: function(index){
        var score = index + 1;
        this.curScoreDisplay.string = 'cur: ' + score;
        if (score > this.high){
            this.high = score;
            this.highScoreDisplay.string = 'high: ' + this.high;
        }
        for (var i in this.flatList){
            var flat = this.flatList[i]
            var flatX = flat.pos.x;
            var half = flat.width / 2;
            if (flat.flat.flatIndex == index){
                console.log("onPlayerLanded", i)
                this.curIndex = i;
                this.destroyFlat(i);
                this.fullOfFlat();
                break;
            }
        }
    },
    destroyFlat: function(nowIndex){
        var eraseIndex = nowIndex - 2;
        if (eraseIndex < 0){
            return;
        }

        for (var i = 0; i <= eraseIndex; i++){
            var flat = this.flatList.shift();
            flat.flat.destroy();
            if (flat.item){
                flat.item.destroy();
            }
            this.curIndex--;
        }
    },
    fullOfFlat: function(){
        var need = 15 - this.flatList.length;
        for (let i = 0; i < need; i ++){
            this.flatStart += SDD.flat_spacing;
            var newPos = cc.v2(this.flatStart, this.flatY);
            this.flatList.push(this.createFlat(newPos));
        }
    },
    getSurfaceHigh: function(flat){
        var half = flat.scaleY * flat.height / 2;
        return flat.y + half;
    },
    destroyAllFlat: function(){
        for (var flat of this.flatList){
            flat.flat.destroy();
            if (flat.item){
                flat.item.destroy();
            }
        }
        this.flatList.length = 0;
    },
    randomItem: function(pos, flat){
        var randValue = Math.random()
        if (randValue < 0.4){
            var flatWidth = flat.scaleX * flat.width;
            var newItem = cc.instantiate(this.itemPrefab);
            newItem.scaleX = SDD.item_scale_x;
            newItem.scaleY = SDD.item_scale_y;
            var newX = pos.x - flatWidth / 2 + flatWidth * Math.random();
            var newPos = cc.v2(newX, this.getSurfaceHigh(flat) + newItem.height * newItem.scaleY / 2);
            this.node.addChild(newItem);
            newItem.setPosition(newPos);
            return newItem;
        }
        return null;
    },
    reset: function(){
        this.destroyAllFlat();
        this.initFlat();
        this.curScoreDisplay.string = "cur: 0";
    },
    onCompleted: function(isWin){
        if (!isWin){
            this.playerJump.reset();
            this.reset();
        }
    }
    // update (dt) {},
});