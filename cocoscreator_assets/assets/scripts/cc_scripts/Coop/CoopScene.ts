const {ccclass, property} = cc._decorator;
import KBEngine = require("kbengine")
import {datas as ITEMD} from "../CONST/item_data"
import {datas as SDD} from "../CONST/single_data";
import {datas as RIDD} from "../CONST/random_index_data";
import {NewClass as AvatarAct} from "./AvatarAct"

//var seedrandom = require('seedrandom');
//import {KBEngine} from "kbengine"

@ccclass
export class NewClass extends cc.Component {
    @property(cc.Prefab)
    private playerPrefab: cc.Prefab = null;

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

    @property(cc.Sprite)
    protected smallWorld: cc.Sprite = null;

    @property(cc.Mask)
    protected smallMask: cc.Mask = null;

    @property(cc.Prefab)
    protected backPrefab: cc.Prefab = null;

    private player:AvatarAct = null;
    protected flatStart = 0;
    protected flats = null;
    protected flatY = -179
    protected flatIndex = 0;
    protected seed: number = -1;
    protected actionList: Array<any> = null;
    // 玩家当前位置
    protected curIndex: number = -1;
    protected high: number = 0;
    protected entities: Array<cc.Node> = null;
    protected randomIndex = 0;
    protected backPool: Array<any> = null;
    protected backWidth: number = null;

    protected onLoad(){
        //console.log('ckz coop load', seedrandom.random(500));
        this.initBack();
        this.installEvents();
        this.initEntities();
        this.initFlat();
        this.initDisplay();
        
    }
    protected initBack() {
        this.backPool = new Array();
        for (let i:number = 0; i < 6; i++) {
            let back = cc.instantiate(this.backPrefab);
            back.scaleX = 40;
            back.scaleY = 0.6;
            this.backWidth = back.width * back.scaleX;
            this.node.insertChild(back, 0);
            back.setPosition(cc.v2(i * this.backWidth, 0));
            this.backPool.push({
                index: i,
                back: back
            })
        }
    }
    public getInWhichBack(x) {
        for (let backObj of this.backPool) {
            let half = this.backWidth;
            if (backObj.back.x - half <= x && backObj.back.x + half >= x)
            {
                return backObj.index;
            }
        }
        return -1;
    }

    protected isBackNotUse(backObj) {
        for (let entity of this.entities) {
            let eWidth = entity.width * entity.scaleX;
            if (Math.abs(backObj.back.x - entity.x) < this.backWidth) {
                return false;
            }
        }
        return true;
    }

    public setBackByIndex(index) {
        let noUseObj = null;
        for (let backObj of this.backPool) {
            if (backObj.index == index) {
                return;
            }

            if (this.isBackNotUse(backObj)) {
                noUseObj = backObj;
            }
        }
        noUseObj.index = index;
        noUseObj.back.x = index * this.backWidth;        
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
        this._createEntity(entity, null, false);
    }
    protected createPlayer(avatar) {
        if (this.player){
            return;
        }
        this._createEntity(avatar, this.pickTouchRange, true);
    }

    protected _createEntity(entity, pickTouchRange, isPlayer) {
        let e = cc.instantiate(this.playerPrefab);
        this.entities.push(e);
        this.node.addChild(e);
        let aState = e.addComponent("AvatarState");
        let aAct: AvatarAct = e.addComponent("AvatarAct");
        aAct.setStartPos(cc.v2(entity.position.x, this.getAvatarY()));
        aAct.setNode(this, pickTouchRange, aState);
        aAct.setEid(entity.id);
        aAct.setIsPlayer(isPlayer);
        aAct.init();
        let cameraCtl;
        if (isPlayer) {
            this.player = aAct;
            cameraCtl = this.cameraDown.addComponent('JumpCamera');
        }
        else {
            cameraCtl = this.cameraUp.addComponent("JumpCamera");
        }
        
        cameraCtl.setTarget(e);
        cameraCtl.init(isPlayer, this.smallWorld, this.smallMask);
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
        this.flatStart = SDD.flat_start;
        this.flats = {};
        this.flatIndex = 0;
        for (let i = 0; i < 10; i ++){
            this.flats[i] = this.createFlatFromIndex(i);
        }
    }
    protected randomPosX(x){
        let halfRange = SDD.flat_x_random_range / 2;
        return x - halfRange + SDD.flat_x_random_range * this.randomFromIndex(RIDD.flat_posx);
    }

