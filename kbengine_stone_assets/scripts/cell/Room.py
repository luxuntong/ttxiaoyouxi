# -*- coding: utf-8 -*-
import KBEngine
from KBEDebug import *
import GameConfigs
import random
import single_data as SDD
import random_index_data as RIDD
import item_data as IDD
import GameUtils

TIMER_TYPE_DESTROY = 1
TIMER_TYPE_BALANCE_MASS = 2
TIMER_TYPE_GAME_START = 3
TIMER_TYPE_NEXT_PLAYER = 4
TIMER_TYPE_GAME_OVER = 5
TIMER_TYPE_SECOND = 6
TIMER_TYPE_RESET_ROOM = 7

class FlatEffect(object):
    def __init__(self, effType):
        self.effType = effType


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
        self.liveAvatars = {}
        self.flatInfo = {}

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
            self.liveAvatars[entityCall.id] = entityCall.id

        self.tags.setdefault(className, [])
        self.tags[className].append(entityCall.id)
        self.entities[entityCall.id] = entityCall.id

    def onTimer(self, id, userArg):
        """
        KBEngine method.
        使用addTimer后， 当时间到达则该接口被调用
        @param id        : addTimer 的返回值ID
        @param userArg    : addTimer 最后一个参数所给入的数据
        """
        if TIMER_TYPE_GAME_START == userArg:
            self.startGame()
            # 开始回合倒计时
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

    def onAvatarDied(self, eid):
        self.liveAvatars.pop(eid)
        if len(self.liveAvatars) == 1:
            for winner in self.liveAvatars:
                break

            for eid in self.tags['Avatar']:
                entity = self._getEntityById(eid)
                if not entity:
                    continue

                entity.onCmpleted(winner)

    def findEntityByID(self, ID):
        return self.entities[ID]

    def _srand(self, seed):
        seed = (seed + 60001) % 60001
        seed = (seed * 9301 + 49297) % 233280
        return seed / 233280.0

    def _randomFromIndex(self, index, randomIndex):
        return self._srand(self.roomSeed + index * SDD.random_range + randomIndex)

    def _getFlatPosX(self, index):
        x = SDD.flat_start + index * SDD.flat_spacing
        if not index:
            return x

        return self._centerRandom(x, SDD.flat_x_random_range, self._randomFromIndex(index, RIDD.flat_posx))

    def _getFlatWidth(self, index):
        scaleX = 1 + SDD.flat_random_width * self._randomFromIndex(index, RIDD.flat_scalex)
        if index in self.flatInfo:
            feVal = self.flatInfo[index]
            if feVal['effType'] == IDD.flat_narrow:
                return 200 / 2 * scaleX

        return 200 * scaleX

    def getFlatIndexByPos(self, x, startIndex, width):
        for i in range(startIndex, startIndex + 20):
            if self._isInFlat(x, i, width):
                return i

        return -1

    def isHasItem(self, index):
        if index in self.itemGetSet:
            return False

        self.itemGetSet.add(index)
        return self._randomFromIndex(index, RIDD.has_item) < SDD.item_create_prob

    def _isInFlat(self, x, index, avatarWidth):
        posX = self._getFlatPosX(index)
        width = self._getFlatWidth(index)
        half = width / 2
        return posX - half < x + avatarWidth / 2 and x - avatarWidth / 2 < posX + half

    def _centerRandom(self, center, diameter, randomValue):
        radius = diameter / 2
        return center - radius + diameter * randomValue

    def _getEntityById(self, id):
        return KBEngine.entities.get(id)

    def getRelivePos(self, index):
        flatPos = self._getFlatPosX(index)
        return flatPos

    def onNotifyReset(self, isNotify=False):
        self.itemGetSet = set()
        for eid in self.tags['Avatar']:
            entity = self._getEntityById(eid)
            if not entity:
                continue

            entity.reset(isNotify)

    def _checkIsAvatarInFlat(self, index):
        for eid in self.tags['Avatar']:
            entity = self._getEntityById(eid)
            flatIndex = entity.getMyFlatIndex()
            if index == flatIndex:
                return True

        return False

    def onAvatarUseItem(self, eid):
        entity = self._getEntityById(eid)
        if not entity:
            ERROR_MSG('ckz: _checkUseItem failed:')
            return -1

        flatIndex = entity.getMyFlatIndex()
        effectIndex = flatIndex + 1
        if self._checkIsAvatarInFlat(effectIndex):
            ERROR_MSG('ckz some one in this flat')
            return -1

        if effectIndex in self.flatInfo:
            ERROR_MSG('ckz this flat has effect')
            return -1

        self.flatInfo[effectIndex] = {
            'effType': IDD.flat_narrow
        }
        return effectIndex
