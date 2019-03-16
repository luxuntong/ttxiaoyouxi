// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var KBEngine = require("kbengine");
var WxBizDataCrypt = require("WxBizDataCrypt");

cc.Class({
    extends: cc.Component,

    properties: {
        btn_start: {
            default: null,
            type: cc.Button,
        },
        textinput_name:{
            default: null,
            type: cc.EditBox,
        },

        label_hint: {
            default: null,
            type: cc.Label,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        cc.log("ckz on load1");
        this.initKbengine();
        this.installEvents();
        
        this.userName = cc.sys.platform != cc.sys.WECHAT_GAME ? this.randomstring(4): '';
        this.btn_start.node.on('click', this.startGame, this);
        this.code = "";
        
        cc.director.preloadScene("HallScene");

        if(cc.sys.platform == cc.sys.WECHAT_GAME) {
            cc.log("we game")
            this.btn_start.node.active = false;
            this.textinput_name.node.active = false;
            this.enableWxShare();
            this.wxLoginNative();
        } else {
            this.textinput_name.string = this.userName;
        }
     },

     hello () {
        cc.log("hello world");
     },


     enableWxShare: function () {
        wx.showShareMenu({
            withShareTicket:true,
        });

        wx.onShareAppMessage(function() {
            return {
                title: "投石对战",
                imageUrl:SHARE_PICTURE,
            }
        });
     },

    wxLoginNative: function(){
        var that = this;
        wx.login({
            success: (res) => {
                cc.log("res:");
                cc.log(res);
                if(!res.code) {
                    return;
                }

                that.code = res.code;
                wx.getSetting({
                    success: function(res){
                        console.log(res);
                        if (res.authSetting['scope.userInfo'])
                        {
                            wx.getUserInfo({
                                success: (res) => {
                                    cc.log('success', res)
                                    that.btn_start.node.active = true;
                                    that.userName = that.code;
                                    cc.sys.localStorage.setItem("encryptedData", res.encryptedData);
                                    cc.sys.localStorage.setItem("iv", res.iv);
                                },
                                fail: (res) =>{
                                    cc.log('fail:', res);
                                },
                                complete: (res) => {
                                    cc.log('complete:', res)
                                }
        
                            });
                        }
                        else
                        {
                            let button = wx.createUserInfoButton({
                                type: 'text',
                                text: '获取用户信息',
                                style: {
                                    left: 10,
                                    top: 76,
                                    width: 200,
                                    height: 40,
                                    lineHeight: 40,
                                    backgroundColor: '#ff0000',
                                    color: '#ffffff',
                                    textAlign: 'center',
                                    fontSize: 16,
                                    borderRadius: 4
                                }
                                });
                            button.onTap((res) => {
                                cc.log('success', res)
                                that.btn_start.node.active = true;
                                that.userName = that.code;
                                cc.sys.localStorage.setItem("encryptedData", res.encryptedData);
                                cc.sys.localStorage.setItem("iv", res.iv);
                            })
                        }
                    }
                });
            }
        });
    },

     randomstring: function(L){
        var s= '';
        var randomchar=function(){
         var n= Math.floor(Math.random()*62);
         if(n<10) return n; //0-9
         if(n<36) return String.fromCharCode(n+55); //A-Z
         return String.fromCharCode(n+61); //a-z
        }
        while(s.length< L) s+= randomchar();
        return s;
    },

     initKbengine: function() {
        var args = new KBEngine.KBEngineArgs();
	
	    args.ip = SERVER_IP;
        args.port = SERVER_PORT;
        args.isWss = IS_USE_WSS;              //是否用wss协议， true:wss  false:ws
        args.isByIP = LOGIN_BY_IP;             //用ip还是用域名登录服务器   有修改官方的kbengine.js
        args.serverURL = SERVER_URL;
	    KBEngine.create(args);
     },

     installEvents:function() {
        KBEngine.Event.register("onConnectionState", this, "onConnectionState");
        KBEngine.Event.register("onLoginFailed", this, "onLoginFailed");
        KBEngine.Event.register("onLoginBaseappFailed", this, "onLoginBaseappFailed");
		KBEngine.Event.register("enterScene", this, "enterScene");
        KBEngine.Event.register("onReloginBaseappFailed", this, "onReloginBaseappFailed");
        KBEngine.Event.register("onReloginBaseappSuccessfully", this, "onReloginBaseappSuccessfully");
		KBEngine.Event.register("onLoginBaseapp", this, "onLoginBaseapp");
     },

     unInstallEvents() {
        KBEngine.Event.deregister("onConnectionState", this, "onConnectionState");
        KBEngine.Event.deregister("onLoginFailed", this, "onLoginFailed");
        KBEngine.Event.deregister("onLoginBaseappFailed", this, "onLoginBaseappFailed");
		KBEngine.Event.deregister("enterScene", this, "enterScene");
        KBEngine.Event.deregister("onReloginBaseappFailed", this, "onReloginBaseappFailed");
        KBEngine.Event.deregister("onReloginBaseappSuccessfully", this, "onReloginBaseappSuccessfully");
		KBEngine.Event.deregister("onLoginBaseapp", this, "onLoginBaseapp");
     },

     onConnectionState : function(success) {
        var logStr = "";
		if(!success) {
            logStr = " Connect(" + KBEngine.app.ip + ":" + KBEngine.app.port + ") is error! (连接错误)";
            this.btn_start.node.active = true;
            this.label_hint.string = "连接错误";
        }
		else {
            logStr = "Connect successfully, please wait...(连接成功，请等候...)";
        }
     
        KBEngine.INFO_MSG(logStr);
	},

     onLoginFailed : function(failedcode) {
        var logStr = '';
        if(failedcode == 20)
        {
           logStr = "Login is failed(登陆失败), err=" + KBEngine.app.serverErr(failedcode) + ", " + KBEngine.app.serverdatas;
        }
        else
        {
           logStr = "Login is failed(登陆失败), err=" + KBEngine.app.serverErr(failedcode);
        }    
        
        this.label_hint.string = "登陆失败," +  KBEngine.app.serverErr(failedcode);
        this.btn_start.node.active = true;
        KBEngine.INFO_MSG(logStr);	
     },

     onReloginBaseappFailed: function(failedcode){
        this.btn_start.node.active = true;
        KBEngine.INFO_MSG("reogin is failed(断线重连失败), err=" + KBEngine.app.serverErr(failedcode))
     },

     onReloginBaseappSuccessfully : function() {
        KBEngine.INFO_MSG("reogin is successfully!(断线重连成功!)")
    },

     onLoginBaseappFailed : function(failedcode) {
        this.btn_start.node.active = true;
        KBEngine.INFO_MSG("LoginBaseapp is failed(登陆网关失败), err=" + KBEngine.app.serverErr(failedcode));
     },

     decodeEncryptedData:function() {
        var encryptedData = cc.sys.localStorage.getItem("encryptedData");
        var sessionKey = cc.sys.localStorage.getItem("sessionKey");
        var iv = cc.sys.localStorage.getItem("iv");
        KBEngine.INFO_MSG("decodeEncryptedData: encryptedData=" + encryptedData + " ,iv=" + iv + " ,sessionKey=" + sessionKey);
        if(sessionKey && encryptedData && iv) {
            var pc = new WxBizDataCrypt(APPID, sessionKey);
            var data = pc.descrytData(encryptedData , iv);
            console.log('解密后 data: ', data)
        }
     },
         
     enterScene : function() {
        KBEngine.INFO_MSG("Login is successfully!(登陆成功!)");
        this.label_hint.string = "登陆成功 !!!";
        
        cc.director.loadScene("HallScene", ()=> {
            KBEngine.INFO_MSG("load jump scene finished");
        });

        this.unInstallEvents();
     },
 
     onLoginBaseapp : function() {
        cc.log("Connect to loginBaseapp, please wait...(连接到网关， 请稍后...)");
     },
 
     Loginapp_importClientMessages : function() {
        this.label_hint.string = "登陆中 ... ...";
        cc.log("Loginapp_importClientMessages ...");
     },
 
     Baseapp_importClientMessages : function() {
         cc.log("Baseapp_importClientMessages ..");
     },
         
     Baseapp_importClientEntityDef: function() {
         cc.log("Baseapp_importClientEntityDef ..")
     },

     createDictString: function(dic) {
        var dictString = "";
        var len = 0;
        for(var pro in dic) len++;

        if(len > 0) {
            var index = 0;
            var dictString = "{"
            for(var prop in dic) {
                dictString += "'" + prop + "'" ;
                dictString += ":";
                dictString += "'" + dic[prop] + "'";
                if(index == len-1) {
                    dictString += "}";
                }else {
                    dictString += ",";
                }
                index++;
            }
        }

        return dictString;
     },
 
    startGame: function (event) {
        if(this.userName.length == 0)
        {
            this.label_hint.string = "用户名不能为空";
            return;
        }
       
        var datas = {};
        datas["platform"] = cc.sys.platform;
        datas = this.createDictString(datas);
        KBEngine.INFO_MSG("login name=" + this.userName);
        KBEngine.Event.fire("login", this.userName, "123456", datas);  
        this.label_hint.string = "登陆中 ... ...";
        this.btn_start.node.active = false;
     },

});
