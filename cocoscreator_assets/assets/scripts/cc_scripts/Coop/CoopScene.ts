const {ccclass, property} = cc._decorator;
var KBEngine = require("kbengine")
//import {KBEngine} from "kbengine"

@ccclass
export class NewClass extends cc.Component {
    protected onLoad(){
        this.installEvents();
    }
    protected installEvents(){
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

    public onDisconnected() {
        console.log("disconnect! will try to reconnect...");
        KBEngine.app.reloginBaseapp();
    }
    
    public onReloginBaseappTimer(self) {
        console.log("ckz relogin:", self);
    }
    
    public onReloginBaseappFailed(failedcode) {
        console.log("ckz onReloginBaseappFailed:", failedcode);
    }
        
    public onReloginBaseappSuccessfully(){
        console.log("reogin is successfully!(断线重连成功!)");	
    }
        
    public onConnectionState(success) {
        if(!success) {
            KBEngine.ERROR_MSG("Connect(" + KBEngine.app.ip + ":" + KBEngine.app.port + ") is error! (连接错误)");
        }
        else {
            KBEngine.INFO_MSG("Connect successfully, please wait...(连接成功，请等候...)");
        }
    }
    public onAvatarEnterWorld(avatar){
        console.log("ckz: onAvatarEnterWorld", avatar);
    }
    public onAvatarContinueGame(avatar){
        KBEngine.DEBUG_MSG("onAvatarContinueGame", avatar);
        
    }
    public onEnterWorld(entity){
        console.log("onEnterWorld", entity);
        
    }
    public onLeaveWorld(entity){
        console.log("onEnterWorld", entity)
        
    }
    public updatePosition(entity){
        console.log("updatePosition", entity)
        
    }
    public set_position(entity){
        console.log("updatePosition", entity)
        
    }
}