    protected createFlatFromIndex(index) {
        this.randomIndex = index;
        let x = SDD.flat_start + index * SDD.flat_spacing;
        if (index) {
            x = this.randomPosX(x)
        }
        let newPos = cc.v2(x, this.flatY);
        return this.createFlat(newPos, index);
    }

    protected createFlat (pos, isHasItem){
        let newFlat = cc.instantiate(this.flatPrefab);
        this.node.addChild(newFlat);
        newFlat.setPosition(pos);
        newFlat.scaleX = 1 + SDD.flat_random_width * this.randomFromIndex(RIDD.flat_scalex);
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
        let randValue = this.randomFromIndex(RIDD.has_item)
        if (randValue < SDD.item_create_prob){
            let flatWidth = flat.scaleX * flat.width;
            let newItem = cc.instantiate(this.itemPrefab);
            newItem.scaleX = SDD.item_scale_x;
            newItem.scaleY = SDD.item_scale_y;
            let newX = pos.x - flatWidth / 2 + flatWidth * this.randomFromIndex(RIDD.item_posx);
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

    public randomFromIndex(index) {
        return this.srand(this.seed + this.randomIndex * SDD.random_range + index);
    }

    protected getAvatarY() {
        return this.flatY + this.flatPrefab.data.height / 2;
    }
    protected getTrueWidth(node) {
        return node.scaleX * node.width;
    }

    public getFlatIndex(x) {
        for (let fIndex in this.flats){
            let flat = this.flats[fIndex];
            let flatX = flat.flat.x;
            let half = this.getTrueWidth(flat.flat) / 2;
            if ((x >= flatX - half) && (x <= flatX + half)){
                return parseInt(fIndex);
            }
        }
        return -1;
    }
    public onCompleted(isWin) {
        if (!isWin){
            this.player.reset();
            this.resetEntities();
            this.reset();
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
        console.log('destroy all');
        for (let fIndex in this.flats){
            this.destroyFlat(fIndex);
        }
    }
    protected isFlatInUse(fIndex){
        for (let e of this.entities) {
            let act = e.getComponent(AvatarAct);
            if (fIndex >= act.curIndex - 2 && fIndex <= act.curIndex + 10)
            {
                return true;
            }
        }
        return false;
    }

    //清除屏幕外平板
    protected destroyFlat(index) {
        console.log('clear fIndex:', index);
        let flat = this.flats[index];
        flat.flat.destroy();
        if (flat.item){
            flat.item.destroy();
        }

        delete this.flats[index];
    }
    protected clearFlat(){
        for (let fIndex in this.flats) {
            if (!this.isFlatInUse(fIndex)) {
                this.destroyFlat(fIndex);
            }
        }
    }

    protected fullOfFlat() {
        for (let e of this.entities) {
            let start = e.getComponent(AvatarAct).curIndex;
            for (let i = start; i <= start + 10; i++){
                if (!(i in this.flats)) {
                    this.flats[i] = this.createFlatFromIndex(i);
                }
            }
        }
    }

    public onPlayerLanded (eid) {
        if (eid == this.player.eid)
        {
            let index = this.player.curIndex;
            this.curScoreDisplay.string = 'cur:' + index;
            if (index > this.high) {
                this.high = index;
                this.highScoreDisplay.string = 'high:' + index;
            }
        }

        this.clearFlat();
        this.fullOfFlat();
    }
}