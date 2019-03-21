const {ccclass, property} = cc._decorator;
import KBEngine = require("kbengine")
import SDD = require("single_data");
import ITEMD = require("item_data");

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

    @property(cc.Label)
    private curScoreDisplay: cc.Label = null;

    @property(cc.Label)
    private highScoreDisplay: cc.Label = null;

    @property(cc.Camera)
    private cameraUp: cc.Camera = null;

    @property(cc.Camera)
    private cameraDown: cc.Camera = null;

    protected flatStart = -480;
    protected flatList = null;
    protected flatY = -179
    protected flatIndex = 0;
    protected seed: number = -1;
    protected playerJump = null;
    protected actionList: Array<any> = null;
    // 玩家当前位置
    protected curIndex: number = -1;
    protected high: number = 0;
    protected entities: Array<cc.Node> = null;

    protected onLoad(){
        //console.log('ckz coop load', seedrandom.random(500));
        this.installEvents();
        this.initEntities();
        this.initFlat();
        
    }
    protected initDisplay() {
        this.high = 0;
        this.curScoreDisplay.string = 'cur: 0';
        this.highScoreDisplay.string = 'high: 0';
    }
    protected initEntities(){
        let entities = KBEngine.app.entities;
        this.entities = new Array();
        for (var eid in entities){
            this.initEntity(entities[eid]);
        }
    }
    protected initEntity(entity){
        if (entity.isPlayer()){
            console.log('ckz player:', entity)
            this.seed = entity.seed;
            this.createPlayer(entity);
        }
        else {
            console.log('ckz not player:', entity)
            this.createEntity(entity);
        }

    }
    protected createEntity(entity) {
        let e = cc.instantiate(this.playerPrefab);
        this.entities.push(e);
        this.node.addChild(e);
        let aState = e.addComponent("AvatarState");
        let aAct = e.addComponent("AvatarAct");
        aAct.setNode(this, null, aState);
        aAct.setStartPos(cc.v2(entity.position.x, this.getAvatarY()));
        aAct.setIsPlayer(false);
        aAct.setEid(entity.id);
        aAct.init();
        let cameraCtl = this.cameraUp.addComponent('JumpCamera');
        cameraCtl.setTarget(e);
    }
    protected createPlayer(avatar) {
        if (this.player){
            return;
        }

        this.player = cc.instantiate(this.playerPrefab);
        let aState = this.player.addComponent("AvatarState");
        let aAct = this.player.addComponent("AvatarAct");
        this.playerJump = aAct;
        this.node.addChild(this.player);
        aAct.setNode(this, this.pickTouchRange, aState);
        aAct.setStartPos(cc.v2(avatar.position.x, this.getAvatarY()));
        aAct.setIsPlayer(true);
        aAct.setEid(avatar.id);
        aAct.init();
        let cameraCtl = this.cameraDown.addComponent('JumpCamera');
        cameraCtl.setTarget(this.player);
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
        if (this.seed == -1){
            KBEngine.ERROR_MSG('ckz wrong seed');
            return
        }

        if (this.seed == 0){
            KBEngine.ERROR_MSG('ckz seed == 0')
        }
        this.flatStart = -480;
        this.flatList = new Array();
        this.flatIndex = 0;
        for (let i = 0; i < 10; i ++){
            let x = this.flatStart;
            if (i){
                x = this.randomPosX(x);
            }
            let newPos = cc.v2(x, this.flatY);
            this.flatList.push(this.createFlat(newPos, i));
            this.flatStart += SDD.flat_spacing;
        }
    }
    protected randomPosX(x){
        let halfRange = SDD.flat_x_random_range / 2;
        return x - halfRange + SDD.flat_x_random_range * this.srand(this.getNewSeed());
    }

    protected createFlat (pos, isHasItem){
        let newFlat = cc.instantiate(this.flatPrefab);
        this.node.addChild(newFlat);
        newFlat.setPosition(pos);
        newFlat.scaleX = 1 + SDD.flat_random_width * this.srand(this.getNewSeed());
        newFlat['flatIndex'] = this.flatIndex++;
        let obj = {
            flat: newFlat,
            item: null
        }
        if (isHasItem){
            obj.item = this.randomItem(pos, newFlat, obj);
        }
        return obj;    
    }

    protected randomItem(pos, flat, fatherObj) {
        let randValue = this.srand(this.getNewSeed())
        if (randValue < 0.4){
            let flatWidth = flat.scaleX * flat.width;
            let newItem = cc.instantiate(this.itemPrefab);
            newItem.scaleX = SDD.item_scale_x;
            newItem.scaleY = SDD.item_scale_y;
            let newX = pos.x - flatWidth / 2 + flatWidth * this.srand(this.getNewSeed());
            let newPos = cc.v2(newX, this.getSurfaceHigh(flat) + newItem.height * newItem.scaleY / 2);
            this.node.addChild(newItem);
            newItem.setPosition(newPos);
            newItem['fatherObj'] = fatherObj;
            return newItem;
        }
        return null;
    }
    public getSurfaceHigh(flat) {
        let half = flat.scaleY * flat.height / 2;
        return flat.y + half;
    }

    public getNewSeed(){
        this.seed += 7;
        return this.seed;
    }

    public srand(seed){
        seed = (seed + 60001) % 60001;
        seed = (seed * 9301 + 49297) % 233280; //为何使用这三个数?
        return seed / (233280.0);
    }

    protected getAvatarY() {
        return this.flatY + this.flatPrefab.data.height / 2;
    }
    protected getTrueWidth(node) {
        return node.scaleX * node.width;
    }

    public getFlatIndex(x) {
        for (let flat of this.flatList){
            let flatX = flat.flat.x;
            let half = this.getTrueWidth(flat.flat) / 2;
            if ((x >= flatX - half) && (x <= flatX + half)){
                return flat.flat.flatIndex;
            }
        }
        return -1;
    }
    public onCompleted(isWin) {
        if (!isWin){
            this.playerJump.reset();
            this.resetEntities();
            //this.reset();
        }
    }
    protected resetEntities() {
        for (let entity of this.entities) {
            let eCtl = entity.getComponent('AvatarAct');
            eCtl.reset();
        }
    }
    protected reset() {
        this.destroyAllFlat();
        this.initOnReset();
        this.curScoreDisplay.string = "cur: 0";
    }
    protected initOnReset() {
        this.initFlat();
        this.initAction();
    }
    protected initAction() {
        this.actionList = new Array();
    }
    protected destroyAllFlat() {
        for (let flat of this.flatList){
            flat.flat.destroy();
            if (flat.item){
                flat.item.destroy();
            }
        }
        this.flatList.length = 0;
    }

    public onPlayerLanded(index) {
        var score = index;
        this.curIndex = index;
        this.curScoreDisplay.string = 'cur: ' + score;
        if (score > this.high){
            this.high = score;
            this.highScoreDisplay.string = 'high: ' + this.high;
        }
        for (var i in this.flatList){
            var flat = this.flatList[i]
            if (flat.flat.flatIndex == index){
                console.log("onPlayerLanded", i)
                //this.destroyBeforeFlat(i);
                //this.fullOfFlat();
                break;
            }
        }
        //this.doItemAction();
    }
    protected destroyBeforeFlat(nowIndex) {
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
        }
    }
}