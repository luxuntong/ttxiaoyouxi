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
export class State {
    protected state:number = 1;
    protected conflictTable = null;
    constructor (conflictTable) {
        this.conflictTable = conflictTable;
        this.state = 0;
    }
    protected checkSetState(statePos){
        //console.log("check statePos:", statePos, STATE_CONFLICT);
        var conflictList = this.conflictTable[statePos];
        for (var oriPos = 0; oriPos < conflictList.length; oriPos++){
            if (!this.getState(oriPos)){
                continue;
            }

            if (conflictList[oriPos] == STATE_CHANGE.cant){
                console.log("ckz check failed:");
                console.log(statePos, this.state, oriPos, conflictList);
                return false;
            }
        }
        return true;
    }
    public setState(statePos){
        if (!this.checkSetState(statePos)){
            return false;
        }

        this.cleanConflict(statePos);
        this.bitSet(statePos);
        return true;
    }
    protected cleanConflict(statePos){
        var conflictList = this.conflictTable[statePos];
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
    public getState(statePos){
        return this.state & (1 << statePos);
    }
    public clearAll() {
        this.state = 0;
    }
    public reset(){
        this.state = 1;
    }
    protected printState(){
        console.log("print state:", this.state);
    }
};