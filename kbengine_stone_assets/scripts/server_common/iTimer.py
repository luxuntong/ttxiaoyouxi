# -*- coding: utf-8 -*-
from KBEDebug import *
import KBEngine

import gametimer
import traceback

if KBEngine.component == 'cellapp':
    TIMER_PROP = 'timerDataCell'
    isCell = True
else:
    TIMER_PROP = 'timerDataBase'
    isCell = False

class ITimer(object):
    def __setTimerData(self, timerID, data):
        timerProp = getattr(self, TIMER_PROP)
        timerProp[timerID] = data

    def __popTimerData(self, timerID):
        timerProp = getattr(self, TIMER_PROP)
        return timerProp.pop(timerID, None)

    def _reloadTimerData(self):
        timerProp = getattr(self, TIMER_PROP)
        for data in timerProp.itervalues():
            t = data[1]
            if hasattr(t, 'reloadScript'):
                t.reloadScript()
            elif hasattr(t, '__iter__'):
                for v in t:
                    if hasattr(v, 'reloadScript'):
                        v.reloadScript()
                        
    def _hasTimer(self, timerID):
        timerProp = getattr(self, TIMER_PROP)
        return timerID in timerProp

    def _callback(self, t, funcName, funcArgs=None, varTimerID='', tag=''):
        if not funcName:
            return 0

        if isCell and not self.isReal():
            return 0

        if funcArgs == None:
            funcArgs = ()

        if t<0:
            traceback.print_stack()

        timerId = self.addTimer(t, 0, gametimer.TIMER_ITIMER_CALLBACK)

        self.__setTimerData(timerId, (funcName, funcArgs, varTimerID, tag))

        return timerId

    def toCallbackAfter(self, t, fnName='', varTimeID=''):
        """Usage: tid = self.callbackFun(t, tid).yourOwnFunction(args1, args2, ...)"""
        return _CallbackCalled(t, varTimeID, fnName, self)

    def flowControllerDelayExecEventCallback(self, delayEvent, context):
        delayEvent.handle_be_triggered_after_delay(context)

    def flowControllerDelayCallback(self, delayEvent, cbFuncName, cbArgs, cbKwArgs):
        getattr(delayEvent, cbFuncName)(*cbArgs, **cbKwArgs)

    def _cancelCallback(self, timerID, tag=''):
        if not timerID:
            return

        data = self.__popTimerData(timerID)
        if not data:
            return

        if (tag or data[3]) and tag!=data[3]:
            ERROR_MSG('cancel timer mismatch', timerID, '|', tag, '|', data, self.getControllers())
            for line in traceback.format_stack():
                ERROR_MSG(line)

        varTimerId = data[2]
        if varTimerId:
            exec('self.%s=0' % (varTimerId,))

        self.delTimer(timerID)

    def _cancelAllCallbacks(self):
        timerProp = getattr(self, TIMER_PROP)
        for timerId in list(timerProp.keys()):
            self._cancelCallback(timerId)

    def _onTimerCallback(self, timerID):
        data = self.__popTimerData(timerID)
        if data == None:
            return

        funcName, funcArgs, varTimerId, tag = data
        if varTimerId:
            exec('self.%s=0' % (varTimerId,))

        getattr(self, funcName)(*funcArgs)


class _CallbackCalled(object):
    def __init__(self, t, tid, fnName, owner: ITimer):
        self.delayTime = t
        self.varTimeID = tid
        self.fnName = fnName
        self.owner = owner

    def __call__(self, *args):
        if not self.fnName:
            raise TypeError("special function name '{}' not define".format(self.fnName))
        return self.owner._callback(self.delayTime, self.fnName, args, self.varTimeID)

    def __getattr__(self, fnName):
        if self.fnName and fnName != self.fnName:
            raise TypeError("'{}' must be called as special".format(self.fnName))
        if not hasattr(self.owner, fnName):
            raise AttributeError("'{0}' object has no attribute '{1}'".format(self.owner.__class__.__name__, fnName))
        fn = getattr(self.owner, fnName)
        if not callable(fn):
            raise TypeError("'{}' object is not callable".format(type(fn).__name__))
        return lambda *args: self.owner._callback(self.delayTime, fnName,
                                                  funcArgs=args,
                                                  varTimerID=self.varTimeID)