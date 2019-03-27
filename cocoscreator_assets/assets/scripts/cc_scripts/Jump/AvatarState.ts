const {ccclass, property} = cc._decorator;
var KBEngine = require("kbengine")
import {STATE_CONFLICT} from "../CONST/conflict_data"
const STATE_CHANGE = {
    doubleSave: 0,
    change: 1,
    cant: 2
};
/**
 * 0： 切换并保存
 * 1： 切换并重置
 * 2： 不能切换
 */
@ccclass
export class AvatarState extends cc.Component {
    protected state:number = 1;
    onLoad(){

    }
    protected checkSetState(statePos){
        //console.log("check statePos:", statePos, STATE_CONFLICT);
        var conflictList = STATE_CONFLICT[statePos];
        for (var oriPos = 0; oriPos < conflictList.length; oriPos++){
            if (!this.getState(oriPos)){
                continue;
            }

            if (conflictList[oriPos] == STATE_CHANGE.cant){
                KBEngine.DEBUG_MSG("ckz check failed:");
                console.log(statePos, this.state, oriPos, conflictList);
                return false;
            }
        }
        return true;
    }
    protected setState(statePos){
        if (!this.checkSetState(statePos)){
            return false;
        }

        this.cleanConflict(statePos);
        this.bitSet(statePos);
        return true;
    }
    protected cleanConflict(statePos){
        var conflictList = STATE_CONFLICT[statePos];
        for (var oriPos = 0; oriPos < conflictList.length; oriPos++){
            if (!this.getState(oriPos)){
                continue;
            }

            if (conflictList[oriPos] == STATE_CHANGE.change){
                this.bitReset(oriPos);
            }
        }
    }
    protected bitSet(statePos){
        this.state |= 1 << statePos;
    }
    protected bitReset(statePos){
        this.state &= ~(1 << statePos);
    }
    protected getState(statePos){
        return this.state & (1 << statePos);
    }
    protected reset(){
        this.state = 1;
    }
    protected printState(){
        console.log("print state:", this.state);
    }
};