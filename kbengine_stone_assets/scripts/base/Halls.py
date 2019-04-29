# -*- coding: utf-8 -*-
import KBEngine
import Functor
from KBEDebug import *
import traceback
import GameConfigs

FIND_ROOM_NOT_FOUND = 0
FIND_ROOM_CREATING = 1

class Halls(KBEngine.Entity):
    """
    这是一个脚本层封装的房间管理器
    """
    def __init__(self):
        KBEngine.Entity.__init__(self)

        # 向全局共享数据中注册这个管理器的entityCall以便在所有逻辑进程中可以方便的访问
        KBEngine.globalData["Halls"] = self

        # 所有房间，是个字典结matchCoop构，包含 {"roomEntityCall", "PlayerCount", "enterRoomReqs"}
        # enterRoomReqs, 在房间未创建完成前， 请求进入房间和登陆到房间的请求记录在此，等房间建立完毕将他们扔到space中
        self.matchPools = {}
        self.rooms = {}

    def cancelMatch(self, box, gbId):
        if gbId not in self.matchPools:
            ERROR_MSG('cancelMatch failed that not in match pool', gbId)
            return

        self.matchPools.pop(gbId)
        box.client.onMatchCanceled()

    def matchCoop(self, box, gbID):
        DEBUG_MSG('ckz: hall match coop', gbID)
        if gbID in self.matchPools:
            ERROR_MSG('ckz: gbId has in match:', gbID)
            return

        if len(self.matchPools):
            boxList = [box]
            for otherGbId in self.matchPools:
                otherBox = self.matchPools.pop(otherGbId)
                boxList.append(otherBox)
                break

            roomKey = KBEngine.genUUID64()
            KBEngine.createEntityAnywhere("Room", {"roomKey": roomKey},
                                          lambda roomBox: self._onRoomCreated(roomBox, roomKey, boxList))
            return

        self.matchPools[gbID] = box

    def onAvatarDestroy(self, gbId):
        self.matchPools.pop(gbId, None)

    def _onRoomCreated(self, roomBox, roomKey, boxList):
        DEBUG_MSG('ckz: onRoomCreated', roomKey)
        if not roomBox:
            return

        self.rooms[roomKey] = roomBox
        for box in boxList:
            box.onGetRoom(roomKey, roomBox)

    def onTimer(self, tid, userArg):
        """
        KBEngine method.
        引擎回调timer触发
        """
        #DEBUG_MSG("%s::onTimer: %i, tid:%i, arg:%i" % (self.getScriptName(), self.id, tid, userArg))
        pass

    def onRoomLoseCell(self, roomKey):
        """
        defined method.
        Room的cell销毁了
        """
        DEBUG_MSG("Halls::onRoomLoseCell: space %i." % (roomKey))
        del self.rooms[roomKey]
