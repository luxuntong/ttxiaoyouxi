import os
import xlrd


class Plan(object):
    def __init__(self, pathName, jsDir, pyDir):
        self.pathName = pathName
        self.jsDir = jsDir
        self.pyDir = pyDir

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
            for i in range(nrows):
                data = table.row_values(i)
                data = list(filter(lambda x: x, data))
                if len(data) < 2:
                    continue

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

    def test(self):
        files = self.getFiles()
        for fileName in files:
            self.generate(fileName)


if __name__ == '__main__':
    plan = Plan('.', r'..\cocoscreator_assets\assets\scripts\cc_scripts\CONST',
                r'..\kbengine_stone_assets\scripts\data')
    plan.test()
