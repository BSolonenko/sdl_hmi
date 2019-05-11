/*
 * Copyright (c) 2019, Ford Motor Company All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: ·
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer. · Redistributions in binary
 * form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided
 * with the distribution. · Neither the name of the Ford Motor Company nor the
 * names of its contributors may be used to endorse or promote products derived
 * from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

VehicleInfoHelper = Em.Object.create({
    callback: null,

    init: function() {},

    updatePT: function(path, callback){
        this.callback = callback;
        FFW.RPCSimpleClient.sendRequest({
            method: "GetPT",
            data: path
        }, this);
    },

    onMessage: function(data){
        if(typeof(this.callback) == "function"){
            this.callback(data);
        }
    },

    getDefaultDataFromPTJson: function(policyTableJson){
        var policyTable = null;
        try {
            policyTable = JSON.parse(policyTableJson);
        } catch (e) {
            return null;
        }
        return this.getDefaultData(policyTable.policy_table.VehicleDataItems);
    },

    getDefaultData: function(vehicleDataItems){
        if(!Array.isArray(vehicleDataItems)){
            return null;
        }
        for(var i in vehicleDataItems){
            if(vehicleDataItems.hasOwnProperty(i) &&
               !this.isValidObject(vehicleDataItems[i])){
                return null;
            }
        }
        return this.defaultData(vehicleDataItems);
    },

    defaultData: function(item){
        if(typeof(item) == "string"){
            switch(item){
                case "Integer": {
                    return 0;
                }
                case "String": {
                    return "some string";
                }
                case "Float": {
                    return 0;
                }
                case "Boolean": {
                    return false;
                }
                default: {
                    if(ApiRepresentation.hasOwnProperty(item)) {
                        return ApiRepresentation[item];
                    }
                    return "undefined";
                }
            }
        }
        if(Array.isArray(item)){
            var result = {};
            for(var i in item) {
                if(item.hasOwnProperty(i)){
                    result[item[i].name] = this.defaultData(item[i]);
                }
            }
            return result;
        }
        if(item.type == "Struct"){
            return this.defaultData(item.params);
        }
        var data = this.defaultData(item.type);
        if(item.array){
          return [data];
        }
        return data;
    },

    isValidObject: function(item){
        if(typeof(item.name) != "string" ||
           typeof(item.type) != "string"){
            return false;
        }
        if(item.type == "Struct"){
            if(!Array.isArray(item.params)){
                return false;
            }
            for(var i in item.params){
                if(item.params.hasOwnProperty(i) &&
                   !this.isValidObject(item.params[i])){
                    return false;
                }
            }
        }
        return true;
    }
});
