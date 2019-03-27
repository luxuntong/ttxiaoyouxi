const {ccclass, property} = cc._decorator;

@ccclass
export class JumpCamera extends cc.Component {
    @property(cc.Node)
    protected target: cc.Node = null;
    protected mode: number = 0;
    protected isUp: number = 0;
    protected vsSize = null;
    protected origin = null;
    onLoad(){
    }
    protected init(isUp, smallWindow, smallMask: cc.Mask){
        this.isUp = isUp;
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
        if (isUp) {
            
            let texture = new cc.RenderTexture();
            texture.initWithSize(this.vsSize.width, this.vsSize.height);

            let spriteFrame = new cc.SpriteFrame();
            spriteFrame.setTexture(texture)
            smallWindow.spriteFrame = spriteFrame;
            smallWindow.node.rotation = 180;
            let camera:cc.Camera = this.node.getComponent(cc.Camera);
            console.log('ckz camera:', smallWindow, texture);
            camera.targetTexture = texture;
            smallMask.node.width = this.vsSize.width * 0.125;
            smallMask.node.height = this.vsSize.height * 0.125;
        }
        console.log('camera', this.node);
    }
    protected setTarget(target){
        this.target = target;
        console.log('ckz target:', target);
    }
    
    lateUpdate(){
        if (this.target == null){
            return;
        }
        
        let targetPos = this.target.convertToWorldSpaceAR(cc.Vec2.ZERO);
        let point = this.node.parent.convertToNodeSpaceAR(targetPos);
        //if (this.isUp)
            //console.log(this.target);
            //console.log("pos:", this.node.x, this.node.parent.x, this.target.x, targetPos.x, point.x, this.vsSize);
        let limitDiff = this.vsSize.width / 2 - 100;
        if (this.node.x < point.x){
            this.node.x = point.x;
        }else if (this.node.x > point.x + limitDiff)
        {
            this.node.x = point.x + limitDiff;
        }
    }
}