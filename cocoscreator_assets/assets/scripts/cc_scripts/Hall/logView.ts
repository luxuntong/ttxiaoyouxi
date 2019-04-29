const {ccclass, property} = cc._decorator;
var KBEngine = require("kbengine");

@ccclass
export class LogView extends cc.Component {
    onLoad() {
        let rich = this.node.getComponent(cc.RichText);
        rich.maxWidth = 200;
        let that = this;
        this.schedule(function() {
            console.log(that.node);
            rich.string = "<color=#000000>" + KBEngine.logData + "</color>";
            that.node.y = -that.node.height / 2;
            that.node.parent.height = that.node.height;
        }, 5)
    }
}