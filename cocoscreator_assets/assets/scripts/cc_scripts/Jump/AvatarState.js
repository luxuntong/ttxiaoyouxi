var KBEngine = require("kbengine")
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
const STATE_CONFLICT = [
    [2, 2, 1, 1],
    [1, 2, 2, 2],
    [2, 1, 2, 2],
    [2, 2, 2, 2]
];
cc.Class({
    extends: cc.Component,

    properties: {
        state: 1
    },
    onLoad: function(){
    },
    checkSetState: function(statePos){
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
    },
    setState: function(statePos){
        if (!this.checkSetState(statePos)){
            return false;
        }

        this.cleanConflict(statePos);
        this.bitSet(statePos);
        return true;
    },
    cleanConflict: function(statePos){
        var conflictList = STATE_CONFLICT[statePos];
        for (var oriPos = 0; oriPos < conflictList.length; oriPos++){
            if (!this.getState(oriPos)){
                continue;
            }

            if (conflictList[oriPos] == STATE_CHANGE.change){
                this.bitReset(oriPos);
            }
        }
    },
    bitSet: function(statePos){
        this.state |= 1 << statePos;
    },
    bitReset: function(statePos){
        this.state &= ~(1 << statePos);
    },
    getState: function(statePos){
        return this.state & (1 << statePos);
    },
    reset: function(){
        this.state = 1;
    },
    printState: function(){
        console.log("print state:", this.state);
    }

    // update (dt) {},
});