// ==UserScript==
// @name         Chaoz Toolbox
// @namespace    http://tampermonkey.net/
// @version      1.20
// @description  A few scripts for The Heralds of CHaoz!
// @author       Idl3r
// @updateURL    https://stargate.veibust.no/pa/chaoz.toolbox.user.js
// @downloadURL  https://stargate.veibust.no/pa/chaoz.toolbox.user.js
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
        var tick = 0;
        var globalDependencies = ['jQuery', 'get_cookie', 'get_ships_cookie', 'PA'];
        var ships = { "Harpy": 0, "Phoenix": 1, "Gryphon": 2, "Chimera": 3, "Pegasus": 4, "Syren": 5, "Wyvern": 6, "Dragon": 7, "Minotaur": 8, "Leviathan": 9, "Behemoth": 10
                     , "Spider": 11, "Beetle": 12, "Viper": 13, "Scarab": 14, "Locust": 15, "Black Widow": 16, "Mantis": 17, "Scorpion": 18, "Mosquito": 19, "Dragonfly": 20, "Hornet": 21, "Termite": 22
                     , "Phantom": 23, "Banshee": 24, "Ghost": 25, "Shadow": 26, "Nightmare": 27, "Spectre": 28, "Wraith": 29, "Illusion": 30, "Mirage": 31, "Haunt": 32
                     , "Corsair": 33, "Cutlass": 34, "Thief": 35, "Cutter": 36, "Clipper": 37, "Buccaneer": 38, "Marauder": 39, "Pirate": 40, "Ironclad": 41, "Raider": 42, "Galleon": 43
                     , "Vendor": 44, "Avenger": 45, "Defender": 46, "Ranger": 47, "Dealer": 48, "Investor": 49, "Tycoon": 50, "Guardian": 51, "Broker": 52, "Rambler": 53, "Merchant": 54, "Baliff": 55, "Liquidator": 56 };
        var races = { "Ter": 1, "Cat": 2, "Xan": 3, "Zik": 4, "Etd": 5 };

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
        function getUrlVars()
        {
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for(var i = 0; i < hashes.length; i++)
            {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        }
        function init() {
            if($j) return;
            $j = w.jQuery;
            if(typeof w.PA != 'undefined' && 'page' in w.PA) { page = w.PA.page; }
            if(typeof w.PA != 'undefined' && 'last_tick' in w.PA) { tick = w.PA.last_tick; }
            //console.log(page);

            if(page == 'alliance_defence') {
                initAutoBattleCalcLink();
                setupDefencePage();
            }
            else if(page == 'alliance_intel') {
                initAllianceIntel();
                $j(document).ready(function() {
                    tableSortIntel.init();
                });
            }
            else if(page == 'bcalc') {
                initBattleCalcData();
            }
            else if(page == 'scan') {
                addUnitScanStats();
            }
            else if(page == 'galaxy') {
                initGalaxyPage();
            }
            else if(page == 'alliance_fleets') {
                if(getUrlVars().view === 'launch') {
                    initAllianceFleetsLaunch();
                }
            }
            else if(page == 'alliance_fund') {
                initAllianceFund();
                $j(document).ready(function() {
                    tableSortIntel.init();
                });
            }
        }
        function initAllianceFund() {
            var fundTable = $j('#alliance_fund_tax table');
            $j(fundTable).attr('id','inteltable');
            fundTable.addClass('tablesort');
            //fundTable.find('tbody').children('tr').eq(0).addClass('static_row');
            fundTable.find('tbody').children('tr').eq(0).remove();

            //tableSort.init();
        }

        function initAllianceIntel() {
            $j("p:last").html("An * after the distorters and amplifiers count indicates that it is from a dev scan.<br>If the amplifier count is a '-'  it means no development scans was found.");

            //Get the table that displays the intel data
            var $intel_table = $j('table:eq(1)');
             $j($intel_table).addClass('tablesort');
             $j($intel_table).attr('id','inteltable');

            //Remove unwanted columns
            $j($intel_table).find('tr').each(function() {
                $j(this).children('th').eq(4).remove();
                $j(this).children('th').eq(4).remove();
                $j(this).children('th').eq(7).remove();
                $j(this).children('td').eq(4).remove();
                $j(this).children('td').eq(4).remove();
                $j(this).children('td').eq(7).remove();
            });
            $j($intel_table).find('tr').first().find('th:nth-child(7)').after('<th class="center" style="padding-left:10px">Value</th><th class="center" style="padding-left:10px">Score</th><th class="center" style="padding-left:10px">Roids</th><th class="center" style="padding-left:10px">Amps</th>');

            $j($intel_table).find('tr').each(function(data) {
                //$j(this).find('th:nth-child(7)').after('<th class="center" style="padding-left:10px">Value</th><th class="center" style="padding-left:10px">Score</th><th class="center" style="padding-left:10px">Roids</th><th class="center" style="padding-left:10px">Amps</th>');
                var $coords = $j(this).find('td:nth-child(1) a').html(),$x,$y,$z,$roids,$value,$score;

                if ($coords !== undefined && $coords !== "::") {
                    $x = $coords.match(/(\d+)/g)[0];
                    $y = $coords.match(/(\d+)/g)[1];
                    $z = $coords.match(/(\d+)/g)[2];

                    //Add the new columns to the intel table
                    $j(this).find('td:nth-child(7)').after('<td class="center" style="padding-left:10px" id="value' + $x + '_' + $y + '_' + $z + '"></td><td class="center" style="padding-left:10px" id="score' + $x + '_' + $y + '_' + $z + '"></td><td class="center" style="padding-left:10px" id="roids' + $x + '_' + $y + '_' + $z + '"></td><td class="center" style="padding-left:10px" id="amps' + $x + '_' + $y + '_' + $z + '">-</td>');

                    //Lookup the planet details from the galaxy page and update the new columns
                    $j.get("https://game.planetarion.com/galaxy.pl?x=" + $x + "&y=" + $y, function(data, status) {

                        $j(data).find('#galtable tbody tr').each(function(data) {
                            var $planetNumber = $j(this).find('td:nth-child(1)').html();

                            //Check to see if we have found the correct planet, if so update the intel table with the new details
                            if ($planetNumber === $z) {
                                $roids = $j(this).find('td:nth-child(6)').html();
                                $value = $j(this).find('td:nth-child(7)').html();
                                $score = $j(this).find('td:nth-child(8)').html();

                                document.getElementById("value" + $x + '_' + $y + '_' + $z).innerHTML = $value;
                                document.getElementById("score" + $x + '_' + $y + '_' + $z).innerHTML = $score;
                                document.getElementById("roids" + $x + '_' + $y + '_' + $z).innerHTML = $roids;
                            }

                        });

                        //Lookup the Development Scan for the planet from the alliance scans page, then find the number of
                        //Wave Amplifiers the planet has an update the intel table
                        $j.get("https://game.planetarion.com/alliance_scans.pl?x=" + $x + "&y=" + $y + "&z=" + $z + "", function(data, status) {

                            $j(data).find('.maintext table tbody tr').each(function(data) {

                                var $scanType = $j(this).find('td:nth-child(1)').html();
                                var $scanLink = $j(this).find('td:nth-child(5)').html();

                                if ($scanType === 'Development Scan') {

                                    var $scanUrl = $j($scanLink).attr('href');

                                    $j.get("https://game.planetarion.com/" + $scanUrl, function(data, status) {
                                        $j(data).find('#scan table tbody tr').each(function(data){

                                            var $col1 = $j(this).find('td:nth-child(1)').html();

                                            if($col1 === 'Wave Amplifier'){
                                                var $numAmps = $j(this).find('td:nth-child(2)').html();
                                                document.getElementById("amps" + $x + '_' + $y + '_' + $z).innerHTML = $numAmps + '*';
                                            }

                                        });
                                    });
                                    //We return false here as we have found the first Development scan, we dont need to continue, if we do
                                    //it will provide potential out of date data.
                                    return false;
                                }
                            });;
                        });
                    });
                }
            });
        }
        function initGalaxyPage() {
            var galaxyTable = $j('#galtable');
            var x = $j('.input_coords[name="x"]').val();
            var y = $j('.input_coords[name="y"]').val();
            //Add headers
            $j(galaxyTable).find('thead tr').each(function() {
                $j(this).children('th').eq(1).css('width', 'auto');
                $j(this).children('th').eq(2).css('width', 'auto');
                $j(this).children('th').eq(5).css('width', '40px');
                $j(this).children('th').eq(7).after('<th class="right" style="width: 50px;">Score</th>');
                $j(this).children('th').eq(7).after('<th class="right" style="width: 50px;">Value</th>');
                $j(this).children('th').eq(7).after('<th class="right" style="width: 50px;">Size</th>');
                $j(this).children('th').eq(7).after('<th class="right" style="width: 50px;">Xp</th>');
                $j(this).children('th').eq(13).css('width', 'auto');
            });
            $j(galaxyTable).find('tbody tr').each(function() {
                var z = $j(this).children('td').eq(0).text();
                $j(this).children('td').eq(7).after('<td class="right" id="score_' + z + '"></td>');
                $j(this).children('td').eq(7).after('<td class="right" id="value_' + z + '"></td>');
                $j(this).children('td').eq(7).after('<td class="right" id="size_' + z + '"></td>');
                $j(this).children('td').eq(7).after('<td class="right" id="xp_' + z + '"></td>');
            });
            $j(galaxyTable).find('tfoot tr').each(function() {
                $j(this).children('td').eq(0).attr('colspan','4');
                $j(this).children('td').eq(5).attr('colspan','6');
                $j(this).children('td').eq(6).remove();
            });
            try {
                $j.get("https://pa.idler.no/planetarioninfo/planets/?x=" + x + "&y=" + y + "&tick=" + tick, function(data, status) {
                    $j.each(data, function(index, planet) {
                        $j('#score_' + planet.z).html(planet.scoreDiff.toFixed(1) + '%').attr('title',planet.scoreChange).css('color', getDiffColor(planet.scoreDiff));
                        $j('#value_' + planet.z).html(planet.valueDiff.toFixed(1) + '%').attr('title',planet.valueChange).css('color', getDiffColor(planet.valueDiff));
                        $j('#size_' + planet.z).html(planet.sizeDiff.toFixed(1) + '%').attr('title',planet.sizeChange).css('color', getDiffColor(planet.sizeDiff));
                        $j('#xp_' + planet.z).html(planet.xpDiff.toFixed(1) + '%').attr('title',planet.xpChange).css('color', getDiffColor(planet.xpDiff));
                    });
                    tableSort.init();
                });
            } catch(err) {
            }
        }
        function getDiffColor(num) {
            if(num < 0) {
                return '#ff0000';
            }
            else if (num == 0) {
                return '#ffff00';
            }
            else {
                return '#00ff00';
            }
        }
        function initAutoBattleCalcLink() {
            $j('.ally_def_incs_wrapper').each(function() {
                var that = this;
                var linkDiv = $j(this).find('.ally_def_target_links');
                var bcLink = document.createElement("div");
                bcLink.innerHTML = 'AC';
                bcLink.onclick = function() {
                    generateBattleCalcData(that);
                };

                $j(linkDiv).after(bcLink);
            });
        }
        function initBattleCalcData() {
            var defFleetCounter = 1;

            var autobcalc = localStorage.getItem('autobcalc');
            if(autobcalc !== null && autobcalc !== undefined) {
                autobcalc = JSON.parse(autobcalc);
                $j('#comment').val('Calc auto generated by Chaoz Toolbox. Remember to trim attack fleets!');
                $j.each(autobcalc.def_fleets, function(ind, fleet){
                    addFleet('def', fleet, defFleetCounter);
                    defFleetCounter++;
                });
                var attFleetCounter = 1;
                $j.each(autobcalc.att_fleets, function(ind, fleet){
                    addFleet('att', fleet, attFleetCounter);
                    attFleetCounter++;
                });
            }
            else {
                console.log('nothing to calc');
            }
            localStorage.removeItem("autobcalc");
        }
        function setupDefencePage() {
            var rowCount = 0;
            $j('#intel tr:gt(3)').remove()
            $j('#intel').append('<tr><th class="center" colspan="2">Information</th></tr>');
            $j('#intel').append('<tr><th class="left">Value:</th><td class="right" id="intel_value"></td></tr>');
            $j('#intel').append('<tr><th class="left">Score:</th><td class="right" id="intel_score"></td></tr>');
            $j('#intel').append('<tr><th class="left">Roids:</th><td class="right" id="intel_roids"></td></tr>');
            $j(document).ready(function() {
                try {
                    $j(".intel").hover(function() {
                        var a = $j(this).text();
                        var x = a.match(/(\d+)/g)[0];
                        var y = a.match(/(\d+)/g)[1];
                        var z = a.match(/(\d+)/g)[2];
                        $j.get("https://pa.idler.no/planetarioninfo/planet/?x=" + x + "&y=" + y + "&z=" + z + "&tick=" + tick + "&rn=" + Math.random(), function(data, status) {
                            $j('#intel_value').text(data.value);
                            $j('#intel_score').text(data.score);
                            $j('#intel_roids').text(data.size);
                        });
                    });
                } catch (exx) {}
            });
            //$j('#dships_box').css("background-color", "black");
             $j('.ally_def_incs_wrapper').each(function() {
                var eta = $j(this).closest('.ally_def_eta_wrapper').data('eta');
                var userDetail = $j(this).find('div.ally_def_target_coords').find('a').attr('href');
                var userId = $j(this).data('inc').split('_')[0];
                var userCoords = $j(this).find('div.ally_def_target_coords').text().split(' ')[0];
                var planetX = userCoords.match(/(\d+)/g)[0],
                    planetY = userCoords.match(/(\d+)/g)[1],
                    planetZ = userCoords.match(/(\d+)/g)[2];
                //var homeBaseShipString = getDefenceShipString(userId);
                //console.log(homeBaseShipString);

//                 $j(this).find('.ally_def_attacker.mission_attack').each(function(ind, obj) {
//                     var PAUrl = 'https://game.planetarion.com/bcalc.pl?';
//                     var attackCoords = $j(obj).find('.mission_attack').first().text();
//                     var attackX = attackCoords.match(/(\d+)/g)[0],
//                         attackY = attackCoords.match(/(\d+)/g)[1],
//                         attackZ = attackCoords.match(/(\d+)/g)[2];
//                     var userScans = $j(obj).find('div.ally_def_attacker_links a:contains("A")').attr('href');
//                     if(userScans === undefined) {
//                         userScans = $j(obj).find('div.ally_def_attacker_links a:contains("U")').attr('href');
//                     }

//                     if(userScans !== undefined) {
//                         PAUrl = PAUrl + 'def_coords_x_1=' + planetX + '&def_coords_y_1=' + planetY + '&def_coords_z_1=' + planetZ + '&att_coords_x_1=' + attackX + '&att_coords_y_1=' + attackY + '&att_coords_z_1=' + attackZ;
//                     }

//                     $j.get("https://game.planetarion.com/alliance_fleets.pl?view=free&member=" + userId, function(data, status) {
//                         $j(data).find('.maintext table:nth-of-type(2) td.left').each(function() {
//                             var $shipPANumber = $j(this).find('a').attr('class').match(/(\d+)/g)[0],
//                                 $shipCount = $j(this).next().html();
//                             PAUrl = PAUrl + '&def_1_' + $shipPANumber + '=' + $shipCount.replace(',', '');
//                         });

//                         if (userScans !== undefined) {
//                             var scanUrl = 'https://game.planetarion.com/';

//                             $j.get(scanUrl + "" + userScans, function(data, status) {
//                                 $j(data).find('table tr').each(function(dt) {
//                                     var $attShipName = $j(this).find('td:nth-of-type(1)').html(),
//                                         $attShipCount = $j(this).find('td:nth-of-type(2)').html().replace(',', ''),
//                                         $attShipNumber = ships[$attShipName];
//                                     PAUrl = PAUrl + '&att_1_' + $attShipNumber + '=' + $attShipCount;
//                                 });

//                                 $j(obj).find('.ally_def_attacker_coords').before($j('<a href="'+PAUrl+'" target="_blank" style="padding-right: 5px;">').addClass('red-classs').html('BC'));

//                             });
//                         } else {
//                             $j(obj).find('.ally_def_attacker_coords').before($j('<a href="'+PAUrl+'" target="_blank" style="padding-right: 5px;">').addClass('red-classs').html('BC'));
//                         }
//                     });


//                 });
                $j(this).find('.ally_def_defender.mission_defend').each(function(ind, obj) {
                    var defenceCoords = $j(obj).find('.mission_defend').first().text();
                    var defenceX = defenceCoords.match(/(\d+)/g)[0],
                        defenceY = defenceCoords.match(/(\d+)/g)[1],
                        defenceZ = defenceCoords.match(/(\d+)/g)[2],
                        defenceFleet = $j(obj).find('.ally_def_defender_fleetname a').text(),
                        shipCount = $j(obj).find('.ally_def_defender_shipcount').text();

                    var btn = document.createElement("input");
                    btn.id = "recall" + rowCount;
                    btn.type = "Button";
                    btn.value = "Recall";
                    btn.name = "recall";
                    btn.style.cssText = 'margin-right: 5px;';

                    var select = document.createElement("select");
                    select.id = btn.id + "_select";
                    select.options.add(new Option("Select", "r0", true, true));
                    select.options.add(new Option("Recall", "r1", false, false));
                    select.options.add(new Option("Recall Now", "r2", false, false));
                    select.options.add(new Option("Recall ETA 1", "r3", false, false));
                    select.options.add(new Option("Fake Be Ready", "r4", false, false));

                    $j(obj).find('.ally_def_defender_mdata').after(select);

                    btn.onclick = function() {
                        var s = document.getElementById(btn.id + '_select');
                        sendRecallMail(userCoords, defenceCoords, defenceFleet, shipCount,eta, s.options[s.selectedIndex].value);
                    };

                    select.after(btn);
                    rowCount++;
                });

            });

        }
        function getBaseFleet(userId) {
            var baseShips = [];
            $j.ajax({
                url: "https://game.planetarion.com/alliance_fleets.pl?view=free&member=" + userId,
                type: 'get',
                dataType: 'html',
                async: false,
                success: function(data) {
                    $j(data).find('.maintext table:nth-of-type(2) td.left').each(function() {
                        var $shipPANumber = $j(this).find('a').attr('class').match(/(\d+)/g)[0],
                            $shipCount = $j(this).next().html();
                        baseShips.push({
                            type: $shipPANumber,
                            count: $shipCount.replace(/,/g, '')
                        });
                    });
                }
            });
            return baseShips;
        }
        function getDefenceFleet(id) {
            var defShips = [];
            var fleet = w.PA_dships[id];
            $j.each(fleet, function(ind, ship) {
                defShips.push({
                    type: ships[ship.name],
                    count: ship.count
                });
            });
            return defShips;
        }
        function getAttackFleet(url) {
            var attShips = [];
            $j.ajax({
                url: "https://game.planetarion.com/" + url,
                type: 'get',
                dataType: 'html',
                async: false,
                success: function(data) {
                    $j(data).find('table tr').each(function(dt) {
                        var $attShipName = $j(this).find('td:nth-of-type(1)').html(),
                            $attShipCount = $j(this).find('td:nth-of-type(2)').html().replace(',', ''),
                            $attShipNumber = ships[$attShipName];
                        attShips.push({
                            type: $attShipNumber,
                            count: $attShipCount.replace(',', '')
                        });
                    });
                }
            });
            return attShips;
        }
        function generateBattleCalcData(obj) {
            var autobcalc = {
                def_fleets: [],
                att_fleets: [],
            };
            var eta = $j(obj).closest('.ally_def_eta_wrapper').data('eta');

            //Get base fleet
            var userDetail = $j(obj).find('div.ally_def_target_coords').find('a').attr('href');
            var userId = $j(obj).data('inc').split('_')[0];
            var userCoords = $j(obj).find('div.ally_def_target_coords').text().split(' ')[0];
            var roids = $j(obj).find('.ally_def_target_mdata_roids').text();
            var planetX = userCoords.match(/(\d+)/g)[0],
                planetY = userCoords.match(/(\d+)/g)[1],
                planetZ = userCoords.match(/(\d+)/g)[2];
            autobcalc.def_fleets.push({
                x:planetX,
                y:planetY,
                z:planetZ,
                roids: roids,
                ships:getBaseFleet(userId)
            });
            //Get defence fleets
            $j(obj).find('.ally_def_defender.mission_defend').each(function(defind, defobj) {
                var fleetId = $j(defobj).find('div.ally_def_defender_fleetname a').attr('id').split('_')[1];
                var defCoords = $j(defobj).find('div.ally_def_defender_coords a').text();
                var defX = defCoords.match(/(\d+)/g)[0],
                    defY = defCoords.match(/(\d+)/g)[1],
                    defZ = defCoords.match(/(\d+)/g)[2];
                var race = races[$j(defobj).find('.ally_def_defender_race').text()];
                autobcalc.def_fleets.push({
                    x:defX,
                    y:defY,
                    z:defZ,
                    roids: 0,
                    race: race,
                    ships:getDefenceFleet(fleetId)
                });
            });
            //Get attacker fleets
            $j(obj).find('.ally_def_attacker.mission_attack').each(function(attind, attobj) {
                var attCoords = $j(attobj).find('div.ally_def_attacker_coords a').text();
                var attX = attCoords.match(/(\d+)/g)[0],
                    attY = attCoords.match(/(\d+)/g)[1],
                    attZ = attCoords.match(/(\d+)/g)[2];
                var race = races[$j(attobj).find('.ally_def_attacker_race').text()];
                var scanId = $j(attobj).find('div.ally_def_attacker_links a:contains("A")').attr('href');
                if(scanId === undefined) {
                    scanId = $j(attobj).find('div.ally_def_attacker_links a:contains("U")').attr('href');
                }
                if(scanId !== undefined) {
                    autobcalc.att_fleets.push({
                        x:attX,
                        y:attY,
                        z:attZ,
                        roids: 0,
                        race: race,
                        ships:getAttackFleet(scanId)
                    });
                }
            });
            localStorage.setItem("autobcalc", JSON.stringify(autobcalc));
            window.open('bcalc.pl?rn=' + Math.random(),'_blank');
        }
        function addFleet(type, fleet, fleetCounter) {
            if(fleetCounter !== 1) {
                w.add_fleet(type);
            }
            else {
                if(type === 'def') {
                    $j('#def_asteroids').val(fleet.roids)
                }
            }
            $j('#' + type + '_coords_x_' + fleetCounter).val(fleet.x)
            $j('#' + type + '_coords_y_' + fleetCounter).val(fleet.y)
            $j('#' + type + '_coords_z_' + fleetCounter).val(fleet.z)
            $j('#' + type + '_planet_value_' + fleetCounter).val(fleet.value);
            $j('#' + type + '_planet_score_' + fleetCounter).val(fleet.score);
            $j('#' + type + '_' + fleetCounter + '_race').val(fleet.race);
            $j.each(fleet.ships, function(shipind, ship) {
                $j('#' + type + '_' + fleetCounter + '_' + ship.type).val(ship.count);
                $j('#' + type + '_row_' + ship.type).css("display", "");
            });
        }
        function sendRecallMail($target, $defender, $fleetName, $ShipCount, $fleetEta, $msgType) {
            if ($msgType == 'r0') {
                alert('Message type not set.');
                return;
            }
            var $defenceX = $defender.match(/(\d+)/g)[0],
                $defenceY = $defender.match(/(\d+)/g)[1],
                $defenceZ = $defender.match(/(\d+)/g)[2];
            var $subject, $message;
            switch ($msgType) {
                case 'r1':
                    $subject = "Alliance Defence Recall";
                    $message = "You can recall your '" + $fleetName + "' fleet at ETA " + $fleetEta + " from " + $target + "\n\n Regards\n The THC Dept of Defence";
                    break;
                case 'r2':
                    $subject = "Alliance Defence Recall NOW";
                    $message = "Recall your '" + $fleetName + "' fleet at ETA " + $fleetEta + " from " + $target + " NOW.\n\n Regards\n The THC Dept of Defence";
                    break;
                case 'r3':
                    $subject = "Alliance Defence Recall ETA 1";
                    $message = "Recall your '" + $fleetName + "' fleet at ETA " + $fleetEta + " from " + $target + " at ETA 1 please.\n\n Regards\n The THC Dept of Defence";
                    break;
                case 'r4':
                    $subject = "Alliance Defence Be Ready To Recall";
                    $message = "Your '" + $fleetName + "' fleet at ETA " + $fleetEta + " to " + $target + " may be required to recall due to it been a fake, please be ready for futher recalls mails giving more instructions.\n\n Regards\n The THC Dept of Defence";
                    break;
            }

            var $url = 'https://game.planetarion.com/messages.pl'
            $j.post($url, {
                subject: $subject,
                message: $message,
                to: "1",
                x: $defenceX,
                y: $defenceY,
                z: $defenceZ,
                reply_id: "0",
                action: "send_message",
                folder: ""
            },
            function(data, status) {
                alert("Recall mail sent to " + $defenceX + ":" + $defenceY + ":" + $defenceZ);
            });
        }
        function addUnitScanStats() {
            var scanType = $j('#scan').find('h2').html(); //Get the scan type from the header
            var wantedScan = 'Unit Scan'; //This is the scan type we are interested in
            var isTargetThreeStats = false; //This needs to be changed depending on the round, if it has three tier targeting set it to true

            if (scanType.indexOf(wantedScan) !== -1) {
                var shipsTable = document.getElementsByTagName("table");

                var row = $j("<tr></tr>"),
                    col1 = $j('<th class="left">Ship</th>'),
                    col2 = $j('<th class="left">Class</th>'),
                    col3 = $j('<th class="left">Init</th>'),
                    col4 = $j('<th class="left">Type</th>'),
                    col5 = $j('<th class="left">T1</th>'),
                    col6 = $j('<th class="left">T2</th>'),
                    col7 = $j('<th class="left">T3</th>'),
                    col8 = $j('<th class="right">Amount</th>');
                row.append(col1, col2, col3, col4, col5, col6, col7, col8).prependTo(shipsTable);

                $j(shipsTable).find('tr td:nth-child(1)').each(function (data) {
                    var shipName = $j(this).html();

                    $j(this).parent().attr("id","id_" + shipName);

                    $j(this).after('<td class="left" id="' + shipName + '_class'
                                  + '">Init</td><td class="left" id="' + shipName + '_init'
                                  + '">Type</td><td class="left" id="' + shipName + '_type'
                                  + '">Ship Class</td><td class="left" id="' + shipName + '_t1'
                                  + '">T1</td><td class="left" id="' + shipName + '_t2'
                                  + '">T2</td><td class="left" id="' + shipName + '_t3'
                                  + '">T3</td>');

                    $j.get("https://game.planetarion.com/manual.pl?page=stats", function (data, status) {
                        $j(data).find('table.stats_tbl tr').each(function () {

                            var shipStatName = $j(this).find('td:nth-child(1)').html(),
                                shipClass = $j(this).find('td:nth-child(2)').html(),
                                targetOne = $j(this).find('td:nth-child(3)').html(),
                                targetTwo = $j(this).find('td:nth-child(4)').html(),
                                shipInit,
                                damageType,
                                targetThree;

                            if (isTargetThreeStats === true) {
                                targetThree = $j(this).find('td:nth-child(5)').html();
                                damageType = $j(this).find('td:nth-child(6)').html();
                                shipInit = $j(this).find('td:nth-child(7)').html();
                            } else {
                                targetThree = "-";
                                damageType = $j(this).find('td:nth-child(5)').html();
                                shipInit = $j(this).find('td:nth-child(6)').html();
                            }

                            if (shipName === shipStatName) {

                                var cssClassName = $j(this).attr('class');
                                if (cssClassName !== undefined) {
                                    switch (cssClassName.toLowerCase()) {
                                        case "ter":
                                            var ter = document.getElementById("id_" + shipName);
                                            ter.style.color = '#000000';
                                            ter.style.backgroundColor = '#888888';
                                            ter.style.fontWeight = "bold";
                                            break;
                                        case "cat":
                                            var cat = document.getElementById("id_" + shipName);
                                            cat.style.color = '#FFFFFF';
                                            cat.style.backgroundColor = '#4444DD';
                                            cat.style.fontWeight = "bold";
                                            break;
                                        case "xan":
                                            var xan = document.getElementById("id_" + shipName);
                                            xan.style.color = '#FFFFFF';
                                            xan.style.backgroundColor = '#008000';
                                            xan.style.fontWeight = "bold";
                                            break;
                                        case "zik":
                                            var zik = document.getElementById("id_" + shipName);
                                            zik.style.color = '#FFFFFF';
                                            zik.style.backgroundColor = '#990000';
                                            zik.style.fontWeight = "bold";
                                            break;
                                        case "etd":
                                            var etd = document.getElementById("id_" + shipName);
                                            etd.style.color = '#000000';
                                            etd.style.backgroundColor = '#DDDDDD';
                                            etd.style.fontWeight = "bold";
                                            break;
                                        default:
                                    }
                                }

                                document.getElementById(shipName + '_class').innerHTML = shipClass;
                                document.getElementById(shipName + '_init').innerHTML = shipInit;
                                document.getElementById(shipName + '_type').innerHTML = damageType;
                                document.getElementById(shipName + '_t1').innerHTML = targetOne;
                                document.getElementById(shipName + '_t2').innerHTML = targetTwo;
                                document.getElementById(shipName + '_t3').innerHTML = targetThree;
                            }

                        });
                    });
                });

            }
        }
        function initAllianceFleetsLaunch() {
            var $isTargetThreeStats = false; //This needs to be changed depending on the round, if it has three tier targeting set it to true

            //Change the width of the container classes so that the new columns fit
            $j('#page').find('.container').each(function (data) {
                $j(this).css("width", "900px");
            });

            $j("#tablesort_0").each(function (data){
                $j(this).find('th:nth-child(4)').text('Ships');
                $j(this).find('th:nth-child(5)').text('ETA');
                $j(this).find('th:nth-child(6)').after('<th class="center" width="75">Ship</th><th class="center" width="75">Num</th><th class="center" width="50">Class</th><th class="center" width="50">T1</th><th class="center" width="50">T2</th><th class="center" width="50">T3</th>');

                $j(this).find('tr').each(function (data){

                    var $id, $onclick = $j(this).find('td:nth-child(4) a').attr('onclick');

                    if($onclick !== undefined){
                        var params = $onclick.split("dfleet(")[1].split(',');
                        params[params.length - 1] = params[params.length - 1].replace(')','');
                        $id = params[1];
                    }

                    $j(this).find('td:nth-child(6)').after('<td colspan="6" id="id_' + $id + '" class="center"></td>');

                    if( $id !== undefined) {
                        var $afShips = '<table border="0">';
                        $j.each(PA_dships[$id.toString().trim()],function(i,s) {
                            $afShips += '<tr><td class="center" width="75">' + s.name + '</td><td width="75" class="center">' + s.count + '</td><td width="50" class="' + s.name + '_class' +
                                '">class</td><td width="50" class="center ' + s.name + '_t1' +
                                '">T1</td><td width="50" class="center ' + s.name + '_t2' +
                                '">T2</td><td width="50" class="center ' + s.name + '_t3' +
                                '">T3</td></tr>'
                        });
                        $afShips += '</table>';
                        document.getElementById('id_' + $id).innerHTML = $afShips;
                    }

                    if( $id !== undefined) {
                        $j.each(PA_dships[$id.toString().trim()],function(i,s){

                            $j.get("https://game.planetarion.com/manual.pl?page=stats", function (data, status) {
                                $j(data).find('table.stats_tbl tr').each(function () {

                                    var $shipStatName = $j(this).find('td:nth-child(1)').html(),
                                        $shipClass = $j(this).find('td:nth-child(2)').html(),
                                        $targetOne = $j(this).find('td:nth-child(3)').html(),
                                        $targetTwo = $j(this).find('td:nth-child(4)').html(),
                                        $targetThree;

                                    if ($isTargetThreeStats === true) {
                                        $targetThree = $j(this).find('td:nth-child(5)').html();
                                    } else {
                                        $targetThree = "-";
                                    }

                                    if (s.name === $shipStatName) {

                                        var $sclass = document.getElementsByClassName(s.name + '_class'),
                                            $st1 = document.getElementsByClassName(s.name + '_t1'),
                                            $st2 = document.getElementsByClassName(s.name + '_t2'),
                                            $st3 = document.getElementsByClassName(s.name + '_t3');

                                        var i=0;

                                        for(i=0;i < $sclass.length; i++){
                                            $sclass[i].innerHTML = $shipClass;
                                        }

                                        for(i=0;i < $st1.length; i++){
                                            $st1[i].innerHTML = $targetOne;
                                        }

                                        for(i=0;i < $st2.length; i++){
                                            $st2[i].innerHTML = $targetTwo;
                                        }

                                        for(i=0;i < $st3.length; i++){
                                            $st3[i].innerHTML = $targetThree;
                                        }
                                    }
                                });
                            });
                        })
                    }
                });
            });
        }
    })(window);
    var tableSortIntel = {
        hcells: 0,
        order: [],
        compare: {
            alpha: function(d, c) {
                return d > c ? 1 : d < c ? -1 : 0
            },
            nocase: function(d, c) {
                return tableSortIntel.compare.alpha(d.toLowerCase(), c.toLowerCase())
            },
            numeric: function(d, c) {
                d = (Number(d) || 0);
                c = (Number(c) || 0);
                return d > c ? 1 : d < c ? -1 : 0
            },
            natural: function(d, c) {
                function e(a) {
                    var b = [];
                    a.replace(/(\D)|(\d+)/g, function(j, i, k) {
                        b.push(i ? 1 : 2);
                        b.push(i ? i.charCodeAt(0) : Number(k) + 1)
                    });
                    b.push(0);
                    return b
                }
                var g = e(d)
                , h = e(c)
                , f = 0;
                do {
                    if (g[f] != h[f]) {
                        return g[f] - h[f]
                    }
                } while (g[f++] > 0);return 0
            },
            date: function(d, c) {
                d = Date.parse(d);
                c = Date.parse(c);
                return d > c ? 1 : d < c ? -1 : 0
            },
            coords: function(e, d) {
                var c = e.match(/^(\d{1,3}):(\d{1,2}):(\d{1,3})$/);
                var f = d.match(/^(\d{1,3}):(\d{1,2}):(\d{1,3})$/);
                c[1] = Number(c[1]);
                c[2] = Number(c[2]);
                c[3] = Number(c[3]);
                f[1] = Number(f[1]);
                f[2] = Number(f[2]);
                f[3] = Number(f[3]);
                if (c[1] == f[1] && c[2] == f[2] && c[3] == f[3]) {
                    return 0
                } else {
                    if ((c[1] > f[1]) || (c[1] == f[1] && c[2] > f[2]) || (c[1] == f[1] && c[2] == f[2] && c[3] > f[3])) {
                        return 1
                    } else {
                        return -1
                    }
                }
            }
        },
        getType: function(a) {
            if (!isNaN(Number(a))) {
                return "numeric"
            }
            if (!isNaN(Date.parse(a))) {
                return "date"
            }
            if (a.match(/^(\d{1,3}):(\d{1,2}):(\d{1,3})$/)) {
                return "coords"
            }
            if (a.match(/^[a-z_]+\d+(\.\w+)$/)) {
                return "natural"
            }
            return "nocase"
        },
        sort: function(c) {
            var e = c.cellIndex;
            if ($(c).hasClass("tablesort_asc")) {
                tableSortIntel.order[e] = 1;
                $(c).removeClass("tablesort_asc").addClass("tablesort_desc")
            } else {
                tableSortIntel.order[e] = -1;
                $(c).removeClass("tablesort_desc").addClass("tablesort_asc")
            }
            var t = $(c).parents("table").get(0);
            var k = $(t).children("tbody").get(0);
            var u = $(k).children("tr");
            var l = u.size();
            var o = [];
            var b = [];
            var h = "";
            var q;
            for (var a = 0; a < l; a++) {
                b[a] = a;
                if (!$(u[a]).hasClass("static_row")) {
                    var s = $(u[a]).children();
                    if (s.size() == tableSortIntel.hcells.size()) {
                        var p = s.eq(e).contents(":not(.tooltip)").text().replace(/\,/g, "");
                        if (p) {
                            var n = tableSortIntel.getType(p);
                            if (n != "numeric" || h != "nocase") {
                                h = n
                            }
                            o[a] = p
                        }
                    }
                }
            }
            for (var g = 0; g < (l - 1); g++) {
                if (o[b[g]] !== undefined) {
                    for (var f = g; f < l; f++) {
                        if (o[b[f]] !== undefined) {
                            if (tableSortIntel.order[e] == tableSortIntel.compare[h](o[b[g]], o[b[f]])) {
                                q = b[g];
                                b[g] = b[f];
                                b[f] = q
                            }
                        }
                    }
                }
            }
            if ($(t).hasClass("tablesort_doublerows")) {
                q = [];
                for (var d = 0; d < l; d += 2) {
                    q.push(b[d]);
                    q[d + 1] = (b[d] + 1)
                }
                b = q
            }
            for (a = 0; a < l; a++) {
                k.appendChild(u[b[a]])
            }
        },
        init: function() {
            $("#inteltable").each(function(b) {
                if (this.id === "") {
                    this.id = "tablesort_" + b
                }
                var c = $(this).find("tbody").children("tr");
                var a = 0;
                c.each(function() {
                    a = Math.max(a, $(this).children().size())
                });
                var headerRow = $(this).find('tr').first();
                headerRow.addClass('static_row');
                var d = $(headerRow).children();
                if (d.size() == a) {
                    tableSortIntel.hcells = d;
                    d.not(".nosort").each(function() {
                        $(this).addClass("tablesort_asc");
                        $(this).click(function() {
                            tableSortIntel.sort(this)
                        })
                    });
                    return false
                }
            })
        }
    };
})();

