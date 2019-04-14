const {ccclass, property} = cc._decorator;
import {datas as SDD} from "../CONST/single_data"

@ccclass
export class JumpCamera extends cc.Component {
    @property(cc.Node)
    protected target: cc.Node = null;
    protected mode: number = 0;
    protected isplayer:boolean = false;
    protected vsSize = null;
    protected origin = null;
    onLoad(){
    }
    protected init(isplayer, smallWindow: cc.Sprite, smallMask: cc.Mask){
        this.isplayer = isplayer;
        this.vsSize = cc.view.getVisibleSize();
        this.origin = cc.view.getVisibleOrigin()
        this.node.y = 0;

        if (!isplayer) {
            
            let texture = new cc.RenderTexture();
            texture.initWithSize(this.vsSize.width, this.vsSize.height);

            let spriteFrame = new cc.SpriteFrame();
            spriteFrame.setTexture(texture)

            smallWindow.spriteFrame = spriteFrame;
            smallWindow.node.scaleY *= -1;
            let camera:cc.Camera = this.node.getComponent(cc.Camera);
            console.log('ckz camera:', smallWindow, texture);
            camera.targetTexture = texture;
            smallMask.node.width = this.vsSize.width * SDD.small_map_scale;
            smallMask.node.height = this.vsSize.height * SDD.small_map_scale;
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