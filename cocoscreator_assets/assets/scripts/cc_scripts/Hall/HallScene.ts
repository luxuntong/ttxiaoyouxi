const {ccclass, property} = cc._decorator;
var KBEngine = require("kbengine");
import {BaseScene} from "../common/BaseScene"

@ccclass
export class HallScene extends BaseScene {
    @property(cc.Button)
    protected btn_single: cc.Button = null;
    @property(cc.Button)
    protected btn_coop: cc.Button = null;
    @property(cc.Label)
    protected label_hint: cc.Label = null;

    onLoad () {
        console.log("on load hall")
        //this.btn_single.node.active = false;
        this.btn_single.node.on('click', this.startSingle, this);
        this.btn_coop.node.on('click', this.startCoop, this)
        this.installEvents();
    }
    protected startSingle(){
        cc.director.loadScene('SingleScene');
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
        super.installEvents();
    }


    protected unInstallEvents() {
        super.unInstallEvents();
    }

    protected onAvatarEnterWorld(avatar){
        console.log("ckz onAvatarEnterWorld", avatar)
        cc.director.loadScene("CoopScene", ()=> {
            KBEngine.INFO_MSG("load jump scene finished");
        });
        this.unInstallEvents();
    }
}