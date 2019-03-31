const {ccclass, property} = cc._decorator;
var KBEngine = require("kbengine");

@ccclass
export class HallScene extends cc.Component {
    @property(cc.Button)
    protected btn_single: cc.Button = null;
    @property(cc.Button)
    protected btn_coop: cc.Button = null;
    @property(cc.Label)
    protected label_hint: cc.Label = null;

    onLoad () {
        this.btn_single.node.active = false;
        this.btn_coop.node.on('click', this.startCoop, this)
        this.installEvents();
    }
    protected startSingle(){
        cc.director.loadScene('JumpScene');
        this.unInstallEvents();
    }
    protected startCoop(){
        this.label_hint.string = "匹配中...";
        this.btn_coop.enabled = false;
        this.btn_single.enabled = false;
        var player = KBEngine.app.player();
        console.log(player);
        if (player){
            player.matchCoop();
        }
    }
    onDestroy() {
        console.log('ckz hall destroy');
    }

    protected installEvents () {
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
    }


    protected unInstallEvents() {
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
    }

    protected onDisconnected () {
        KBEngine.INFO_MSG("disconnect! will try to reconnect...");
        KBEngine.app.reloginBaseapp();
    }
    
    protected onReloginBaseappTimer (self) {
        KBEngine.INFO_MSG("will try to reconnect(" + ")...");
    }

    protected onReloginBaseappFailed (failedcode) {
        KBEngine.INFO_MSG("reogin is failed(断线重连失败), err=" + KBEngine.app.serverErr(failedcode));   
    }
        
    protected onReloginBaseappSuccessfully (){
        KBEngine.INFO_MSG("reogin is successfully!(断线重连成功!)");	
    }
        
    protected onConnectionState (success) {
        if(!success) {
            KBEngine.ERROR_MSG("Connect(" + KBEngine.app.ip + ":" + KBEngine.app.port + ") is error! (连接错误)");
        }
        else {
            KBEngine.INFO_MSG("Connect successfully, please wait...(连接成功，请等候...)");
        }
    }
    protected onAvatarEnterWorld(avatar){
        console.log("ckz onAvatarEnterWorld", avatar)
        cc.director.loadScene("CoopScene", ()=> {
            KBEngine.INFO_MSG("load jump scene finished");
        });
        this.unInstallEvents();
    }
    protected onAvatarContinueGame(avatar){
        KBEngine.DEBUG_MSG("onAvatarContinueGame", avatar)
        
    }
    protected onEnterWorld(entity){
        KBEngine.DEBUG_MSG("onEnterWorld", entity)
        
    }
    protected onLeaveWorld(entity){
        KBEngine.DEBUG_MSG("onEnterWorld", entity)
        
    }
    protected updatePosition(entity){
        KBEngine.DEBUG_MSG("updatePosition", entity)
        
    }
    protected set_position(entity){
        KBEngine.DEBUG_MSG("updatePosition", entity)
        
    }
}