// ==UserScript==
// @name         Chaoz Auto Scan
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  auto scan!
// @author       You
// @match        https://*.planetarion.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    (function(w) {
        var doc = w.document;
        if (!doc) return;

        var $j;
        var page = '';
        var minReloadTime = 10; //Minimum time for auto reload, in seconds
        var maxReloadTime = 60; //Minimum time for auto reload, in seconds
        var autoReloadScanPage = true; //Set false to stop auto reload on alliance_scans page
        var alrtScope;
        var globalDependencies = ['jQuery'];

        if (doc.readyState == 'complete') {
            checkDeps(true);
        } else {
            var _ev = w.addEventListener ? {add: 'addEventListener', rem: 'removeEventListener', pfx: ''} : w.attachEvent ? {add: 'attachEvent', rem: 'detachEvent', pfx: 'on'} : null;
            if(_ev) {
                doc[_ev.add](_ev.pfx + 'DOMContentLoaded', waitLoad, false);
                doc[_ev.add](_ev.pfx + 'readystatechange', waitLoad, false);
                w[_ev.add](_ev.pfx + 'load', waitLoad, false);
            } else {
                checkDeps();
            }
        }

        function waitLoad(ev) {
            ev = ev || w.event;
            if(ev.type === 'readystatechange' && doc.readyState && doc.readyState !== 'complete' && doc.readyState !== 'loaded') return;
            if(_ev) {
                doc[_ev.rem](_ev.pfx + 'DOMContentLoaded', waitLoad);
                doc[_ev.rem](_ev.pfx + 'readystatechange', waitLoad);
                w[_ev.rem](_ev.pfx + 'load', waitLoad);
                _ev = null;
                checkDeps(true);
            }
        }

        function checkDeps(loaded) {
            var remainingDeps = globalDependencies.filter(function(dep) {
                return !w[dep];
            });
            if(!remainingDeps.length) init();
            else if (loaded) console.error(remainingDeps.length+' missing userscript dependenc'+(remainingDeps.length==1?'y':'ies')+': '+remainingDeps.join(', '));
        }

        function init() {
            if($j) return;
            $j = w.jQuery;
            if(typeof w.PA != 'undefined' && 'page' in w.PA) { page = w.PA.page; }

            if(page == 'alliance_scans') {
                autoScanRequests();
            }
        }
        function autoScanRequests() {
            //Override alert box, to avoid "hang" of auto reload
            if (typeof unsafeWindow === "undefined") {
                alrtScope = window;
            } else {
                alrtScope = unsafeWindow;
            }

            alrtScope.alert = function (str) {
                console.log ("Intercepted alert: ", str);
            };

            //Click each scan link
            var hasScanned = false;
            $j.each($j('a[class^="link_"]'), function(ind, obj) {
                $j(this).click();
                hasScanned = true;
            });

            //Force reload in 10 sec to see if there are added more scans
            var urlRandomizer = Math.floor((Math.random() * 9999999999) + 1000000000);
            if(hasScanned) {
                setTimeout(function(){
                window.location.href = 'alliance_scans.pl?rn=' + urlRandomizer + '#tab2';
                }, 10000);
            }
            if(autoReloadScanPage) {
                var randomTimeToReload = Math.floor(Math.random() * (Math.floor(maxReloadTime*1000) - Math.ceil(minReloadTime*1000) + 1)) + Math.ceil(minReloadTime*1000);
                setTimeout(function(){
                    window.location.href = 'alliance_scans.pl?rn=' + urlRandomizer + '#tab2';
                }, randomTimeToReload);
                console.log('Auto reload in ' + Math.floor(randomTimeToReload/1000) + ' seconds.');
            }
    }
    })(window);
})();