# -*- coding: utf-8 -*-
import sys

__all__ = [
    'TIMER_ITIMER_CALLBACK'
]

TIMER_ID_GENERATOR = (i for i in range(1,1000000))


def defineTimer(timerName):
    modSelf = sys.modules[__name__]
    setattr(modSelf, timerName, next(TIMER_ID_GENERATOR))


for name in __all__:
    defineTimer(name)
