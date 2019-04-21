const {ccclass, property} = cc._decorator;
import KBEngine = require("kbengine")
import {datas as ITEMD} from "../CONST/item_data"
import {datas as SDD} from "../CONST/single_data";
import {datas as RIDD} from "../CONST/random_index_data";
import {JumpMode, NewClass as AvatarAct} from "./AvatarAct"
import {SingleEntity} from "../Single/SingleEntity"
import {BaseScene} from "../common/BaseScene"
import {State} from "../Jump/AvatarState"
import {STATE_CONFLICT as actionConflict} from "../CONST/conflict_action"
import {datas as ActionState} from "../CONST/conflict_action_state"
import {Flat} from "./Flat"
import {Msg} from "./Msg"

//var seedrandom = require('seedrandom');
//import {KBEngine} from "kbengine"
@ccclass
export class NewClass extends BaseScene {
    @property(cc.Prefab)
    protected playerPrefab: cc.Prefab = null;

    protected pickTouchRange: cc.Node = null;

    @property(cc.Prefab)
    protected flatPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    protected itemPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    protected backPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    protected myItemPrefab: cc.Prefab = null;

    protected cameraOther: cc.Camera = null;
    protected cameraMy: cc.Camera = null;
    protected smallWorld: cc.Sprite = null;
    protected smallMask: cc.Mask = null;
    protected account: cc.Node = null;
    protected UIRoot: cc.Node = null;    
    protected curScoreDisplay: cc.Label = null;
    protected highScoreDisplay: cc.Label = null;
    protected player:AvatarAct = null;
    protected playerEntity:SingleEntity = null;
    protected flatStart = 0;
    protected flats = null;
    protected flatY = -179
    protected flatIndex = 0;
    protected seed: number = -1;
    protected actionList: Array<any> = null;
    // 玩家当前位置
    protected curIndex: number = -1;
    protected high: number = 0;
    protected entities = {};
    protected randomIndex = 0;
    protected backPool: Array<any> = null;
    protected backWidth: number = null;
    protected flatInfo = null;
    protected myItems = null;
    protected msgCtl: Msg = null;

    protected onLoad(){
        //console.log('ckz coop load', seedrandom.random(500));
        this.initBack();
        this.initUI();
        this.init();
        this.initCamera();
        this.installEvents();
        this.initEntities();
        this.initFlat();
        this.initPhyx();
        this.initGM();
        this.myItems = {};
        this.account.active = false;
    }
    protected init() {
    }

    protected initCamera() {
        this.cameraMy = cc.find("camera/CameraMy").getComponent(cc.Camera);
        this.cameraOther = cc.find("camera/CameraOther").getComponent(cc.Camera);
        this.smallMask = cc.find("smallMask").getComponent(cc.Mask);
        this.smallWorld = cc.find("smallWorld", this.smallMask.node).getComponent(cc.Sprite);
    }

    protected initGM() {
        let GMRoot = cc.find("GM", this.UIRoot);
        if (GMRoot == null) {
            return;
        }

        let GMButton = cc.find("GM_button", GMRoot);
        let GMEdit: cc.EditBox = cc.find("GM_edit", GMRoot).getComponent(cc.EditBox);
        let that = this;
        GMButton.on(cc.Node.EventType.TOUCH_START, function() {
            let gmStr = GMEdit.string;
            that.onGM(gmStr);
        });
    }

    protected onGM(gmStr) {
        console.log("gm:", gmStr);
        this.msgCtl.onMessage(gmStr);
        switch (gmStr) {
            case "$auto":
                this.player.setMode(JumpMode.auto);
                break;
        }
    }

