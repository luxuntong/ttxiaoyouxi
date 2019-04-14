const {ccclass, property} = cc._decorator;


export class Msg{
    protected UIRoot: cc.Node = null;
    constructor(UIRoot: cc.Node) {
        this.UIRoot = UIRoot;
    }

    public onMessage(msg: string) {
        let msgNode = new cc.Node();
        let label = msgNode.addComponent(cc.Label);
        label.string = msg;
        this.UIRoot.addChild(msgNode);
        msgNode.setPosition(cc.v2());
        msgNode.group = "UI";
        let finished = cc.callFunc(function(target) {
            msgNode.destroy();
        }, this); 
        let myAction = cc.sequence(cc.fadeOut(2), finished);
        msgNode.runAction(myAction);
    }
}