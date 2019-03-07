// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var KBEngine = require("kbengine");

cc.Class({
    extends: cc.Component,

    properties: {
        player: {
            default: null,
            type: cc.Node,
        },

        pipiPrefab: {
            default: null,
            type: cc.Prefab,
        },

        popPrefab: {
            default: null,
            type: cc.Prefab,
        },

        joyStickPrefab: {
            default: null,
            type: cc.Prefab,
        },

        camera: {
            default: null,
            type: cc.Camera,
        },

        cameraControl: {
            default: null,
            type: cc.Node,
        },

        gameState: {
            default: null,
            type: cc.Node,
        },

        gameHint: cc.Label,
    },

    onLoad () {
        this.keyBoardListener = null;
        this.mouseListener = null;
        this.entities = {};
        this.playerControl = null;
        this.curAvatarID = 0;
        console.log('camera:', this.camera);
        this.cameraControl = this.camera.getComponent("CameraControl");

        this.enablePhysicManager();
        //this.enablePhysicsDebugDraw();
        this.installEvents();
        this.items = new Array();

        this.gameState = this.node.getComponent("GameState");

        if(cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.enableWxShare();
        }
    },

    installEvents : function() {
        // common
        KBEngine.INFO_MSG("world scene installEvents ......");
		KBEngine.Event.register("onDisconnected", this, "onDisconnected");
		KBEngine.Event.register("onConnectionState", this, "onConnectionState");
		KBEngine.Event.register("onReloginBaseappFailed", this, "onReloginBaseappFailed");
		KBEngine.Event.register("onReloginBaseappSuccessfully", this, "onReloginBaseappSuccessfully");

        // in world
        KBEngine.Event.register("onAvatarEnterWorld", this, "onAvatarEnterWorld");
        KBEngine.Event.register("onAvatarContinueGame", this, "onAvatarContinueGame");
		KBEngine.Event.register("onEnterWorld", this, "onEnterWorld");
        KBEngine.Event.register("onLeaveWorld", this, "onLeaveWorld");
        KBEngine.Event.register("updatePosition", this, "updatePosition");
       
        KBEngine.Event.register("set_position", this, "set_position");
        KBEngine.Event.register("newTurn", this, "newTurn");

        KBEngine.Event.register("otherAvatarOnJump", this, "otherAvatarOnJump");
        KBEngine.Event.register("otherAvatarOnRightJump", this, "otherAvatarOnRightJump");
        KBEngine.Event.register("otherAvatarOnLeftJump", this, "otherAvatarOnLeftJump");
        KBEngine.Event.register("otherAvatarOnPickUpItem", this, "otherAvatarOnPickUpItem");
        KBEngine.Event.register("otherAvatarThrowItem", this, "otherAvatarThrowItem");
        KBEngine.Event.register("otherAvatarOnStopWalk", this, "otherAvatarOnStopWalk");
        KBEngine.Event.register("otherAvatarOnStartWalk", this, "otherAvatarOnStartWalk");
        KBEngine.Event.register("otherAvatarRecoverItem", this, "otherAvatarRecoverItem");
        KBEngine.Event.register("onRecvDamage", this, "onRecvDamage");
        KBEngine.Event.register("onAvatarDie", this, "onAvatarDie");

        KBEngine.Event.register("onGameOver", this, "onGameOver");
        KBEngine.Event.register("onResetItem", this, "onResetItem");
    },

    enableWxShare: function () {
        wx.showShareMenu({
            withShareTicket:true,
        });

        wx.onShareAppMessage(function() {
            return {
                title: "投石作战",
                imageUrl:SHARE_PICTURE,
            }
        });
     },

    enablePhysicManager: function () {
        cc.director.getCollisionManager().enabled = true;
        cc.director.getPhysicsManager().enabled = true;
    },

    enablePhysicsDebugDraw: function() {
        var manager = cc.director.getCollisionManager();
        manager.enabledDebugDraw = true;
        manager.enabledDrawBoundingBox = true;

        cc.director.getPhysicsManager().debugDrawFlags =
            // cc.PhysicsManager.DrawBits.e_aabbBit |
            // cc.PhysicsManager.DrawBits.e_pairBit |
            cc.PhysicsManager.DrawBits.e_centerOfMassBit |
            // cc.PhysicsManager.DrawBits.e_jointBit |
            cc.PhysicsManager.DrawBits.e_shapeBit |
            cc.PhysicsManager.DrawBits.e_rayCast;
    },

    

    unInstallEvents: function() {
        KBEngine.INFO_MSG("world scene unInstallEvents ......");
        KBEngine.Event.deregister("onDisconnected", this, "onDisconnected");
		KBEngine.Event.deregister("onConnectionState", this, "onConnectionState");
		KBEngine.Event.deregister("onReloginBaseappFailed", this, "onReloginBaseappFailed");
		KBEngine.Event.deregister("onReloginBaseappSuccessfully", this, "onReloginBaseappSuccessfully");

        // in world
        KBEngine.Event.deregister("onAvatarEnterWorld", this, "onAvatarEnterWorld");
        KBEngine.Event.deregister("onAvatarContinueGame", this, "onAvatarContinueGame");
		KBEngine.Event.deregister("onEnterWorld", this, "onEnterWorld");
        KBEngine.Event.deregister("onLeaveWorld", this, "onLeaveWorld");
        KBEngine.Event.deregister("updatePosition", this, "updatePosition");
       
        KBEngine.Event.deregister("set_position", this, "set_position");
        KBEngine.Event.deregister("newTurn", this, "newTurn");

        KBEngine.Event.deregister("otherAvatarOnJump", this);
        KBEngine.Event.deregister("otherAvatarOnRightJump", this);
        KBEngine.Event.deregister("otherAvatarOnLeftJump", this);
        KBEngine.Event.deregister("otherAvatarOnPickUpItem", this);
        KBEngine.Event.deregister("otherAvatarThrowItem", this);
        KBEngine.Event.deregister("otherAvatarOnStopWalk", this);
        KBEngine.Event.deregister("otherAvatarOnStartWalk", this);
        KBEngine.Event.deregister("otherAvatarRecoverItem", this);
        KBEngine.Event.deregister("onRecvDamage", this);
        KBEngine.Event.deregister("onAvatarDie", this);

        KBEngine.Event.deregister("onGameOver", this);
        KBEngine.Event.deregister("onResetItem", this);
    },

    onDisconnected : function() {
        KBEngine.INFO_MSG("disconnect! will try to reconnect...");
        KBEngine.app.reloginBaseapp();
    },
    
    onReloginBaseappTimer : function(self) {
        KBEngine.INFO_MSG("will try to reconnect(" + this.reloginCount + ")...");
    },
    
    onReloginBaseappFailed : function(failedcode) {
        KBEngine.INFO_MSG("reogin is failed(断线重连失败), err=" + KBEngine.app.serverErr(failedcode));   
    },
        
    onReloginBaseappSuccessfully : function(){
        KBEngine.INFO_MSG("reogin is successfully!(断线重连成功!)");	
    },
        
    onConnectionState : function(success) {
        if(!success) {
            KBEngine.ERROR_MSG("Connect(" + KBEngine.app.ip + ":" + KBEngine.app.port + ") is error! (连接错误)");
        }
        else {
            KBEngine.INFO_MSG("Connect successfully, please wait...(连接成功，请等候...)");
        }
    },

    onEnterWorld: function (entity) {
        if(!entity.isPlayer()) {
            var ae = null;

            if(entity.className == "Avatar") {
                if(entity.modelID == 0 && this.pipiPrefab) {
                    ae = cc.instantiate(this.pipiPrefab);
                }else if(entity.modelID == 1 && this.popPrefab) {
                    ae = cc.instantiate(this.popPrefab);
                }
                if(!ae) return;
                var action = ae.addComponent("AvatarAction");
                var anim = ae.addComponent("AvatarAnim");
                cc.log("another avatar(id=%d, accountName=%s) enter world", entity.id, entity.accountName);
                //注意顺序： anim ---> action
                anim.setModelID(entity.modelID);
                anim.setAnim(ae.getComponent(cc.Animation));

                action.setModelID(entity.modelID);
                action.setAnim(anim);
                action.setEntityId(entity.id);
                action.setAccountName(entity.accountName);
                
                if(entity.direction.z >= 1)  {
                    ae.scaleX = 1;
                }else if(entity.direction.z <= -1) {
                    ae.scaleX = -1;
                }
            }else if(entity.className == "Item") {
                cc.log("Item:%s enter world", entity.name);
                ae = cc.instantiate(ItemPrefabMap[entity.name]);
                var action = ae.addComponent("ItemAction");
                action.setPlayer(this.player);
                action.setItemID(entity.id);
                action.setHarm(entity.harm);

                this.items.push(ae);
            }
            this.node.addChild(ae);
            
            ae.setPosition(entity.position.x*SCALE,  entity.position.z*SCALE);
            this.entities[entity.id] = ae;
            cc.log("other entity %d join room, position(%f, %f, %f)", entity.id, entity.position.x, entity.position.y, entity.position.z);
        }
    },

    onLeaveWorld: function (entity) {
        
    },

    onAvatarEnterWorld : function(avatar) {
        this.createPlayer(avatar);
    },

    otherAvatarOnJump: function(entity) {
        var ae = this.entities[entity.id];
		if(ae == undefined)
            return;
            
        ae.isOnGround = entity.isOnGround;
        if(!ae.isOnGround)
            return;

        var action = ae.getComponent("AvatarAction");
        action.onJump();
    },

    updatePosition : function(entity) {
        if(entity.className == "Item")
            return;

		var ae = this.entities[entity.id];
		if(ae == undefined)
            return;
    
        var player = KBEngine.app.player();
        if(player && player.inWorld && player.id == entity.id)
            return;
        
        ae.isOnGround = entity.isOnGround;
        if(entity.direction.z >= 1)  {
            ae.scaleX = 1;
        }else if(entity.direction.z <= -1) {
            ae.scaleX = -1;
        }
        var position = cc.p(entity.position.x*SCALE, entity.position.z*SCALE);
        var action = ae.getComponent("AvatarAction");
        action.onStartMove(position);
    },	  
    
    set_position: function(entity) {
        if(!this.entities) return;

        var ae = this.entities[entity.id];
		if(ae == undefined)
			return;
		
		ae.x = entity.position.x * SCALE;
        ae.y = entity.position.z * SCALE;
        ae.setPosition(ae.x, ae.y);
    },

    setCameraTarget: function(entityID){
        var ae = this.entities[entityID];
		if(ae == undefined)
            return;
            
        this.cameraControl.setTarget(ae);
    },

    checkPlayerHasItem: function(left) {
        var count = 0;
        for(var i in this.items) {
            var item = this.items[i];
            if(left) {
                if(item.x < 80) count++;
            } else {
                if(item.x > 350) count++;
            }
        }

        return count;
    },

    newTurn: function(avatarID, second){
        this.curAvatarID = avatarID;
        this.setCameraTarget(avatarID);
       
        this.resetItem();
        this.gameState.newTurn(second);
        if(!this.gameState.isGameStart()) {
            this.gameState.setGameStart(true);

            var action = cc.fadeTo(1.0, 0);
            this.gameHint.string = "游戏开始 !!!";
            this.gameHint.node.runAction(action);
        }

        if(this.curAvatarID == KBEngine.app.player().id) {
            this.enableControlPlayer();
            var avatar = this.entities[this.curAvatarID];
            var itemCount = 0;
            var left = 0;
            if( avatar.name == PIPI_NAME) {
                itemCount = this.checkPlayerHasItem(false);
                left = 0;
            } else {
                itemCount = this.checkPlayerHasItem(true);
                left = 1;
            }

            if(itemCount == 0) {
                var player = KBEngine.app.player();
                if(player == undefined || !player.inWorld)
                    return;
               
                player.addItem(left);
            }
        }else {
            this.disEnableControlPlayer();
        }

        if(this.player && cc.sys.isMobile) {
            this.player.getComponent("AvatarControl").resetJoyStick();
        }
    },


    resetItem: function() {
        for(var i in this.items) {
            var item = this.items[i];
            item.getComponent("ItemAction").setThrowed(false);
        }
    },

    otherAvatarOnPickUpItem: function(avatarID, itemID, position) {
        cc.log("WorldScene::otherAvatarOnPickUpItem: avatarID=%d, itemID=%d ", avatarID, itemID);
        var player = this.entities[avatarID];
        var item = this.entities[itemID];
        if(player == undefined || item == undefined)
            return;
        var action = player.getComponent("AvatarAction");
        action.setPlaceItem(item, action.getItemPoint());
        action.playThrowPreAnim();
    },

    otherAvatarThrowItem: function(avatarID, itemID, force){
        cc.log("WorldScene::otherAvatarThrowItem: avatarID=%d, itemID=%d force(%f, %f)", avatarID, itemID, force.x, force.y);
        var player = this.entities[avatarID];
        var item = this.entities[itemID];
        if(player == undefined || item == undefined)
            return;
        
        this.setCameraTarget(itemID);
        var action = player.getComponent("AvatarAction");
        action.playThrowAnim();
        action.throwItem(item, force);
    },

    otherAvatarOnStopWalk: function(avatarID, pos){
        var player = this.entities[avatarID];
        if(player == undefined)
            return;

        cc.log("WorldScene::otherAvatarOnStopWalk: avatarID=%d, pos(%f, %f) ", avatarID, pos.x, pos.y);
        var action = player.getComponent("AvatarAction");
        action.onStopWalk(pos);
    },

    otherAvatarOnStartWalk: function(avatarID, moveFlag){
        var player = this.entities[avatarID];
        if(player == undefined)
            return;

        KBEngine.INFO_MSG("WorldScene::otherAvatarOnStartWalk: avatarID=" + avatarID + " moveFlag=" + moveFlag);
        var action = player.getComponent("AvatarAction");
        if(moveFlag == MOVE_LEFT) {
            action.onLeftWalk();
        } else if(moveFlag == MOVE_RIGHT) {
            action.onRightWalk();
        }
        
    },

    otherAvatarRecoverItem: function(avatarID, itemID) {
        var player = this.entities[avatarID];
        var item = this.entities[itemID];
        if(player == undefined || item == undefined)
            return;

        player.getComponent("AvatarAction").reset();
        item.getComponent("ItemAction").setPlacePrePosition();
    },

    otherAvatarOnLeftJump: function(avatarID){
        var player = this.entities[avatarID];
        if(player == undefined)
            return;

        cc.log("WorldScene::otherAvatarOnLeftJump: avatarID= " + avatarID);
        var action = player.getComponent("AvatarAction");
        action.onLeftJump();
    },

    otherAvatarOnRightJump: function(avatarID){
        var player = this.entities[avatarID];
        if(player == undefined)
            return;

        cc.log("WorldScene::otherAvatarOnRightJump: avatarID= " + avatarID);
        var action = player.getComponent("AvatarAction");
        action.onRightJump();
    },

    onRecvDamage: function(avatarID, harm, hp) {
        cc.log("WorldScene::otherAvatarRecvDamage: avatarID=%d, harm=%d, hp=%d ", avatarID, harm, hp);
        var player = this.entities[avatarID];
        if(player == undefined)
            return;

        var action = player.getComponent("AvatarAction");
        action.recvDamage(harm, hp);
    },

    onAvatarDie: function(avatarID) {
        cc.log("WorldScene::onAvatarDie, avatarid=%d", avatarID)
        var player = this.entities[avatarID];
        if(player == undefined)
            return;
        
        var anim = player.getComponent("AvatarAnim");
        var collider = player.getComponent(cc.PhysicsPolygonCollider);
        collider.sensor = true;
        anim.playDieAnim();
    },

    onGameOver: function(avatarID, isWin, hitRate, totalTime, totalHarm, score) {
        if(avatarID == KBEngine.app.player().id) {
            if(this.player.name == PIPI_NAME) {
                GAME_RESULT = isWin ? PIPI_WIN : PIPI_LOSE;
            } else {
                GAME_RESULT = isWin ? POP_WIN : POP_LOSE;
            }

            HIT_RATE = hitRate;
            TOTAL_TIME = totalTime;
            TOTAL_HARM = totalHarm;
            SCORE = score;
            
            if(isWin) {
                cc.director.loadScene("WinScene");
            } else {
                cc.director.loadScene("LoseScene");
            }
        }

        this.disEnableControlPlayer();
        this.unInstallEvents();
        this.player = null;
    },

    onResetItem: function(itemID, position) {
        var item = this.entities[itemID];
        if(item == undefined) 
            return;
    
        item.setPosition(position.x*SCALE, position.z*SCALE);
    },


    createPlayer: function(avatar) {
        if(!this.player) {
            if(avatar.modelID == 0 && this.pipiPrefab) {
                this.player = cc.instantiate(this.pipiPrefab);
            }else if(avatar.modelID == 1 && this.popPrefab) {
                this.player = cc.instantiate(this.popPrefab);
            }

            if(!this.player) return;
            cc.log("player id=%d name=%s onAvatarEnterWorld", avatar.id, avatar.accountName);

            var ctrl= this.player.addComponent("AvatarControl");
            var action= this.player.addComponent("AvatarAction");
            var anim= this.player.addComponent("AvatarAnim");

           if(cc.sys.isMobile) {
                var touchControl = cc.instantiate(this.joyStickPrefab);
                this.node.parent.addChild(touchControl);
                touchControl.setPosition(JOY_STICK_POSITION_X, JOY_STICK_POSITION_Y);
                ctrl.setTouchControl(touchControl);
           }
            //注意顺序： anim ---> action --->ctrl
            anim.setModelID(avatar.modelID);
            anim.setAnim(this.player.getComponent(cc.Animation));

            action.setAnim(anim);
            action.setModelID(avatar.modelID);
            action.setEntityId(avatar.id);
            action.setGameState(this.gameState);
            action.setHP(avatar.HP);
            action.setAccountName(avatar.accountName);

            ctrl.setPlayer(this.player);

            this.cameraControl.setTarget(this.player);
            this.node.addChild(this.player);
            this.player.setPosition(avatar.position.x*SCALE, avatar.position.z*SCALE);

            this.entities[avatar.id] = this.player;
            this.gameState.setPlayerHP(avatar.HP);
        }
    },

    onAvatarContinueGame: function(avatar) {
       this.createPlayer(avatar);
    },

    enableControlPlayer: function() {
        if(this.player) {
            this.player.getComponent("AvatarControl").enableEventListen();
        }
    },

    disEnableControlPlayer: function() {
        if(this.player) {
            this.player.getComponent("AvatarControl").disEnableEventListen();
            this.player.getComponent("AvatarAction").reset();
        }
    },
});
