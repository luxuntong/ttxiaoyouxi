# -*- coding: utf-8 -*-
import KBEngine
from KBEDebug import *
import GameUtils
import GameConfigs
import random
import copy
from interfaces.EntityCommon import EntityCommon


class Avatar(KBEngine.Entity, EntityCommon):
    def __init__(self):
        KBEngine.Entity.__init__(self)
        EntityCommon.__init__(self)
        self.startPosition = copy.deepcopy(self.position)
        self.getCurrRoom().onEnter(self)
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
        self.otherClients.onJump(pressCount, finalPos, curIndex)

    def leaveRoom(self, exposed):
        pass
