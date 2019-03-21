const {ccclass, property} = cc._decorator;
var KBEngine = require("kbengine")
const SDD = require("single_data");
const ITEMD = require("item_data");

//var seedrandom = require('seedrandom');
//import {KBEngine} from "kbengine"

@ccclass
export class NewClass extends cc.Component {
    @property(cc.Prefab)
    private playerPrefab: cc.Prefab = null;

    @property(cc.Node)
    private player: cc.Node = null;

    @property(cc.Node)
    private pickTouchRange: cc.Node = null;

    @property(cc.Prefab)
    private flatPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    private itemPrefab: cc.Prefab = null;

    protected flatStart = -480;
    protected flatList = null;
    protected flatY = -179
    protected flatIndex = 0;

    protected onLoad(){
        //console.log('ckz coop load', seedrandom.random(500));
        this.installEvents();
        //this.initEntities();
        this.initFlat();
        
    }
    protected initEntities(){
        var entities = KBEngine.app.entities;
        for (var eid in KBEngine.app.entities){
            this.initEntity(entities[eid]);
        }
    }
    protected initEntity(entity){
        if (entity.isPlayer()){
            console.log('ckz player:', entity)
            this.createPlayer(entity);
        }
        else {
            console.log('ckz not player:', entity)
        }

    }
    protected createPlayer(avatar){
        if (this.player){
            return;
        }

        this.player = cc.instantiate(this.playerPrefab);
        var aState = this.player.addComponent("AvatarState");
        var aAct = this.player.addComponent("AvatarAct");
        aAct.setNode(this, this.pickTouchRange, aState);
        aAct.init();
        this.player.setPosition(avatar.position.x, avatar.position.z);
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
    protected initFlat() {
        this.flatStart = -480;
        this.flatList = new Array();
        this.flatIndex = 0;
        for (let i = 0; i < 10; i ++){
            var x = this.flatStart;
            if (i){
                x = this.randomPosX(x);
            }
            var newPos = cc.v2(x, this.flatY);
            this.flatList.push(this.createFlat(newPos, i));
            this.flatStart += SDD.flat_spacing;
        }
    }
    protected randomPosX(x){
        var halfRange = SDD.flat_x_random_range / 2;
        return x - halfRange + SDD.flat_x_random_range * Math.random();
    }

    protected createFlat (pos, isHasItem){
        var newFlat = cc.instantiate(this.flatPrefab);
        this.node.addChild(newFlat);
        newFlat.setPosition(pos);
        newFlat.scaleX = 1 + SDD.flat_random_width * Math.random();
        newFlat['flatIndex'] = this.flatIndex++;
        var obj = {
            flat: newFlat,
            item: null
        }
        if (isHasItem){
            obj.item = this.randomItem(pos, newFlat, obj);
        }
        return obj;    
    }

    protected randomItem(pos, flat, fatherObj) {
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
            newItem['fatherObj'] = fatherObj;
            return newItem;
        }
        return null;
    }
    public getSurfaceHigh(flat) {
        var half = flat.scaleY * flat.height / 2;
        return flat.y + half;
    }
}