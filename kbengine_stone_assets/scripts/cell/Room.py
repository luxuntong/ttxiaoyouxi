# -*- coding: utf-8 -*-
import KBEngine
from KBEDebug import *
import GameConfigs
import random
import single_data as SDD
import random_index_data as RIDD
import GameUtils

TIMER_TYPE_DESTROY = 1
TIMER_TYPE_BALANCE_MASS = 2
TIMER_TYPE_GAME_START = 3
TIMER_TYPE_NEXT_PLAYER = 4
TIMER_TYPE_GAME_OVER = 5
TIMER_TYPE_SECOND = 6
TIMER_TYPE_RESET_ROOM = 7


class Room(KBEngine.Entity):
    """
    游戏场景
    """

    def __init__(self):
        KBEngine.Entity.__init__(self)

        # 把自己移动到一个不可能触碰陷阱的地方
        self.position = (999999.0, 0.0, 0.0)
        # 这个房间中所有的玩家
        self.tags = {}
        self.entities = {}

        DEBUG_MSG('created space[%d] entityID = %i spaceid=%i' % (self.roomKeyC, self.id, self.spaceID))

        KBEngine.globalData["Room_%i" % self.spaceID] = self.base
        self.roomSeed = random.randint(0, 60000)

    def onDestroy(self):
        """
        KBEngine method.
        """
        DEBUG_MSG("Room::onDestroy: %i" % (self.id))
        del KBEngine.globalData["Room_%i" % self.spaceID]

    def onEnter(self, entityCall):
        """
        defined method.
        进入场景
        """
        DEBUG_MSG('Room::onEnter space[%d] entityID = %i.' %
                  (self.spaceID, entityCall.id), entityCall.__class__.__name__)
        className = entityCall.__class__.__name__
        if className == 'Avatar':
            entityCall.onSetRoomSeed(self.roomSeed)

        self.tags.setdefault(className, [])
        self.tags[className].append(entityCall.id)
        self.entities[entityCall.id] = entityCall

    def onTimer(self, id, userArg):
        """
        KBEngine method.
        使用addTimer后， 当时间到达则该接口被调用
        @param id        : addTimer 的返回值ID
        @param userArg    : addTimer 最后一个参数所给入的数据
        """
        if TIMER_TYPE_GAME_START == userArg:
            self.startGame()
            #开始回合倒计时
            self.newTurnTimer = self.addTimer(
                GameConfigs.PLAY_TIME_PER_TURN, 0, TIMER_TYPE_NEXT_PLAYER)
            DEBUG_MSG("Time to Game Start, newTurnTimer=%i" % (self.newTurnTimer))

        if TIMER_TYPE_SECOND == userArg:
            self.totalTime += 1

        if TIMER_TYPE_NEXT_PLAYER == userArg:
            self.nextPlayer()

    def onLeave(self, entityID):
        """
        defined method.
        离开场景
        """
        DEBUG_MSG('Room::onLeave space[%d] entityID = %i.' %
                  (self.spaceID, entityID))

        avatarList = self.tags['Avatar']
        if entityID in avatarList:
            avatarList.remove(entityID)

        if len(avatarList) == 0:
            self.destroy()

    def findEntityByID(self, ID):
        return self.entities[ID]

    def _srand(self, seed):
        seed = (seed + 60001) % 60001
        seed = (seed * 9301 + 49297) % 233280
        return seed / 233280.0

    def _randomFromIndex(self, index, randomIndex):
        return self._srand(self.roomSeed + index * SDD.random_range + randomIndex)

    def _getFlatPosX(self, index):
        x = SDD.falt_start + index * SDD.flat_spacing
        return self._centerRandom(x, SDD.flat_x_random_range, self._randomFromIndex(index, RIDD.flat_posx))

    def _getFlatWidth(self, index):
        scaleX = 1 + SDD.flat_random_width * self._randomFromIndex(index, RIDD.flat_scalex)
        return 200 * scaleX

    def isInFlat(self, x, index):
        posX = self._getFlatPosX(index)
        width = self._getFlatWidth(index)
        half = width / 2
        return posX - half < x < posX + half

    def _centerRandom(self, center, diameter, randomValue):
        radius = diameter / 2
        return center - radius + diameter * randomValue

