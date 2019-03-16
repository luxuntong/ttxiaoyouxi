# -*- coding: utf-8 -*-
import KBEngine
import random
import copy
import math
from KBEDebug import *

class RoomAvatarCacheVal(object):
    def __init__(self, gbId, pos, direction, isIn=False):
        self.gbId = gbId
        self.pos = pos
        self.direction = direction
        self.isIn = isIn


class Room(KBEngine.Entity):
    """
    一个可操控cellapp上真正space的实体
    注意：它是一个实体，并不是真正的space，真正的space存在于cellapp的内存中，通过这个实体与之关联并操控space。
    """
    def __init__(self):
        KBEngine.Entity.__init__(self)

        self.cellData["roomKeyC"] = self.roomKey

        # 请求在cellapp上创建cell空间
        self.createCellEntityInNewSpace(None)

        self.avatars = {}

    def enterRoom(self, box, pos, direction, gbId):
        """
        defined method.
        请求进入某个space中
        """
        DEBUG_MSG('ckz: room enterRoom', gbId)
        raVal = RoomAvatarCacheVal(box, pos, direction)
        if self.cell:
            raVal.isIn = True
            box.createCell(self.cell)

    def leaveRoom(self, entityID):
        """
        defined method.
        某个玩家请求退出这个space
        """
        self.onLeave(entityID)

    def onTimer(self, tid, userArg):
        """
        KBEngine method.
        引擎回调timer触发
        """
        pass


    def onLeave(self, entityID):
        """
        defined method.
        离开场景
        """
        if entityID in self.avatars:
            DEBUG_MSG("Room::onLeave: entityID=%i" % (entityID))
            del self.avatars[entityID]


    def onLoseCell(self):
        """
        KBEngine method.
        entity的cell部分实体丢失
        """
        KBEngine.globalData["Halls"].onRoomLoseCell(self.roomKey)

        self.avatars = {}
        self.destroy()

    def onGetCell(self):
        """
        KBEngine method.
        entity的cell部分实体被创建成功
        """
        DEBUG_MSG("Room::onGetCell: id=%i roomKey=%i" % (self.id, self.roomKey))
        for raVal in self.avatars.values():
            if raVal.isIn:
                continue

            raVal.isIn = True
            raVal.box.createCell(self.cell)