    protected initPhyx() {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
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
    public getInWhichBack(x): number {
        let half = this.backWidth;
        let index = Math.floor(x / this.backWidth);
        if (x % this.backWidth < half) {
            return index;
        }
        else {
            return index + 1;
        }
    }

    protected isBackNotUse(backObj) {
        for (let eid in this.entities) {
            let entity = this.entities[eid];
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
    protected initUI() {
        this.UIRoot = cc.find("UIRoot");
        this.curScoreDisplay = cc.find("curScore", this.UIRoot).getComponent(cc.Label);
        this.highScoreDisplay = cc.find("highScore", this.UIRoot).getComponent(cc.Label);
        this.high = 0;
        this.curScoreDisplay.string = 'cur: 0';
        this.highScoreDisplay.string = 'high: 0';
        this.msgCtl = new Msg(this.UIRoot);
        this.pickTouchRange = cc.find("touchRange", this.UIRoot);
        this.account = cc.find("account");
    }
    protected initEntities(){
        let entities = KBEngine.app.entities;
        this.entities = {};
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
        this.entities[entity.id] = e;
        this.node.addChild(e);
        let aAct: AvatarAct = e.addComponent("AvatarAct");
        aAct.setStartPos(cc.v2(entity.position.x, this.getAvatarY()));
        aAct.setNode(this, pickTouchRange);
        aAct.setEntity(entity);
        aAct.setIsPlayer(isPlayer);
        aAct.init();
        let cameraCtl;
        if (isPlayer) {
            this.player = aAct;
            this.playerEntity = entity;
            cameraCtl = this.cameraMy.addComponent('JumpCamera');
        }
        else {
            cameraCtl = this.cameraOther.addComponent("JumpCamera");
        }
        
        cameraCtl.setTarget(e);
        cameraCtl.init(isPlayer, this.smallWorld, this.smallMask);
        return e;
    }

    protected installEvents(){
        // common
        super.installEvents();
        KBEngine.Event.register("onGetItem", this, "onGetItem");
        KBEngine.Event.register("onGetRelivePos", this, "onGetRelivePos");
        KBEngine.Event.register("onModifyHp", this, "onModifyHp");
        KBEngine.Event.register("onJumpCompleted", this, "onJumpCompleted");
        KBEngine.Event.register("onUseItemRet", this, "onUseItemRet");
        
        
    }

    protected unInstallEvents() {
        super.unInstallEvents();
        KBEngine.Event.deregister("onGetItem", this, "onGetItem");
        KBEngine.Event.deregister("onGetRelivePos", this, "onGetRelivePos");
        KBEngine.Event.deregister("onModifyHp", this, "onModifyHp");
        KBEngine.Event.deregister("onJumpCompleted", this, "onJumpCompleted");
        KBEngine.Event.deregister("onUseItemRet", this, "onUseItemRet");
    }

    protected initFlat() {
        this.flatInfo = {};
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
    public onGetItem(eid, flatIndex: number, itemIndex) {
        this.setFlatInfo(flatIndex, ActionState.noItem);

        if (this.player.isMe(eid)) {
            this.createMyItem(itemIndex);
        }
    }

    protected setFlatInfo(index, stateValue) {
        if (!(index in this.flatInfo)) {
            this.flatInfo[index] = new State(actionConflict);
        }
        this.flatInfo[index].setState(stateValue);
        
        if (index in this.flats) {
            let flatSc: Flat = this.flats[index].getComponent(Flat);
            flatSc.setState(stateValue);
        }
    }

    public onUseItemRet(eid, itemIndex, itemType, flatIndex) {
        if (this.player.isMe(eid)) {
            if (itemIndex in this.myItems && this.myItems[itemIndex].item) {
                this.myItems[itemIndex].item.destroy();
                this.myItems[itemIndex].item = null;
            }
        }

        if (itemType == ITEMD.flat_narrow) {
            this.setFlatInfo(flatIndex, ActionState.flatNarrow);
        }
    }

    protected onGetRelivePos(eid, relivePos) {
        let entity = this.entities[eid];
        let act: AvatarAct = entity.getComponent(AvatarAct);
        act.onGetRelivePos(eid, relivePos);
    }
    protected onJumpCompleted(eid) {
        this.account.active = true;
        let returnBtn = cc.find("return", this.account);
        returnBtn.on(cc.Node.EventType.TOUCH_START, this.onReturnClick, this);
        for (let eid in this.entities) {
            let entity = this.entities[eid];
            let act = entity.getComponent(AvatarAct);
            act.onCompleted();
        }
    }

    protected onReturnClick() {
        console.log('ckz click');
        let player = KBEngine.app.player();
        if(player != undefined && player.inWorld) {
            player.leaveRoom();
        }
        cc.director.loadScene("HallScene", () =>{
            console.log('load hall finished!');
        });
        this.unInstallEvents();
    }

    protected onModifyHp(eid, hp) {
        let entity = this.entities[eid];
        if (!entity) {
            return;
        }
        let act: AvatarAct = entity.getComponent(AvatarAct);
        act.onModifyHp(eid, hp);
    }

    //创建我获得的道具
    protected createMyItem(itemIndex) {
        console.log('create my item:', itemIndex)
        if (itemIndex == -1) {
            return;
        }

        if (itemIndex in this.myItems){
            if (this.myItems[itemIndex].item != null) {
                KBEngine.ERROR_MSG("get err item index" + itemIndex);
                return;
            }
        } else {
            this.myItems[itemIndex] = {item: null};
        }
        let item = cc.instantiate(this.myItemPrefab);
        this.myItems[itemIndex].item = item
        item.scaleX = SDD.item_scale_x;
        item.scaleY = SDD.item_scale_y;
        this.UIRoot.addChild(item);
        item.x = 100 + itemIndex * 100;
        item.y = 100;
        console.log('create my item:', item);

        let that = this;
        item.on(cc.Node.EventType.TOUCH_START, function(){
            console.log('item click:', itemIndex);
            that.clickItem(itemIndex);
        });
    }

    protected getEnemyEid() {
        for (let eid in this.entities) {
            let id = parseInt(eid);
            if (!this.player.isMe(id)) {
                return id;
            }
        }
        return -1;
    }

    protected clickItem(itemIndex) {
        this.playerEntity.useItem(itemIndex, this.getEnemyEid());
    }

    protected destroyMyItem() {
        for (let i = 0; i < 4; i++) {
            if (i in this.myItems && this.myItems[i].item != null) {
                this.myItems[i].item.destroy();
                this.myItems[i].item = null;
            }
        }
    }

    protected getFlatInfo(index): State{
        if (index in this.flatInfo) {
            return this.flatInfo[index];
        }
        return null;
    }

    protected createFlatFromIndex(index) {
        let flat = cc.instantiate(this.flatPrefab);
        let flatScript = flat.addComponent(Flat);
        this.node.addChild(flat);
        console.log('ckz create flat:', index, this.flatInfo, this.getFlatInfo(index));
        flatScript.init(index, this, this.itemPrefab, this.getFlatInfo(index));
        return flat;
    }

    public srand(seed){
        seed = (seed + 60001) % 60001;
        seed = (seed * 9301 + 49297) % 233280; //为何使用这三个数?
        return seed / (233280.0);
    }

    public randomWithIndex(index) {
        return this.srand(this.seed + index);
    }

    protected getAvatarY() {
        return this.flatY + this.flatPrefab.data.height / 2;
    }

    public getFlatIndex(x, width) {
        for (let fIndex in this.flats){
            let flatSc: Flat = this.flats[fIndex].getComponent(Flat);
            if (flatSc.isOnMe(x, width)) {
                return parseInt(fIndex);
            }
        }
        return -1;
    }

    public onCompleted(isWin) {
        if (!isWin){
            this.resetEntities();
            this.reset();
        }
    }

    protected resetEntities() {
        for (let eid in this.entities) {
            let entity = this.entities[eid];
            let eCtl = entity.getComponent('AvatarAct');
            eCtl.reset();
        }
    }

    protected reset() {
        this.destroyAllFlat();
        this.initOnReset();
        this.curScoreDisplay.string = "cur: 0";
        this.init();
    }

    protected initOnReset() {
        this.initFlat();
        this.initAction();
        this.destroyMyItem();
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
        for (let eid in this.entities) {
            let entity = this.entities[eid];
            let act = entity.getComponent(AvatarAct);
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
        flat.destroy();
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
        for (let eid in this.entities) {
            let entity = this.entities[eid];
            let start = entity.getComponent(AvatarAct).curIndex;
            for (let i = start; i <= start + 10; i++){
                if (!(i in this.flats)) {
                    this.flats[i] = this.createFlatFromIndex(i);
                }
            }
        }
    }

    public getFlatByIndex(index):Flat{
        return this.flats[index];
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