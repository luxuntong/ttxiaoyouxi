import os
import xlrd


class Plan(object):
    def __init__(self, pathName, jsDir, pyDir):
        self.pathName = pathName
        self.jsDir = jsDir
        self.pyDir = pyDir
        self.specialDict = {
            'conflict.xlsx': 'dealConflict'}

    def getFiles(self):
        ret = os.listdir(self.pathName)
        ret = list(filter(lambda x: x.endswith('.xlsx') and x[0] != '~', ret))
        return ret

    def generate(self, filename):
        data = xlrd.open_workbook(filename)
        prefix = filename.split('.')[0]
        for table in data.sheets():
            newname = prefix + '_' + table.name
            nrows = table.nrows
            dataDict = {}
            dataType = 'float'
            for i in range(nrows):
                data = table.row_values(i)
                if i == 0:
                    dataType = data[1] if data[1] else dataType
                data = list(filter(lambda x: type(x) != str or x, data))
                if len(data) < 2:
                    continue

                if dataType == 'int':
                    data[1] = int(data[1])

                dataDict[data[0]] = data[1]

            retStr = self.getJsContent(dataDict)
            jsName = newname + '.js'
            jsName = os.path.join(self.jsDir, jsName)
            with open(jsName, 'w') as fw:
                fw.write(retStr)

            retStr = self.getPyContent(dataDict)
            pyName = newname + '.py'
            pyName = os.path.join(self.pyDir, pyName)
            with open(pyName, 'w') as fw:
                fw.write(retStr)

    def getJsContent(self, dataDict):
        strRet = 'const datas = {\n    '
        dataList = []
        for k, v in dataDict.items():
            dataList.append(k + ': ' + str(v))

        dataStr = ',\n    '.join(dataList)
        strRet += dataStr
        strRet += '\n};\nmodule.exports = datas;'
        return strRet

    def getPyContent(self, dataDict):
        dataList = []
        for k, v in dataDict.items():
            dataList.append(k + ' = ' + str(v))

        dataStr = '\n'.join(dataList)
        return dataStr

    def dealConflict(self, filename):
        data = xlrd.open_workbook(filename)
        prefix = filename.split('.')[0]
        for table in data.sheets():
            newname = prefix + '_' + table.name
            stateNames = []
            conflicts = []
            nrows = table.nrows
            for i in range(nrows):
                data = table.row_values(i)
                if i > 1:
                    stateNames.append(data[1])

                    conflictList = data[2:]
                    conflictList = list(
                        filter(lambda x: isinstance(x, float), conflictList))
                    conflicts.append(conflictList)

            stateDict = {}
            for index, stName in enumerate(stateNames):
                stateDict[stName] = index

            writeStr = self.getJsContent(stateDict)
            jsName = newname + '_state.js'
            jsName = os.path.join(self.jsDir, jsName)
            with open(jsName, 'w') as fw:
                fw.write(writeStr)

            writeStr = self.getConlictJS(conflicts)
            jsName = newname + '.js'
            jsName = os.path.join(self.jsDir, jsName)
            with open(jsName, 'w') as fw:
                fw.write(writeStr)

    def getConlictJS(self, conflicts):
        dataList = []
        for cList in conflicts:
            cList = map(lambda x: str(int(x)), cList)
            cData = '[' + ', '.join(cList) + ']'
            dataList.append(cData)

        data = 'const STATE_CONFLICT = [\n    ' + ',\n    '.join(dataList) +\
               '\n];\nmodule.exports = STATE_CONFLICT;'
        return data

    def test(self):
        files = self.getFiles()
        for fileName in files:
            if fileName in self.specialDict:
                funcName = self.specialDict[fileName]
                getattr(self, funcName)(fileName)
                return

            self.generate(fileName)


if __name__ == '__main__':
    plan = Plan('.', r'..\cocoscreator_assets\assets\scripts',
                r'..\kbengine_stone_assets\scripts\data')
    plan.test()
