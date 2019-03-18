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
        btn_single: {
            default: null,
            type: cc.Button,
        },
        btn_coop: {
            default: null,
            type: cc.Button,
        },
        label_hint: {
            default: null,
            type: cc.Label,
        },

    },

    onLoad () {
        this.btn_single.node.on('click', this.startSingle, this);
        this.btn_coop.node.on('click', this.startCoop, this)
        this.installEvents();
    },
    startSingle: function(){
        cc.director.loadScene('JumpScene');
        this.unInstallEvents();
    },
    startCoop: function(){
        var player = KBEngine.app.player();
        console.log(player);
        if (player){
            player.matchCoop();
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
    onAvatarEnterWorld: function(avatar){
        KBEngine.DEBUG_MSG("onAvatarEnterWorld", avatar)

    },
    onAvatarContinueGame: function(avatar){
        KBEngine.DEBUG_MSG("onAvatarContinueGame", avatar)
        
    },
    onEnterWorld: function(entity){
        KBEngine.DEBUG_MSG("onEnterWorld", entity)
        
    },
    onLeaveWorld: function(entity){
        KBEngine.DEBUG_MSG("onEnterWorld", entity)
        
    },
    updatePosition: function(entity){
        KBEngine.DEBUG_MSG("updatePosition", entity)
        
    },
    set_position: function(entity){
        KBEngine.DEBUG_MSG("updatePosition", entity)
        
    },
});
