# -*- coding: utf-8 -*-
import KBEngine
from KBEDebug import *
import GameUtils
import GameConfigs
from interfaces.EntityCommon import EntityCommon

TIMER_TYPE_ADD_TRAP = 1

class Avatar(KBEngine.Entity, EntityCommon):
	def __init__(self):
		KBEngine.Entity.__init__(self)
		EntityCommon.__init__(self)
		DEBUG_MSG("Avatar cell ctor position")
		DEBUG_MSG(self.position)
		self.getCurrRoom().onEnter(self)
		
	def isAvatar(self):
		"""
		virtual method.
		"""
		return True
	#--------------------------------------------------------------------------------------------
	#                              Callbacks
	#--------------------------------------------------------------------------------------------
	def onTimer(self, tid, userArg):
		pass


	def onUpgrade(self):
		pass
		
	def onEnterTrap(self, entityEntering, range_xz, range_y, controllerID, userarg):
		pass

	def onLeaveTrap(self, entityLeaving, range_xz, range_y, controllerID, userarg):
		pass

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

	def jump(self, exposed):
		"""
		defined.
		玩家跳跃 我们广播这个行为
		"""
		DEBUG_MSG("receive avavtar %i jump, selfID=%i" % (exposed, self.id))
		if exposed != self.id:
			return
		DEBUG_MSG("avatar %i start jump" % (self.id))
		self.otherClients.onJump()

	def pickUpItem(self, exposed, itemID, position):
		"""
		defined.
		玩家捡石头 我们广播这个行为
		"""
		DEBUG_MSG("avavtar %i pickUpItem, selfID=%i" % (exposed, self.id))
		if exposed != self.id:
			return
		DEBUG_MSG("avatar %i pick up item=%i" % (self.id, itemID))
		DEBUG_MSG(position)
		self.otherClients.onPickUpItem(itemID, position)


	def throwItem(self, exposed, itemID, force):
		DEBUG_MSG("avavtar %i throw item=%d, force, selfID=%i" % (exposed, itemID, self.id))
		DEBUG_MSG(force)
		if exposed != self.id:
			return
		DEBUG_MSG("avatar %i pick up item=%i" % (self.id, itemID))
		self.otherClients.onThrowItem(itemID, force)

	def newTurn(self, exposed):
		DEBUG_MSG("avavtar %i newTurn, selfID=%i" % (exposed, self.id))
		if exposed != self.id:
			return

		room = self.getCurrRoom()
		
		if room:
			room.nextPlayer()


	def stopWalk(self, exposed, pos):
		DEBUG_MSG("avavtar %i stopWalk, selfID=%i" % (exposed, self.id))
		if exposed != self.id:
			return

		self.otherClients.onStopWalk(pos)


	def startWalk(self, exposed):
		DEBUG_MSG("avavtar %i start walk, selfID=%i" % (exposed, self.id))
		if exposed != self.id:
			return

		self.otherClients.onStartWalk()

	def resetItem(self, exposed, itemID):
		DEBUG_MSG("avavtar %i reset item:%i, selfID=%i" % (exposed, itemID, self.id))
		if exposed != self.id:
			return

		self.otherClients.onResetItem(itemID)

