const {ccclass, property} = cc._decorator;
var KBEngine = require("kbengine");
import {BaseScene} from "../common/BaseScene"
enum CBType {
    cancel = 0,
    single = 1
}
@ccclass
export class HallScene extends BaseScene {
    @property(cc.Button)
    protected btn_single: cc.Button = null;
    @property(cc.Button)
    protected btn_coop: cc.Button = null;
    protected btn_cancel: cc.Button = null;
    @property(cc.Label)
    protected label_hint: cc.Label = null;
    protected cbType = 0;

    onLoad () {
        console.log("on load hall")
        //this.btn_single.node.active = false;
        this.btn_single.node.on('click', this.startSingle, this);
        this.btn_coop.node.on('click', this.startCoop, this)
        this.btn_cancel = cc.find("cancel").getComponent(cc.Button);
        this.btn_cancel.node.on('click', this.cancelMatch, this);
        this.btn_cancel.node.active = false;
        this.installEvents();
    }

    protected cancelMatch() {
        console.log('cancel match will cancel');
        this.cbType = CBType.cancel;
        let player = KBEngine.app.player();
        if (player){
            player.cancelMatch();
        }
    }

    protected startSingle(){
        cc.director.loadScene('SingleScene');
        this.unInstallEvents();
    }
    protected startCoop(){
        this.label_hint.string = "匹配中...";
        this.btn_coop.enabled = false;
        this.btn_single.enabled = false;
        let player = KBEngine.app.player();
        console.log(player);
        if (player){
            player.matchCoop();
        }
        this.btn_cancel.node.active = true;
        let that = this;
        this.scheduleOnce(function() {
            that.matchSingle();
        }, Math.round(Math.random() * 5) + 10);
    }
    onDestroy() {
        console.log('ckz hall destroy');
    }

    protected matchSingle() {
        this.cbType = CBType.single;
        let player = KBEngine.app.player();
        if (player){
            player.cancelMatch();
        }
    }

    protected installEvents () {
        super.installEvents();
        KBEngine.Event.register("onMatchCanceled", this, "onMatchCanceled");
    }


    protected unInstallEvents() {
        super.unInstallEvents();
        KBEngine.Event.deregister("onMatchCanceled", this, "onMatchCanceled");
    }

    protected onMatchCanceled() {
        console.log("onMatchCanceled", this.cbType);
        if (this.cbType == CBType.cancel) {
            this.btn_coop.enabled = true;
            this.btn_single.enabled = true;
            this.btn_cancel.node.active = false;
            this.label_hint.string = "";
        }
        else {
            this.startSingle();
        }
    }

    public onAvatarEnterWorld(avatar){
        console.log("ckz onAvatarEnterWorld", avatar)
        cc.director.loadScene("CoopScene", ()=> {
            KBEngine.INFO_MSG("load jump scene finished");
        });
        this.unInstallEvents();
    }
}