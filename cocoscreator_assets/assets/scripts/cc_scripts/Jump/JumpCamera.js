cc.Class({
    extends: cc.Component,

    properties: {
        target: {
            default: null,
            type: cc.Node,
        }
    },
    onLoad: function(){
        var bg1 = cc.find("World/jp_bg_1");
        var bg2 = cc.find("World/jp_bg_2");
        console.log("bg1:", bg1);
        console.log("bg2:", bg2);
        console.log(this.node);
        this.vsSize = cc.view.getVisibleSize();


    },
    setTarget: function(target){
        this.target = target;
    },
    lateUpdate: function(dt){
        if (this.target == null){
            return;
        }
        
        let targetPos = this.target.convertToWorldSpaceAR(cc.Vec2.ZERO);
        var point = this.node.parent.convertToNodeSpaceAR(targetPos);
        //console.log("pos:", this.node.x, this.node.parent.x, this.target.x, targetPos.x, point.x, this.vsSize);
        var limitDiff = this.vsSize.width / 2 - 100;
        if (this.node.x < point.x){
            this.node.x = point.x;
        }else if (this.node.x > point.x + limitDiff)
        {
            this.node.x = point.x + limitDiff;
        }
    }
})