# -*- coding: utf-8 -*-
import KBEngine
from KBEDebug import *
import GameUtils
import GameConfigs
import random
import math
import copy
from interfaces.EntityCommon import EntityCommon

import single_data as SDD


class Avatar(KBEngine.Entity, EntityCommon):
    def __init__(self):
        KBEngine.Entity.__init__(self)
        EntityCommon.__init__(self)
        self.startPosition = copy.deepcopy(self.position)
        self.getCurrRoom().onEnter(self)
        self.reset()
        DEBUG_MSG("new avatar cell: id=%i accountName=%s  avatarName=%s spaceID=%i" % (self.id, self.accountName, self.avatarName, self.spaceID))

    def isAvatar(self):
        """joinRoom
        virtual method.
        """
        return True
    #--------------------------------------------------------------------------------------------
    #                              Callbacks
    #--------------------------------------------------------------------------------------------
    def onTimer(self, tid, userArg):
        pass

    def onSetRoomSeed(self, roomSeed):
        self.seed = roomSeed

    def onGetWitness(self):
        """
        KBEngine method.
        绑定了一个观察者(客户端)
        """
        DEBUG_MSG("Avatar::onGetWitness: %i." % self.id)

    def onLoseWitness(self):
        """
        KBEngine method.
        解绑定了一个观察者(客户端)
        """
        DEBUG_MSG("Avatar::onLoseWitness: %i." % self.id)

    def onDestroy(self):
        """
        KBEngine method.
        entity销毁
        """
        DEBUG_MSG("Avatar::onDestroy: %i." % self.id)
        room = self.getCurrRoom()

        if room:
            room.onLeave(self.id)

    def jump(self, exposed, pressCount, finalPos, curIndex):
        """
        defined.
        玩家跳跃 我们广播这个行为
        """
        DEBUG_MSG("receive avavtar %i jump, selfID=%i" % (exposed, self.id))
        if exposed != self.id:
            return
        DEBUG_MSG("avatar %i start jump" % (self.id))
        finalX = self._calcJump(pressCount)
        if abs(finalX - finalPos[0]) > 0.01:
            ERROR_MSG('check pos error:', self.curPos, pressCount, finalX, finalPos)
            self.client.onJumpResult(False)
            self.otherClients.onJump(pressCount, finalPos, -1)
            self._notifyRoomReset()
            return

        retIndex = self.getCurrRoom().getFlatIndexByPos(finalPos[0], self.curIndex)
        if retIndex != curIndex:
            ERROR_MSG('ckz ret index check failed:;', retIndex, curIndex)
            self.otherClients.onJump(pressCount, finalPos, -1)
            self._notifyRoomReset()
            return

        self.otherClients.onJump(pressCount, finalPos, curIndex)
        self.curPos = finalPos
        self.curIndex = curIndex
        self.client.onJumpResult(True)
        if curIndex == -1:
            self._notifyRoomReset()

    def _notifyRoomReset(self):
        self.getCurrRoom().onNotifyReset()

    def reset(self):
        self.curPos = (self.position[0], self.position[2])
        self.curIndex = 0


    def _calcJump(self, pressCount):
        angle = 40 * math.pi / 180
        xSpeed = pressCount * math.sin(angle)
        ySpeed = pressCount * math.cos(angle)
        yB = ySpeed / 1000
        yC = - SDD.gravity / 1000000
        xA = self.curPos[0]
        xB = xSpeed / 1000
        tCost = - yB / yC
        finalX = xA + tCost * xB
        return finalX

    def leaveRoom(self, exposed):
        pass
