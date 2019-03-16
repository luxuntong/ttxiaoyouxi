cc.Class({
    extends: cc.Component,

    properties: {
        target: {
            default: null,
            type: cc.Node,
        },
        mode: 1,
        isUp: 0
    },
    onLoad: function(){
        this.vsSize = cc.view.getVisibleSize();
        this.origin = cc.view.getVisibleOrigin()
        if (this.mode == 1){
            if (this.isUp){
                this.node.y = 0;
            }
            else {
                this.node.y = this.vsSize.height;
            }
        }
        else {
            this.node.y = this.vsSize.height / 2;
        }
        console.log('camera', this.node);
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